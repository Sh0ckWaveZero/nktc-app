import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { sortClassroomsByNumberAndDepartment } from '@utils/utils';
import { ClassroomData } from './entities';
import { 
  createXlsxImportService,
  extractCellValue,
  validateRequiredFields,
  XlsxImportConfig
} from '@common/utils/xlsx-import.utils';

/**
 * Service สำหรับจัดการข้อมูลห้องเรียน
 * ใช้ functional programming approach สำหรับการ import XLSX
 */
@Injectable()
export class ClassroomService {
  private xlsxImportService: any;

  constructor(private prisma: PrismaService) {}

  // =============================================================================
  // PUBLIC METHODS - XLSX IMPORT
  // =============================================================================

  /**
   * Import XLSX file สำหรับห้องเรียน
   */
  async importFromXlsx(file: Express.Multer.File, user: any) {
    return this.getXlsxImportService().importFromXlsx(file, user);
  }

  // =============================================================================
  // PUBLIC METHODS - CRUD OPERATIONS  
  // =============================================================================

  /**
   * ดึงข้อมูลห้องเรียนทั้งหมด
   */
  async findAll() {
    return await this.prisma.classroom.findMany({
      include: {
        level: true,
        program: true,
        department: true,
      },
      orderBy: [
        {
          department: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  /**
   * ดึงห้องเรียนตาม teacher ID
   */
  async findByTeacherId(id: string) {
    const teacherOnClassroom = await this.prisma.teacherOnClassroom.findMany({
      where: {
        teacherId: id,
      },
      select: {
        classroomId: true,
      },
    });
    const classroomIds =
      teacherOnClassroom.map((item: any) => item.classroomId) ?? [];

    return await this.prisma.classroom.findMany({
      where: {
        OR: classroomIds.map((item: any) => {
          return {
            id: item,
          };
        }),
      },
      orderBy: [
        {
          program: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  /**
   * ค้นหาห้องเรียนตามเงื่อนไข
   */
  async search(query: any) {
    const filter = {};
    if (query.name) {
      filter['name'] = {
        contains: query.name,
      };
    }

    const [classrooms, total] = await this.prisma.$transaction([
      this.prisma.classroom.findMany({
        where: filter,
        skip: query.skip || 0,
        take: query.take || 20,
        include: {
          level: true,
          program: true,
          department: true,
        },
        orderBy: [
          {
            department: {
              name: 'asc',
            },
          },
        ],
      }),
      this.prisma.classroom.count(),
    ]);

    const sortedClassrooms = sortClassroomsByNumberAndDepartment(classrooms);

    return {
      data: sortedClassrooms || [],
      total: total,
    };
  }

  /**
   * สร้างห้องเรียนใหม่
   */
  async create(data: any) {
    const {
      classroomId,
      name,
      levelId,
      classroomNumber,
      programId,
      departmentId,
      createdBy,
      updatedBy,
    } = data;
    const dateTimeInit = new Date();

    const classroom = await this.prisma.classroom.create({
      data: {
        classroomId,
        name,
        updatedAt: dateTimeInit,
        createdAt: dateTimeInit,
        createdBy: createdBy,
        updatedBy: updatedBy,
        level: {
          connect: {
            id: levelId,
          },
        },
        program: {
          connect: {
            id: programId,
          },
        },
        department: {
          connect: {
            id: departmentId,
          },
        },
      },
    });

    return classroom;
  }

  /**
   * ลบห้องเรียนตาม ID
   */
  async deleteById(id: string) {
    try {
      return await this.prisma.classroom.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      return error;
    }
  }

  // =============================================================================
  // PRIVATE METHODS - XLSX IMPORT HELPERS
  // =============================================================================

  /**
   * สร้าง XLSX import service โดยใช้ functional approach แบบ lazy loading
   */
  private getXlsxImportService() {
    if (!this.xlsxImportService) {
      this.xlsxImportService = createXlsxImportService<ClassroomData>({
        getImportConfig: () => ({
          columnMapping: {
            'id': 'รหัส',
            'name': 'ชื่อระดับชั้นเรียนสาขาวิชา',
            'level': 'ระดับชั้น',
            'roomNumber': 'เลขที่ห้องเรียน',
            'program': 'สาขาวิชา',
            'department': 'แผนกวิชา',
            'departmentId': 'รหัสแผนกวิชา'
          },
          requiredColumns: ['id', 'name', 'level', 'department'],
          entityName: 'ห้องเรียน',
        }),

        processRow: async (row, headerMap, config, user, rowNumber) => {
          const result = await this.extractAndValidateClassroomData(row, headerMap, config, user);
          if (typeof result === 'string') {
            return { error: result };
          }
          return { data: result };
        },

        createEntity: (data: ClassroomData) => this.createClassroomEntity(data),

        prisma: this.prisma
      });
    }
    return this.xlsxImportService;
  }

  // =============================================================================
  // PRIVATE METHODS - DATA PROCESSING
  // =============================================================================

  /**
   * Extract และ validate ข้อมูลห้องเรียนจากแถว XLSX
   */
  private async extractAndValidateClassroomData(
    row: any[],
    headerMap: Record<string, number>,
    config: XlsxImportConfig<ClassroomData>,
    user: any
  ): Promise<ClassroomData | string> {
    const extractedData = this.extractRowData(row, headerMap, config);
    
    const validationError = validateRequiredFields(
      { 
        classroomId: extractedData.classroomId, 
        name: extractedData.name, 
        level: extractedData.level, 
        department: extractedData.department 
      },
      ['classroomId', 'name', 'level', 'department']
    );

    if (validationError) {
      return validationError;
    }

    try {
      const levelRecord = await this.findLevelRecord(extractedData.level);
      if (!levelRecord) {
        return `ไม่พบระดับชั้น "${extractedData.level}" ในฐานข้อมูล`;
      }

      const programRecord = await this.findProgramRecord(extractedData.program);
      if (extractedData.program && !programRecord) {
        return `ไม่พบสาขาวิชา "${extractedData.program}" ในฐานข้อมูล`;
      }

      const departmentRecord = await this.findDepartmentRecord(extractedData.department, extractedData.deptId);
      if (!departmentRecord) {
        return `ไม่พบแผนกวิชา "${extractedData.department}" ในฐานข้อมูล`;
      }

      const existingClassroom = await this.checkClassroomExists(extractedData.classroomId);
      if (existingClassroom) {
        return `ห้องเรียนรหัส "${extractedData.classroomId}" มีอยู่ในระบบแล้ว`;
      }

      return this.buildClassroomData(extractedData, levelRecord, programRecord, departmentRecord, user);
    } catch (error) {
      return error.message || 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล';
    }
  }

  /**
   * Extract ข้อมูลจากแถว XLSX
   */
  private extractRowData(row: any[], headerMap: Record<string, number>, config: XlsxImportConfig<ClassroomData>) {
    return {
      classroomId: extractCellValue(row, headerMap, config.columnMapping, 'id'),
      name: extractCellValue(row, headerMap, config.columnMapping, 'name'),
      level: extractCellValue(row, headerMap, config.columnMapping, 'level'),
      classroomNumber: extractCellValue(row, headerMap, config.columnMapping, 'roomNumber'),
      program: extractCellValue(row, headerMap, config.columnMapping, 'program'),
      department: extractCellValue(row, headerMap, config.columnMapping, 'department'),
      deptId: extractCellValue(row, headerMap, config.columnMapping, 'departmentId')
    };
  }

  /**
   * สร้างข้อมูลห้องเรียนสำหรับการบันทึก
   */
  private buildClassroomData(
    extractedData: any,
    levelRecord: any,
    programRecord: any,
    departmentRecord: any,
    user: any
  ): ClassroomData {
    const description = `${extractedData.level} ${extractedData.classroomNumber || ''} ${extractedData.department}`.trim();
    
    return {
      classroomId: extractedData.classroomId,
      name: extractedData.name,
      description,
      levelId: levelRecord.id,
      programId: programRecord?.id,
      departmentId: departmentRecord.id,
      createdBy: user.username,
      updatedBy: user.username,
    };
  }

  // =============================================================================
  // PRIVATE METHODS - DATABASE QUERIES
  // =============================================================================

  /**
   * ค้นหา level record ในฐานข้อมูล
   */
  private async findLevelRecord(level: string) {
    return this.prisma.level.findFirst({
      where: {
        OR: [
          { levelName: level },
          { levelFullName: level },
          { levelId: level }
        ]
      },
    });
  }

  /**
   * ค้นหา program record ในฐานข้อมูล (ถ้ามี)
   */
  private async findProgramRecord(program: string) {
    if (!program) return null;
    
    return this.prisma.program.findFirst({
      where: {
        OR: [
          { name: program },
          { description: { contains: program } }
        ]
      },
    });
  }

  /**
   * ค้นหา department record ในฐานข้อมูล
   */
  private async findDepartmentRecord(department: string, deptId?: string) {
    return this.prisma.department.findFirst({
      where: {
        OR: [
          { name: department },
          { departmentId: deptId || department }
        ]
      },
    });
  }

  /**
   * ตรวจสอบว่าห้องเรียนมีอยู่ในระบบแล้วหรือไม่
   */
  private async checkClassroomExists(classroomId: string) {
    return this.prisma.classroom.findUnique({
      where: { classroomId },
    });
  }

  /**
   * สร้าง entity ห้องเรียนในฐานข้อมูล
   */
  private async createClassroomEntity(data: ClassroomData): Promise<any> {
    const dateTimeInit = new Date();
    
    const createData: any = {
      classroomId: data.classroomId,
      name: data.name,
      description: data.description,
      updatedAt: dateTimeInit,
      createdAt: dateTimeInit,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      level: {
        connect: { id: data.levelId },
      },
      department: {
        connect: { id: data.departmentId },
      },
    };

    if (data.programId) {
      createData.program = {
        connect: { id: data.programId },
      };
    }

    return this.prisma.classroom.create({ data: createData });
  }
}

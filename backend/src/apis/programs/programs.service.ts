import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { ProgramData } from './entities';
import {
  XlsxImportConfig,
  createXlsxImportService,
  extractCellValue,
  validateRequiredFields,
} from '@common/utils/xlsx-import.utils';

/**
 * Service สำหรับจัดการข้อมูลสาขาวิชา/หลักสูตร
 * ใช้ functional programming approach สำหรับการ import XLSX
 */
@Injectable()
export class ProgramsService {
  private xlsxImportService: any;

  constructor(private prisma: PrismaService) {}

  // =============================================================================
  // PUBLIC METHODS - XLSX IMPORT
  // =============================================================================

  /**
   * Import XLSX file สำหรับสาขาวิชา
   * @param file - ไฟล์ XLSX ที่จะ import
   * @param user - ผู้ใช้ที่ทำการ import
   * @returns ผลลัพธ์การ import
   */
  async importFromXlsx(file: Express.Multer.File, user: any) {
    return this.getXlsxImportService().importFromXlsx(file, user);
  }

  // =============================================================================
  // PUBLIC METHODS - CRUD OPERATIONS
  // =============================================================================

  /**
   * ดึงข้อมูลสาขาวิชาทั้งหมดจากฐานข้อมูล
   * จัดเรียงตามชื่อสาขาวิชาจาก A-Z
   *
   * @returns Promise ที่ resolve เป็น array ของสาขาวิชาทั้งหมด
   */
  async findAll() {
    return await this.prisma.program.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * ดึงข้อมูลสาขาวิชาตาม ID
   *
   * @param id - ID ของสาขาวิชาที่ต้องการค้นหา
   * @returns ข้อมูลสาขาวิชาที่พบ
   */
  async findOne(id: string) {
    try {
      const program = await this.prisma.program.findUnique({
        where: { id },
      });

      if (!program) {
        throw new Error('ไม่พบสาขาวิชาที่ต้องการค้นหา');
      }

      return program;
    } catch (error) {
      throw error;
    }
  }

  /**
   * อัพเดทข้อมูลสาขาวิชาตาม ID
   *
   * @param id - ID ของสาขาวิชาที่ต้องการอัพเดท
   * @param updateData - ข้อมูลที่ต้องการอัพเดท
   * @param username - ชื่อผู้ใช้ที่ทำการอัพเดท
   * @returns ข้อมูลสาขาวิชาหลังอัพเดท
   */
  async update(id: string, updateData: Partial<ProgramData>, username: string) {
    try {
      // ตรวจสอบว่าสาขาวิชามีอยู่จริงหรือไม่
      const program = await this.prisma.program.findUnique({
        where: { id },
      });

      if (!program) {
        throw new Error('ไม่พบสาขาวิชาที่ต้องการอัพเดท');
      }

      // อัพเดทข้อมูลสาขาวิชา
      return await this.prisma.program.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: username,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * ลบสาขาวิชาตาม ID
   * ตรวจสอบว่าสาขาวิชามีความสัมพันธ์กับข้อมูลอื่นก่อนลบ
   *
   * @param id - ID ของสาขาวิชาที่ต้องการลบ
   * @returns ผลลัพธ์การลบ
   */
  async remove(id: string) {
    try {
      // ตรวจสอบว่าสาขาวิชามีอยู่จริงหรือไม่
      const program = await this.prisma.program.findUnique({
        where: { id },
        include: {
          student: { select: { id: true } },
          classroom: { select: { id: true } },
          teacher: { select: { id: true } },
        },
      });

      if (!program) {
        throw new Error('ไม่พบสาขาวิชาที่ต้องการลบ');
      }

      // ตรวจสอบว่ามีข้อมูลที่เกี่ยวข้องหรือไม่
      if (program.student.length > 0) {
        throw new Error(
          'ไม่สามารถลบสาขาวิชาได้ เนื่องจากมีนักเรียนที่เชื่อมโยงกับสาขาวิชานี้',
        );
      }

      if (program.classroom.length > 0) {
        throw new Error(
          'ไม่สามารถลบสาขาวิชาได้ เนื่องจากมีห้องเรียนที่เชื่อมโยงกับสาขาวิชานี้',
        );
      }

      if (program.teacher.length > 0) {
        throw new Error(
          'ไม่สามารถลบสาขาวิชาได้ เนื่องจากมีครู/อาจารย์ที่เชื่อมโยงกับสาขาวิชานี้',
        );
      }

      // ลบสาขาวิชา
      return await this.prisma.program.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
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
      this.xlsxImportService = createXlsxImportService<ProgramData>({
        getImportConfig: () => ({
          columnMapping: {
            id: 'รหัส',
            name: 'ชื่อ',
            description: 'รายละเอียด',
          },
          requiredColumns: ['id', 'name'],
          entityName: 'สาขาวิชา',
        }),

        processRow: async (row, headerMap, config, user, rowNumber) => {
          const result = await this.extractAndValidateProgramData(
            row,
            headerMap,
            config,
            user,
          );
          if (typeof result === 'string') {
            return { error: result };
          }
          return { data: result };
        },

        createEntity: (data: ProgramData) => this.createProgramEntity(data),

        prisma: this.prisma,
      });
    }
    return this.xlsxImportService;
  }

  // =============================================================================
  // PRIVATE METHODS - DATA PROCESSING
  // =============================================================================

  /**
   * ดึงและ validate ข้อมูลสาขาวิชาจากแถว Excel
   * @private
   * @param row - แถวข้อมูลจาก Excel
   * @param headerMap - mapping header กับ index
   * @param config - configuration การ import
   * @param user - ผู้ใช้ที่ทำการ import
   * @returns ข้อมูลสาขาวิชาที่ validate แล้ว หรือข้อความ error
   */
  private async extractAndValidateProgramData(
    row: any[],
    headerMap: Record<string, number>,
    config: XlsxImportConfig<ProgramData>,
    user: any,
  ): Promise<ProgramData | string> {
    const programId = extractCellValue(
      row,
      headerMap,
      config.columnMapping,
      'id',
    );
    const name = extractCellValue(row, headerMap, config.columnMapping, 'name');
    const description =
      extractCellValue(row, headerMap, config.columnMapping, 'description') ||
      '';

    const validationError = validateRequiredFields({ programId, name }, [
      'programId',
      'name',
    ]);

    if (validationError) {
      return validationError;
    }

    const existingProgram = await this.checkProgramExists(programId);
    if (existingProgram) {
      return `สาขาวิชารหัส "${programId}" มีอยู่ในระบบแล้ว`;
    }

    return {
      programId,
      name,
      description,
      createdBy: user.username,
      updatedBy: user.username,
    };
  }

  // =============================================================================
  // PRIVATE METHODS - DATABASE QUERIES
  // =============================================================================

  /**
   * ตรวจสอบว่าสาขาวิชามีอยู่ในระบบแล้วหรือไม่
   * @private
   * @param programId - รหัสสาขาวิชาที่ต้องการตรวจสอบ
   * @returns สาขาวิชาที่พบ หรือ null
   */
  private async checkProgramExists(programId: string) {
    return this.prisma.program.findUnique({
      where: { programId },
    });
  }

  /**
   * สร้าง entity สาขาวิชาในฐานข้อมูล
   * @private
   * @param data - ข้อมูลสาขาวิชาที่จะสร้าง
   * @returns entity สาขาวิชาที่สร้างแล้ว
   */
  private async createProgramEntity(data: ProgramData): Promise<any> {
    const dateTimeInit = new Date();
    return this.prisma.program.create({
      data: {
        ...data,
        createdAt: dateTimeInit,
        updatedAt: dateTimeInit,
      },
    });
  }
}

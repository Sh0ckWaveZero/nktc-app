import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { ProgramData } from './entities';
import { 
  XlsxImportConfig, 
  ProcessRowResult,
  createXlsxImportService,
  createProcessRowFunction,
  extractCellValue,
  validateRequiredFields
} from '@common/utils/xlsx-import.utils';

/**
 * Service สำหรับจัดการข้อมูลโปรแกรม/หลักสูตร
 * ใช้ functional programming approach สำหรับการ import XLSX
 * 
 * @class ProgramsService
 */
@Injectable()
export class ProgramsService {
  private xlsxImportService;

  /**
   * สร้าง instance ของ ProgramsService
   * @param prisma - instance ของ Prisma service สำหรับการดำเนินการฐานข้อมูล
   */
  constructor(private prisma: PrismaService) {
    // สร้าง XLSX import service โดยใช้ functional approach
    this.xlsxImportService = createXlsxImportService<ProgramData>({
      getImportConfig: () => ({
        columnMapping: {
          'id': 'รหัส',
          'name': 'ชื่อ',
          'description': 'รายละเอียด',
        },
        requiredColumns: ['id', 'name'],
        entityName: 'โปรแกรม',
      }),

      processRow: async (row, headerMap, config, user, rowNumber) => {
        const result = await this.extractAndValidateProgramData(row, headerMap, config, user);
        if (typeof result === 'string') {
          return { error: result };
        }
        return { data: result };
      },

      createEntity: (data: ProgramData) => this.createProgramEntity(data),

      prisma: this.prisma
    });
  }

  /**
   * Import XLSX file สำหรับโปรแกรม
   * @param file - ไฟล์ XLSX ที่จะ import
   * @param user - ผู้ใช้ที่ทำการ import
   * @returns ผลลัพธ์การ import
   */
  async importFromXlsx(file: Express.Multer.File, user: any) {
    return this.xlsxImportService.importFromXlsx(file, user);
  }

  /**
   * ดึงข้อมูลโปรแกรมทั้งหมดจากฐานข้อมูล
   * จัดเรียงตามชื่อโปรแกรมจาก A-Z
   * 
   * @returns Promise ที่ resolve เป็น array ของโปรแกรมทั้งหมด
   */
  async findAll() {
    return await this.prisma.program.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * ดึงและ validate ข้อมูลโปรแกรมจากแถว Excel
   * @private
   * @param row - แถวข้อมูลจาก Excel
   * @param headerMap - mapping header กับ index
   * @param config - configuration การ import
   * @param user - ผู้ใช้ที่ทำการ import
   * @returns ข้อมูลโปรแกรมที่ validate แล้ว หรือข้อความ error
   */
  private async extractAndValidateProgramData(
    row: any[],
    headerMap: Record<string, number>,
    config: XlsxImportConfig<ProgramData>,
    user: any
  ): Promise<ProgramData | string> {
    const programId = extractCellValue(row, headerMap, config.columnMapping, 'id');
    const name = extractCellValue(row, headerMap, config.columnMapping, 'name');
    const description = extractCellValue(row, headerMap, config.columnMapping, 'description') || '';

    // Validate required fields
    const validationError = validateRequiredFields(
      { programId, name },
      ['programId', 'name']
    );

    if (validationError) {
      return validationError;
    }

    // Check if program already exists
    const existingProgram = await this.prisma.program.findUnique({
      where: { programId },
    });

    if (existingProgram) {
      return `โปรแกรมรหัส "${programId}" มีอยู่ในระบบแล้ว`;
    }

    return {
      programId,
      name,
      description,
      createdBy: user.username,
      updatedBy: user.username,
    };
  }

  /**
   * สร้าง entity โปรแกรมในฐานข้อมูล
   * @private
   * @param data - ข้อมูลโปรแกรมที่จะสร้าง
   * @returns entity โปรแกรมที่สร้างแล้ว
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

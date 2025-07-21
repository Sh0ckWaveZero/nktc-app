import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import * as xlsx from 'node-xlsx';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Interface สำหรับ map header column XLSX จากภาษาอังกฤษเป็นไทย
 * @interface XlsxColumnMapping
 */
export interface XlsxColumnMapping {
  readonly [englishColumn: string]: string; // map English -> Thai
}

/**
 * Interface การกำหนดค่าสำหรับกระบวนการ import XLSX
 * @interface XlsxImportConfig
 * @template T - ประเภทของ entity ที่กำลัง import
 */
export interface XlsxImportConfig<T> {
  readonly columnMapping: XlsxColumnMapping;
  readonly requiredColumns: readonly string[];
  readonly entityName: string;
  readonly skipHeaderRows?: number;
}

/**
 * Interface การ response สำหรับการ upload XLSX
 * @interface XlsxUploadResponse
 */
export interface XlsxUploadResponse {
  readonly importedCount: number;
  readonly messages: readonly string[];
  readonly errors: readonly string[];
  readonly success: boolean;
}

/**
 * Interface ผลลัพธ์สำหรับการประมวลผลแถวเดียว
 * @interface ProcessRowResult
 * @template T - ประเภทของ entity ที่กำลังประมวลผล
 */
export interface ProcessRowResult<T> {
  readonly data?: T;
  readonly error?: string;
}

/**
 * Type สำหรับฟังก์ชันประมวลผลแถว
 * @template T - ประเภทของข้อมูลที่ประมวลผล
 */
export type ProcessRowFunction<T> = (
  row: any[],
  headerMap: Record<string, number>,
  config: XlsxImportConfig<T>,
  user: any,
  rowNumber: number,
) => Promise<ProcessRowResult<T>>;

/**
 * Type สำหรับฟังก์ชันสร้าง entity
 * @template T - ประเภทของข้อมูลที่จะสร้าง
 */
export type CreateEntityFunction<T> = (data: T) => Promise<any>;

/**
 * Interface สำหรับ configuration ของ XLSX import service
 * @interface XlsxImportServiceConfig
 * @template T - ประเภทของ entity ที่กำลัง import
 */
export interface XlsxImportServiceConfig<T> {
  readonly getImportConfig: () => XlsxImportConfig<T>;
  readonly processRow: ProcessRowFunction<T>;
  readonly createEntity: CreateEntityFunction<T>;
  readonly prisma: PrismaService;
}

// =============================================================================
// PURE FUNCTIONS (ไม่มี side effects)
// =============================================================================

/**
 * ตรวจสอบความถูกต้องของไฟล์ที่อัปโหลด
 * @param file - ไฟล์ที่ถูกอัปโหลด
 * @throws {BadRequestException} เมื่อไฟล์ไม่ถูกต้อง
 */
export const validateFileUpload = (file: Express.Multer.File): void => {
  if (!file) {
    throw new BadRequestException(
      'ไม่พบไฟล์ที่อัปโหลด กรุณาตรวจสอบว่าคุณได้เลือกไฟล์และใช้ field name เป็น "file"',
    );
  }

  if (!file.buffer) {
    throw new BadRequestException(
      'ไฟล์ถูกอัปโหลดแต่ไม่มีข้อมูล buffer (ตรวจสอบการตั้งค่า memoryStorage)',
    );
  }
};

/**
 * แยกวิเคราะห์ไฟล์ XLSX และคืนค่าข้อมูล worksheet
 * @param file - ไฟล์ XLSX ที่จะแยกวิเคราะห์
 * @returns array 2 มิติของข้อมูล worksheet
 * @throws {BadRequestException} เมื่อไม่สามารถแยกวิเคราะห์ไฟล์ได้
 */
export const parseXlsxFile = (file: Express.Multer.File): any[][] => {
  const workbook = xlsx.parse(file.buffer);

  if (!workbook || workbook.length === 0) {
    throw new BadRequestException(
      'ไม่สามารถอ่านข้อมูลจากไฟล์ Excel ได้ กรุณาตรวจสอบรูปแบบไฟล์',
    );
  }

  const sheet = workbook[0];

  if (!sheet || !sheet.data || !Array.isArray(sheet.data)) {
    throw new BadRequestException(
      'ไฟล์ Excel ไม่มีข้อมูลหรือมีรูปแบบไม่ถูกต้อง',
    );
  }

  return sheet.data;
};

/**
 * ตรวจสอบโครงสร้างของไฟล์ว่ามีข้อมูลเพียงพอ
 * @param rows - แถวข้อมูลที่แยกวิเคราะห์แล้ว
 * @param config - การกำหนดค่าการ import
 * @throws {BadRequestException} เมื่อโครงสร้างไฟล์ไม่ถูกต้อง
 */
export const validateFileStructure = <T>(
  rows: any[][],
  config: XlsxImportConfig<T>,
): void => {
  const minRows = (config.skipHeaderRows || 2) + 1;
  if (rows.length < minRows) {
    throw new BadRequestException(
      `ไฟล์ที่อัปโหลดว่างเปล่าหรือมีข้อมูลไม่เพียงพอ (ต้องการอย่างน้อย ${minRows} แถว รวมหัวตาราง)`,
    );
  }

  if (!rows[1] || !Array.isArray(rows[1])) {
    throw new BadRequestException('ไม่พบแถวหัวตาราง หรือรูปแบบไม่ถูกต้อง');
  }
};

/**
 * ตรวจสอบว่า header มีคอลัมน์ที่จำเป็นครบถ้วน
 * @param headerRow - แถว header
 * @param config - การกำหนดค่าการ import
 * @throws {BadRequestException} เมื่อขาดคอลัมน์ที่จำเป็น
 */
export const validateHeader = <T>(
  headerRow: string[],
  config: XlsxImportConfig<T>,
): void => {
  const requiredThaiColumns = config.requiredColumns.map(
    (col) => config.columnMapping[col],
  );

  const missingColumns = requiredThaiColumns.filter(
    (col) => !headerRow.includes(col),
  );

  if (missingColumns.length > 0) {
    throw new BadRequestException(
      `ไม่พบคอลัมน์ที่จำเป็น: ${missingColumns.join(', ')}`,
    );
  }
};

/**
 * สร้าง mapping ระหว่าง header กับ index
 * @param headerRow - แถว header
 * @returns object ที่ map ชื่อ column กับ index
 */
export const createHeaderMap = (
  headerRow: string[],
): Record<string, number> => {
  const headerMap: Record<string, number> = {};
  headerRow.forEach((header, index) => {
    if (header) {
      headerMap[header as string] = index;
    }
  });
  return headerMap;
};

/**
 * ตรวจสอบว่าแถวว่างหรือไม่
 * @param row - แถวที่จะตรวจสอบ
 * @returns true หากแถวว่าง
 */
export const isEmptyRow = (row: any[]): boolean => {
  return (
    !row ||
    row.length === 0 ||
    row.every((cell) => cell === null || cell === '' || cell === undefined)
  );
};

/**
 * ดึงค่าจาก cell โดยใช้ column mapping
 * @param row - แถวข้อมูล
 * @param headerMap - mapping ระหว่าง header กับ index
 * @param columnMapping - mapping ระหว่าง column ภาษาอังกฤษกับไทย
 * @param englishColumn - ชื่อ column ภาษาอังกฤษ
 * @returns ค่าใน cell หรือ undefined
 */
export const extractCellValue = (
  row: any[],
  headerMap: Record<string, number>,
  columnMapping: XlsxColumnMapping,
  englishColumn: string,
): string | undefined => {
  const thaiColumn = columnMapping[englishColumn];
  if (!thaiColumn) return undefined;

  const columnIndex = headerMap[thaiColumn];
  if (columnIndex === undefined) return undefined;

  const cellValue = row[columnIndex];
  return cellValue !== null && cellValue !== undefined
    ? cellValue.toString().trim()
    : undefined;
};

/**
 * ตรวจสอบว่าข้อมูลมี required fields ครบถ้วน
 * @param data - ข้อมูลที่จะตรวจสอบ
 * @param requiredFields - array ของ field ที่จำเป็น
 * @returns ข้อความ error หากขาดข้อมูล หรือ null หากครบถ้วน
 */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[],
): string | null => {
  const missingFields = requiredFields.filter(
    (field) =>
      !data[field] ||
      (typeof data[field] === 'string' && data[field].trim() === ''),
  );

  if (missingFields.length > 0) {
    return `ข้อมูลที่จำเป็นไม่ครบถ้วน (${missingFields.join(', ')})`;
  }

  return null;
};

/**
 * สร้าง response object สำหรับผลลัพธ์การ import
 * @param result - array ของ entity ที่สร้างสำเร็จ
 * @param errors - array ของข้อความ error
 * @param entityName - ชื่อ entity สำหรับข้อความ
 * @returns response object ที่จัดรูปแบบแล้ว
 */
export const buildResponse = (
  result: any[],
  errors: string[],
  entityName: string,
): XlsxUploadResponse => {
  const messages: string[] = [];

  if (result.length > 0) {
    messages.push(`นำเข้า${entityName}สำเร็จ ${result.length} รายการ`);
  }

  if (errors.length > 0) {
    messages.push(`มีข้อผิดพลาด ${errors.length} รายการที่ไม่สามารถนำเข้าได้`);
  }

  if (result.length === 0) {
    messages.push(`ไม่พบข้อมูล${entityName}ที่สามารถนำเข้าได้`);
  }

  return {
    importedCount: result.length,
    messages,
    errors,
    success: result.length > 0,
  };
};

// =============================================================================
// HIGHER-ORDER FUNCTIONS (เอาฟังก์ชันมาประกอบกัน)
// =============================================================================

/**
 * ประมวลผลแถวข้อมูลทั้งหมดจากไฟล์ XLSX
 * @param dataRows - แถวข้อมูลที่จะประมวลผล
 * @param headerRow - แถว header สำหรับ mapping
 * @param config - การกำหนดค่าการ import
 * @param user - ผู้ใช้ที่ทำการ import
 * @param processRowFn - ฟังก์ชันสำหรับประมวลผลแถวเดียว
 * @returns object ที่มีข้อมูลที่ถูกต้องและข้อผิดพลาด
 */
export const processDataRows = async <T>(
  dataRows: any[][],
  headerRow: string[],
  config: XlsxImportConfig<T>,
  user: any,
  processRowFn: ProcessRowFunction<T>,
): Promise<{ validData: T[]; errors: string[] }> => {
  const validData: T[] = [];
  const errors: string[] = [];
  const headerMap = createHeaderMap(headerRow);

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i] as any[];
    const rowNumber = i + (config.skipHeaderRows || 2) + 1;

    // Skip empty rows
    if (isEmptyRow(row)) {
      continue;
    }

    try {
      const result = await processRowFn(
        row,
        headerMap,
        config,
        user,
        rowNumber,
      );

      if (result.data) {
        validData.push(result.data);
      } else if (result.error) {
        errors.push(`Row ${rowNumber}: ${result.error}`);
      }
    } catch (error) {
      errors.push(
        `Row ${rowNumber}: ${error.message || 'Unknown error processing row'}`,
      );
    }
  }

  return { validData, errors };
};

/**
 * สร้าง entity ทั้งหมดใน transaction เดียว
 * @param validData - ข้อมูลที่ผ่านการ validate แล้ว
 * @param prisma - Prisma service instance
 * @param createEntityFn - ฟังก์ชันสำหรับสร้าง entity
 * @returns array ของ entity ที่สร้างแล้ว
 */
export const createEntitiesInTransaction = async <T>(
  validData: T[],
  prisma: PrismaService,
  createEntityFn: CreateEntityFunction<T>,
): Promise<any[]> => {
  if (validData.length === 0) {
    return [];
  }

  return await prisma.$transaction(async (prismaClient) => {
    const results: any[] = [];
    for (const data of validData) {
      const result = await createEntityFn(data);
      results.push(result);
    }
    return results;
  });
};

/**
 * Main function สำหรับ import XLSX - ใช้ function composition
 * @param file - ไฟล์ที่ถูก upload
 * @param user - ผู้ใช้ที่ทำการ import
 * @param serviceConfig - configuration สำหรับ service
 * @returns response object ที่มีผลลัพธ์การ import
 */
export const importFromXlsx = async <T>(
  file: Express.Multer.File,
  user: any,
  serviceConfig: XlsxImportServiceConfig<T>,
): Promise<XlsxUploadResponse> => {
  const config = serviceConfig.getImportConfig();

  try {
    // Step 1: Validate and parse file
    validateFileUpload(file);
    const rows = parseXlsxFile(file);
    validateFileStructure(rows, config);

    // Step 2: Validate header
    const headerRow = rows[1] as string[];
    validateHeader(headerRow, config);

    // Step 3: Process data rows
    const dataRows = rows.slice(config.skipHeaderRows || 2);
    const { validData, errors } = await processDataRows(
      dataRows,
      headerRow,
      config,
      user,
      serviceConfig.processRow,
    );

    // Step 4: Create entities in transaction
    const result = await createEntitiesInTransaction(
      validData,
      serviceConfig.prisma,
      serviceConfig.createEntity,
    );

    // Step 5: Build response
    return buildResponse(result, errors, config.entityName);
  } catch (error) {
    throw new BadRequestException(
      error.message ||
        `เกิดข้อผิดพลาดในการประมวลผลไฟล์ XLSX สำหรับ ${config.entityName}`,
    );
  }
};

// =============================================================================
// FACTORY FUNCTIONS (สำหรับสร้าง service instances)
// =============================================================================

/**
 * Factory function สำหรับสร้าง XLSX import service
 * ใช้ Higher-order function pattern แทน class inheritance
 *
 * @param serviceConfig - configuration object ที่มีฟังก์ชันที่จำเป็น
 * @returns service object ที่มี import method และ utility functions
 *
 * @example
 * ```typescript
 * const xlsxImportService = createXlsxImportService({
 *   getImportConfig: () => ({
 *     columnMapping: { 'id': 'รหัส', 'name': 'ชื่อ' },
 *     requiredColumns: ['id', 'name'],
 *     entityName: 'โปรแกรม'
 *   }),
 *   processRow: async (row, headerMap, config, user, rowNumber) => {
 *     // process row logic
 *   },
 *   createEntity: async (data) => {
 *     // create entity logic
 *   },
 *   prisma
 * });
 *
 * // ใช้งาน
 * const result = await xlsxImportService.importFromXlsx(file, user);
 * ```
 */
export const createXlsxImportService = <T>(
  serviceConfig: XlsxImportServiceConfig<T>,
) => {
  return {
    /**
     * Import XLSX file และประมวลผลข้อมูล
     * @param file - ไฟล์ที่จะ import
     * @param user - ผู้ใช้ที่ทำการ import
     * @returns ผลลัพธ์การ import
     */
    importFromXlsx: (file: Express.Multer.File, user: any) =>
      importFromXlsx(file, user, serviceConfig),

    /**
     * Utility functions ที่สามารถใช้แยกได้
     */
    utils: {
      extractCellValue,
      validateRequiredFields,
      createHeaderMap,
      isEmptyRow,
      buildResponse,
      validateFileUpload,
      parseXlsxFile,
      validateFileStructure,
      validateHeader,
    },
  };
};

/**
 * Helper function สำหรับสร้าง process row function ที่ใช้ utility functions
 * @param extractAndValidateDataFn - ฟังก์ชันสำหรับดึงและ validate ข้อมูล
 * @returns process row function ที่สามารถใช้กับ createXlsxImportService ได้
 */
export const createProcessRowFunction = <T>(
  extractAndValidateDataFn: (
    row: any[],
    headerMap: Record<string, number>,
    config: XlsxImportConfig<T>,
    user: any,
    rowNumber: number,
  ) => T | string,
): ProcessRowFunction<T> => {
  return async (row, headerMap, config, user, rowNumber) => {
    try {
      const result = extractAndValidateDataFn(
        row,
        headerMap,
        config,
        user,
        rowNumber,
      );

      if (typeof result === 'string') {
        return { error: result };
      }

      return { data: result };
    } catch (error) {
      return { error: error.message || 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล' };
    }
  };
};

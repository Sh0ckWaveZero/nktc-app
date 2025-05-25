import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from '../../common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';
import { isEmpty, isValidHttpUrl } from '../../utils/utils';
import { StudentData } from './entities';
import {
  createXlsxImportService,
  extractCellValue,
  validateRequiredFields,
  XlsxImportConfig
} from '../../common/utils/xlsx-import.utils';
import {
  createByAdmin,
  getClassroomId,
  getProgramId,
  getLevelByName,
  getLevelClassroomByName,
} from '../../utils/utils';
import * as xlsx from 'node-xlsx';

@Injectable()
export class StudentsService {
  private xlsxImportService: any;

  constructor(
    private prisma: PrismaService,
    private readonly minioService: MinioClientService,
  ) { }

  async findBucket() {
    try {
      const buckets = await this.minioService.client.listBuckets().catch((err) => {
        console.log(err);
        return [];
      });
      console.log('buckets :', buckets);

      const data = [];
      const stream = this.minioService.client.listObjects('nktc-app', '', true);
      stream.on('data', function (obj) {
        data.push(obj);
      });
      stream.on('end', function () {
        console.log('data :', data);
        return data;
      });
      stream.on('error', function (err) {
        console.log(err);
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findWithParams(body: any) {
    try {
      const filter = {};

      if (body?.search?.fullName) {
        const [firstName, lastName] = body.search.fullName.split(' ');

        filter['account'] = {
          AND: [
            {
              firstName: {
                contains: firstName,
              },
            },
            {
              lastName: {
                contains: lastName ? lastName : firstName,
              },
            },
          ],
        };
      }

      if (body?.search?.studentId) {
        filter['username'] = {
          contains: body.search.studentId,
        };
      }

      if (body?.classroomId) {
        filter['student'] = {
          classroomId: body.classroomId,
        };
      }

      if (isEmpty(filter)) {
        return [];
      }

      const result = await this.prisma.user.findMany({
        where: filter,
        select: {
          id: true,
          username: true,
          student: {
            select: {
              id: true,
              studentId: true,
              classroomId: true,
              departmentId: true,
              programId: true,
              levelId: true,
              levelClassroomId: true,
              status: true,
              classroom: {
                select: {
                  name: true,
                },
              },
            },
          },
          account: {
            select: {
              id: true,
              title: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: [
          {
            student: {
              studentId: 'asc',
            },
          },
          {
            account: {
              firstName: 'asc',
            },
          },
          {
            account: {
              lastName: 'asc',
            },
          },
        ],
      });

      return result;
    } catch (error) {
      return [];
    }
  }

  async createProfile(id: string, body: any) {
    const checkExisting = await this.prisma.student.findFirst({
      where: {
        studentId: body.studentId,
      },
    });

    if (checkExisting) {
      throw new Error('รหัสนักเรียนนี้มีอยู่ในระบบแล้ว');
    }

    const password = await hash(body.studentId.toString(), 12);

    await this.prisma.user.create({
      data: {
        username: body.studentId.toString(),
        password: password,
        role: 'Student',
        updatedBy: id,
        createdBy: id,
        account: {
          create: {
            title: body.title,
            firstName: body.firstName,
            lastName: body.lastName,
            birthDate: body.birthDate,
            idCard: body.idCard,
            addressLine1: body.addressLine1,
            subdistrict: body.subdistrict,
            district: body.district,
            province: body.province,
            postcode: body.postalCode,
            phone: body.phone,
            updatedBy: id,
            createdBy: id,
          },
        },
        student: {
          create: {
            studentId: body.studentId,
            classroomId: body.classroom,
            status: body.status,
            updatedBy: id,
            createdBy: id,
            levelId: body.level,
            levelClassroomId: body.levelClassroom,
          },
        },
      },
    });
    return {
      message: 'เพิ่มข้อมูลนักเรียนเรียบร้อยแล้ว',
    };
  }

  async updateProfile(id: string, body: any) {
    let avatar: any = '';
    try {
      if (body.avatar) {
        const isUrl = isValidHttpUrl(body.avatar);
        if (isUrl) {
          avatar = body.avatar;
        } else {
          const { url } = await this.minioService.upload({
            data: body.avatar,
            path: 'avatars/students/',
          });
          avatar = url;
        }
      }
      const res = await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          updatedBy: id,
          account: {
            update: {
              title: body.title,
              firstName: body.firstName,
              lastName: body.lastName,
              birthDate: body.birthDate,
              idCard: body.idCard,
              addressLine1: body.addressLine1,
              subdistrict: body.subdistrict,
              district: body.district,
              province: body.province,
              postcode: body.postalCode,
              updatedBy: id,
              phone: body.phone,
              avatar: avatar,
            },
          },
          student: {
            update: {
              classroomId: body.classroom,
              departmentId: body.department,
              programId: body.program,
              status: body.status,
              updatedBy: id,
            },
          },
        },
      });

      return res;
    } catch (error) {
      return error;
    }
  }

  deleteStudent(id: string) {
    // check if student has any related data
    const checkRelatedData = this.prisma.student.findFirst({
      where: {
        id,
      },
    });

    if (!checkRelatedData) {
      throw new Error(
        'ไม่สามารถลบข้อมูลนักเรียนได้ เนื่องจากมีข้อมูลที่ไม่มีอยู่ในระบบแล้ว',
      );
    }

    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async list(query: any) {
    const filer = {};
    if (query.fullName) {
      const [firstName, lastName] = query.fullName.split(' ');

      if (firstName) {
        filer['account'] = {
          ['firstName']: {
            contains: firstName,
          },
        };
      }

      if (lastName) {
        filer['account'] = {
          ['lastName']: {
            contains: lastName,
          },
        };
      }
    }

    if (query.classroomId) {
      filer['student'] = {
        ['classroomId']: {
          contains: query.classroomId,
        },
      };
    }

    const students = await this.prisma.user.findMany({
      where: {
        ...filer,
        role: 'Student',
      },
      select: {
        id: true,
        username: true,
        student: {
          select: {
            id: true,
            studentId: true,
            classroom: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        account: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        {
          account: {
            firstName: 'asc',
          },
        },
        {
          account: {
            lastName: 'asc',
          },
        },
      ],
      skip: 0,
      take: 20,
    });

    return students.map((student) => {
      return {
        fullName: `${student.account.firstName} ${student.account.lastName}`,
        title: student.account.title,
        id: student.student.id,
        studentId: student.username,
        classroom: student.student.classroom,
      };
    });
  }

  async search(query: any) {
    const filer = {};
    if (query.fullName) {
      const [firstName, lastName] = query.fullName.split(' ');

      if (firstName) {
        filer['account'] = {
          ['firstName']: {
            contains: firstName,
          },
        };
      }

      if (lastName) {
        filer['account'] = {
          ['lastName']: {
            contains: lastName,
          },
        };
      }
    }

    if (query.studentId) {
      filer['username'] = { contains: query.studentId };
    }

    if (isEmpty(filer)) {
      return [];
    }

    return await this.prisma.user.findMany({
      where: {
        ...filer,
        role: 'Student',
      },
      select: {
        id: true,
        username: true,
        student: {
          select: {
            id: true,
            studentId: true,
            classroomId: true,
            departmentId: true,
            programId: true,
            levelId: true,
            levelClassroomId: true,
            status: true,
            classroom: {
              select: {
                name: true,
              },
            },
            goodnessIndividual: {
              select: {
                id: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
            badnessIndividual: {
              select: {
                id: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
        account: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        {
          account: {
            firstName: 'asc',
          },
        },
        {
          account: {
            lastName: 'asc',
          },
        },
      ],
    });
  }

  async getTrophyOverview(id: string) {
    // get student goodness and badness
    const student = await this.prisma.student.findFirst({
      where: {
        id,
      },
      select: {
        goodnessIndividual: {
          select: {
            goodnessScore: true,
          },
        },
        badnessIndividual: {
          select: {
            badnessScore: true,
          },
        },
      },
    });

    const goodScore = student.goodnessIndividual.reduce(
      (a, b) => a + b.goodnessScore,
      0,
    );
    const badScore = student.badnessIndividual.reduce(
      (a, b) => a + b.badnessScore,
      0,
    );

    return {
      totalTrophy: Math.floor((goodScore - badScore) / 100),
      goodScore,
      badScore,
    };
  }

  async getTeacherClassroom(id: string) {
    const teacherIds = await this.prisma.teacherOnClassroom.findMany({
      where: {
        classroomId: id,
      },
      select: {
        teacherId: true,
      },
    });

    const teachers = await Promise.all(
      teacherIds.map((teacherId) => {
        return this.prisma.user.findFirst({
          where: {
            teacher: {
              id: teacherId.teacherId,
            },
          },
          select: {
            id: true,
            username: true,
            account: {
              select: {
                id: true,
                title: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        });
      }),
    );

    return teachers;
  }

  // =============================================================================
  // XLSX IMPORT METHODS
  // =============================================================================

  /**
   * Import XLSX file สำหรับนักเรียน
   * @param file - ไฟล์ XLSX ที่จะ import
   * @param user - ผู้ใช้ที่ทำการ import
   * @returns ผลลัพธ์การ import
   */
  async importFromXlsx(file: Express.Multer.File, user: any) {
    return this.getXlsxImportService().importFromXlsx(file, user);
  }

  /**
   * สร้าง XLSX import service โดยใช้ functional approach แบบ lazy loading
   */
  private getXlsxImportService() {
    if (!this.xlsxImportService) {
      this.xlsxImportService = createXlsxImportService<StudentData>({
        getImportConfig: () => ({
          columnMapping: {
            'idCard': 'เลขประจำตัวประชาชน',
            'studentId': 'รหัสประจำตัว',
            'levelClassroom': 'กลุ่มเรียน',
            'title': 'คำนำหน้าชื่อ',
            'firstName': 'ชื่อ (ไทย)',
            'lastName': 'นามสกุล (ไทย)',
            'departmentName': 'แผนก',
            'programName': 'สาขาวิชา',
            'studentType': 'ประเภทนักเรียน',
          },
          requiredColumns: ['studentId', 'firstName', 'lastName'],
          entityName: 'นักเรียน',
        }),

        processRow: async (row, headerMap, config, user, rowNumber) => {
          const result = await this.extractAndValidateStudentData(row, headerMap, config, user);
          if (typeof result === 'string') {
            return { error: result };
          }
          return { data: result };
        },

        createEntity: (data: StudentData) => this.createStudentEntity(data),

        prisma: this.prisma
      });
    }
    return this.xlsxImportService;
  }

  /**
   * Extract และ validate ข้อมูลนักเรียนจากแถว XLSX
   */
  private async extractAndValidateStudentData(
    row: any[],
    headerMap: Record<string, number>,
    config: XlsxImportConfig<StudentData>,
    user: any
  ): Promise<StudentData | string> {
    const extractedData = this.extractRowData(row, headerMap, config);

    const validationError = validateRequiredFields(
      {
        studentId: extractedData.studentId,
        firstName: extractedData.firstName,
        lastName: extractedData.lastName
      },
      ['studentId', 'firstName', 'lastName']
    );

    if (validationError) {
      return validationError;
    }

    try {
      // ตรวจสอบว่านักเรียนมีอยู่ในระบบแล้วหรือไม่
      const existingStudent = await this.checkStudentExists(extractedData.studentId);
      if (existingStudent) {
        return `นักเรียนรหัส "${extractedData.studentId}" มีอยู่ในระบบแล้ว`;
      }

      // ตรวจสอบและหา levelClassroomId
      let levelClassroomId = null;
      if (extractedData.levelClassroom) {
        try {
          levelClassroomId = await getLevelClassroomByName(extractedData.levelClassroom);
        } catch (error) {
          console.log(`Cannot find levelClassroom: ${extractedData.levelClassroom}`);
        }
      }

      // กำหนด levelName จาก levelClassroom
      let levelName: 'ปวช.' | 'ปวส.' = 'ปวช.';
      if (extractedData.levelClassroom && extractedData.levelClassroom.includes('ปวส')) {
        levelName = 'ปวส.';
      }

      // ค้นหา level
      let levelConnection = null;
      try {
        levelConnection = await getLevelByName(levelName);
      } catch (error) {
        console.log(`Cannot find level: ${levelName}`);
      }

      // ค้นหา department
      const departmentRecord = await this.findDepartmentRecord(extractedData.departmentName);

      // ค้นหา program
      let programId = null;
      if (extractedData.programName && levelConnection?.level?.connect?.id && departmentRecord) {
        try {
          programId = await getProgramId(
            levelConnection.level.connect.id,
            extractedData.programName,
            extractedData.studentType || 'ปกติ'
          );
        } catch (error) {
          console.log(`Cannot find program: ${extractedData.programName}`);
        }
      }

      // ค้นหา classroom
      let classroomId = null;
      if (extractedData.levelClassroom && extractedData.departmentName) {
        try {
          classroomId = await getClassroomId(
            extractedData.levelClassroom,
            extractedData.departmentName,
            extractedData.studentType || '',
            extractedData.programName || '',
          );


        } catch (error) {
          console.log(`Cannot find classroom for: ${extractedData.levelClassroom}`);
        }
      }

      return this.buildStudentData(
        extractedData,
        levelClassroomId,
        levelConnection?.level?.connect?.id,
        departmentRecord?.id,
        programId,
        classroomId,
        user
      );

    } catch (error) {
      return error.message || 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล';
    }
  }

  /**
   * Extract ข้อมูลจากแถว XLSX
   */
  private extractRowData(row: any[], headerMap: Record<string, number>, config: XlsxImportConfig<StudentData>) {
    return {
      idCard: extractCellValue(row, headerMap, config.columnMapping, 'idCard'),
      studentId: extractCellValue(row, headerMap, config.columnMapping, 'studentId'),
      levelClassroom: extractCellValue(row, headerMap, config.columnMapping, 'levelClassroom'),
      title: extractCellValue(row, headerMap, config.columnMapping, 'title'),
      firstName: extractCellValue(row, headerMap, config.columnMapping, 'firstName'),
      lastName: extractCellValue(row, headerMap, config.columnMapping, 'lastName'),
      departmentName: extractCellValue(row, headerMap, config.columnMapping, 'departmentName'),
      programName: extractCellValue(row, headerMap, config.columnMapping, 'programName'),
      studentType: extractCellValue(row, headerMap, config.columnMapping, 'studentType')
    };
  }

  /**
   * สร้างข้อมูลนักเรียนสำหรับการบันทึก
   */
  private buildStudentData(
    extractedData: any,
    levelClassroomId: string | null,
    levelId: string | null,
    departmentId: string | null,
    programId: string | null,
    classroomId: string | null,
    user: any
  ): StudentData {
    return {
      idCard: extractedData.idCard || '',
      studentId: extractedData.studentId,
      levelClassroom: extractedData.levelClassroom || '',
      title: extractedData.title || '',
      firstName: extractedData.firstName,
      lastName: extractedData.lastName,
      departmentName: extractedData.departmentName || '',
      programName: extractedData.programName || '',
      studentType: extractedData.studentType || 'ปกติ',
      levelClassroomId,
      levelId,
      departmentId,
      programId,
      classroomId,
      createdBy: user.username,
      updatedBy: user.username,
    };
  }

  /**
   * ค้นหา department record ในฐานข้อมูล
   */
  private async findDepartmentRecord(departmentName: string) {
    if (!departmentName) return null;

    return this.prisma.department.findFirst({
      where: {
        OR: [
          { name: departmentName },
          { name: { contains: departmentName } }
        ]
      },
    });
  }

  /**
   * ตรวจสอบว่านักเรียนมีอยู่ในระบบแล้วหรือไม่
   */
  private async checkStudentExists(studentId: string) {
    return this.prisma.student.findUnique({
      where: { studentId },
    });
  }

  /**
   * สร้าง entity นักเรียนในฐานข้อมูล
   */
  private async createStudentEntity(data: StudentData): Promise<any> {
    const password = await hash(data.idCard || data.studentId, 12);
    const admin = createByAdmin();

    // สร้างข้อมูล student สำหรับ transaction
    const studentData: any = {
      studentId: data.studentId,
      studentType: data.studentType || 'ปกติ',
      status: 'normal',
      ...admin,
    };

    // เพิ่ม relationship connections หากมีข้อมูล
    if (data.levelClassroomId) {
      studentData.levelClassroom = { connect: { id: data.levelClassroomId } };
    }

    if (data.classroomId) {
      studentData.classroom = { connect: { id: data.classroomId } };
    }

    if (data.programId) {
      studentData.program = { connect: { id: data.programId } };
    }

    if (data.levelId) {
      studentData.level = { connect: { id: data.levelId } };
    }

    if (data.departmentId) {
      studentData.department = { connect: { id: data.departmentId } };
    }

    // สร้าง User, Account และ Student ในการทำงานเดียวกัน
    return this.prisma.user.create({
      data: {
        username: data.studentId,
        password,
        role: 'Student',
        account: {
          create: {
            title: data.title,
            firstName: data.firstName,
            lastName: data.lastName,
            idCard: data.idCard || null,
            birthDate: null, // จะไม่มีวันเกิดจาก Excel
            ...admin,
          },
        },
        student: {
          create: studentData,
        },
        ...admin,
      },
    });
  }

  /**
   * ดาวน์โหลดไฟล์ Excel แม่แบบสำหรับการอัพโหลดข้อมูลนักเรียน
   */
  async downloadTemplate(res: any) {
    try {
      // สร้างข้อมูลตัวอย่างสำหรับ template
      const templateData = [
        // Header row 1 - คำอธิบาย
        [
          'แม่แบบการนำเข้าข้อมูลนักเรียน - กรุณาใส่ข้อมูลในแถวที่ 3 เป็นต้นไป',
          '', '', '', '', '', '', '', ''
        ],
        // Header row 2 - ชื่อฟิลด์
        [
          'เลขประจำตัวประชาชน',
          'รหัสประจำตัว',
          'กลุ่มเรียน',
          'คำนำหน้าชื่อ',
          'ชื่อ (ไทย)',
          'นามสกุล (ไทย)',
          'แผนก',
          'สาขาวิชา',
          'ประเภทนักเรียน'
        ],
        // ข้อมูลตัวอย่าง
        [
          '1234567890123',
          '001001',
          'ปวช.1/1',
          'เด็กชาย',
          'สมชาย',
          'ใจดี',
          'วิทยาศาสตร์และเทคโนโลยี',
          'คอมพิวเตอร์ธุรกิจ',
          'ปกติ'
        ],
        [
          '1234567890124',
          '001002',
          'ปวช.1/2',
          'เด็กหญิง',
          'สมหญิง',
          'รักเรียน',
          'ศิลปศาสตร์',
          'การบัญชี',
          'ปกติ'
        ]
      ];

      // สร้าง buffer สำหรับไฟล์ Excel
      const buffer = xlsx.build([{
        name: 'Students',
        data: templateData,
        options: {}
      }]);

      // ตั้งค่า response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=student-template.xlsx');
      res.setHeader('Content-Length', buffer.length);

      // ส่งไฟล์
      res.send(buffer);
    } catch (err) {
      console.error('Error generating template:', err);
      throw new HttpException('ไม่สามารถสร้างไฟล์แม่แบบได้', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

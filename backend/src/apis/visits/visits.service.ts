import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { isEmpty } from '../../utils/utils';

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * รับข้อมูลการเข้าเยี่ยมชมของนักเรียนในห้องเรียนตาม classroomId, academicYear, visitNo
   *
   * @param {string} classroomId - รหัสห้องเรียน
   * @param {string} academicYear - ปีการศึกษา
   * @param {string} visitNo - ลำดับการเยี่ยมชม
   * @returns {Promise<any>} - รายชื่อนักเรียนและข้อมูลการเข้าเยี่ยมชม
   */
  async getVisits(
    classroomId: string,
    academicYear: string,
    visitNo: string,
  ): Promise<any> {
    // รับข้อมูลนักเรียนโดยใช้ classroomId
    const students = await this.prisma.user.findMany({
      where: {
        student: {
          classroomId: classroomId,
        },
      },
      select: {
        id: true,
        username: true,
        role: true,
        student: true,
        account: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    if (isEmpty(students)) {
      return {
        students: [],
      };
    }

    // รับข้อมูลการเข้าเยี่ยมชมโดยใช้ classroomId, academicYear, visitNo
    const visits = await this.prisma.visitStudent.findMany({
      where: {
        classroomId: classroomId,
        academicYear: academicYear,
        visitNo: Number(visitNo),
      },
    });

    const visitStudent = [];

    // Students ที่มีการเข้าเยี่ยมชม
    for (const student of students) {
      // ค้นหา student ที่ตรงกับ studentId ของ visit ใน students
      const visit = visits.find(
        (visit) => visit.studentId === student.student.id,
      );
      if (visit) {
        visitStudent.push({
          ...student,
          visit: visit,
        });
      } else {
        visitStudent.push({
          ...student,
          visit: null,
        });
      }
    }

    return {
      students: visitStudent,
    };
  }
}

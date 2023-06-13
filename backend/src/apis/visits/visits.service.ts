import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { isEmpty } from 'src/utils/utils';

@Injectable()
export class VisitsService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }


  /**
 * รับข้อมูลการเข้าเยี่ยมชมของนักเรียนในห้องเรียนตาม classroomId, academicYear, visitNo
 *
 * @param {string} classroomId - รหัสห้องเรียน
 * @param {string} academicYear - ปีการศึกษา
 * @param {string} visitNo - ลำดับการเยี่ยมชม
 * @returns {Promise<any>} - รายชื่อนักเรียนและข้อมูลการเข้าเยี่ยมชม
 */
  async getVisits(classroomId: string, academicYear: string, visitNo: string): Promise<any> {
    // รับข้อมูลนักเรียนโดยใช้ classroomId
    const students = await this.prisma.user.findMany({
      where: {
        student: {
          classroomId: classroomId,
        },
      },
      select: {
        username: true,
        role: true,
        student: true,
        account: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    // รับข้อมูลการเข้าเยี่ยมชมโดยใช้ classroomId, academicYear, visitNo
    const visits = await this.prisma.visitStudent.findMany({
      where: {
        classroomId: classroomId,
        academicYear: academicYear,
        visitNo: Number(visitNo),
      },
    });

    let visitStudent = [];

    if (!isEmpty(visits)) {
      // ถ้า visits ไม่ว่างเปล่า (มีข้อมูล)
      for (const visit of visits) {
        // วนลูปผ่านทุก visit ใน visits
        const student = students.find(student => student.student.id === visit.studentId);
        // ค้นหา student ที่ตรงกับ studentId ของ visit ใน students
        if (student) {
          // ถ้าพบ student
          visitStudent.push({
            ...student,
            visit: visit,
          });
          // เพิ่มข้อมูลเข้าไปใน visitStudent ในรูปแบบของ object ที่ประกอบด้วย student และ visit
        }
      }
    } else {
      // ถ้า visits ว่างเปล่า (ไม่มีข้อมูล)
      for (const student of students) {
        // วนลูปผ่านทุก student ใน students
        visitStudent.push({
          ...student,
          visit: null,
        });
        // เพิ่มข้อมูลเข้าไปใน visitStudent ในรูปแบบของ object ที่ประกอบด้วย student และ visit ที่มีค่าเป็น null
      }
    }

    return {
      students: visitStudent,
    };
  }
}

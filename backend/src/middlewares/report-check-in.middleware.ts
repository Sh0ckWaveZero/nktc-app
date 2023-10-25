import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import * as requestIp from 'request-ip';
var uap = require('ua-parser-js');
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class ReportCheckInMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ReportCheckInMiddleware.name);

  constructor(private readonly prisma: PrismaService) { }

  async use(req: any, res: Response, next: NextFunction) {
    const userAgent = req.get('User-Agent');
    const parser = uap(userAgent);
    const {
      teacherId,
      classroomId,
      present,
      absent,
      late,
      leave,
      internship,
      checkInDate,
    } = req.body;
    const ipAddr = requestIp.getClientIp(req);

    // count total student
    const totalStudent =
      present.length +
      absent.length +
      late.length +
      leave.length +
      internship.length;
    const totalPresent = present.length || 0;
    const totalAbsent = absent.length || 0;
    const totalLate = late.length || 0;
    const totalLeave = leave.length || 0;
    const totalInternship = internship.length || 0;

    //get classroom name
    const classroom = await this.prisma.classroom.findUnique({
      where: {
        id: classroomId,
      },
      select: {
        name: true,
      },
    });

    // get teacher name
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
      select: {
        teacherId: true,
      },
    });

    // Record log to database
    await this.prisma.auditLog.create({
      data: {
        action: 'CheckIn',
        model: 'Classroom',
        fieldName: `present, absent, late, leave, internship`,
        oldValue: null,
        newValue: teacher.teacherId,
        detail: `ห้องเรียน${classroom.name
          } จำนวนนักเรียน มาเรียน ${totalPresent} คน, ขาดเรียน ${totalAbsent} คน, สาย ${totalLate} คน, ลา ${totalLeave} คน, ฝึกงาน ${totalInternship} คน รวม ${totalStudent} คน วันที่ ${new Date(
            checkInDate,
          ).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
        ipAddr,
        browser: parser.browser.name,
        device: parser.device.type,
        createdBy: teacher.teacherId,
      },
    });

    next();
  }
}

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import * as requestIp from 'request-ip';
import * as UAParser from 'ua-parser-js';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class ReportCheckInMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ReportCheckInMiddleware.name);

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async use(req: any, res: Response, next: NextFunction) {
    const userAgent = req.get('User-Agent');
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const { teacherId, classroomId, present, absent, late, leave, internship, checkInDate } = req.body;
    const ipAddr = requestIp.getClientIp(req);

    // count total student
    const totalStudent = present.length + absent.length + late.length + leave.length + internship.length;

    // Record log to database
    await this.prisma.auditLog.create({
      data: {
        action: 'CheckIn',
        model: 'Classroom',
        fieldName: 'present, absent, late, leave, internship',
        oldValue: null,
        newValue: teacherId,
        detail: `Teacher check in classroom ${classroomId} with ${totalStudent} students on ${new Date(checkInDate).toLocaleDateString()}`,
        ipAddr,
        browser: result.browser.name,
        device: result.device.type,
        createdBy: teacherId,
      },
    });

    next();
  }
}

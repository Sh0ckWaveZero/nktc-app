import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';


@Injectable()
export class AuditLogService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async findOne(username: string) {
    return await this.prisma.auditLog.findMany({
      where: {
        createdAt: username
      },
    });
  }
}

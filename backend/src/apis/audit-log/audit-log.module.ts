import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService]
})
export class AuditLogModule {}

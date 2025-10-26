import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLogService } from './audit-log.service';

@Controller('audit-log')
@ApiTags('audit-log')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.auditLogService.findOne(username);
  }
}

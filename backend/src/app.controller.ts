import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from './common/services/prisma.service';

@ApiTags('health-check')
@Controller('')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      db: 'ok',
    };
  }
}

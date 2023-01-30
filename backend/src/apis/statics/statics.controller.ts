import { Controller, Get, HttpCode, HttpException, HttpStatus, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaticsService } from './statics.service';
import configuration from 'src/config/configuration';

// @ApiTags('statics')
@Controller('statics')
// @UseGuards(JwtAuthGuard)
export class StaticsController {
  constructor(
    private readonly staticsService: StaticsService,

  ) { }

  @Get('avatars/students/:id')
  @HttpCode(HttpStatus.OK)
  async getStudentAvatar(@Param('id') id: string, @Res() response: Response) {
    try {
      const bucketName = configuration().minioBucket;
      const dataStream = await this.staticsService.getAvatar(bucketName, `avatars/students/${id}`);
      response.set({
        'Content-Type': 'image/webp',
        'Content-Disposition': 'attachment; filename=' + id + '.webp',
      });
      dataStream.pipe(response);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

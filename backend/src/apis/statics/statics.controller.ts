import { Controller, Get, HttpCode, HttpException, HttpStatus, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaticsService } from './statics.service';
import configuration from 'src/config/configuration';
import { join } from 'path';
import { LocalAuthGuard } from '../auth/local-auth.guard';

@ApiTags('statics')
@Controller('statics')
@UseGuards(JwtAuthGuard)
export class StaticsController {
  constructor(
    private readonly staticsService: StaticsService,

  ) { }

  @Get('avatars/students/:id')
  @HttpCode(HttpStatus.OK)
  async getStudentAvatar(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    await this.serveImage(id, 'avatars/students', response);
  }

  @Get('goodness-individual/images/:id')
  @HttpCode(HttpStatus.OK)
  async getStudentGoodness(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    await this.serveImage(id, 'goodness-individual/images', response);
  }

  @Get('badness-individual/images/:id')
  @HttpCode(HttpStatus.OK)
  async getStudentBadness(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    await this.serveImage(id, 'badness-individual/images', response);
  }

  // goodness-individual
  @Get('goodness-individual/images/:id')
  @HttpCode(HttpStatus.OK)
  async getGoodnessIndividual(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    await this.serveImage(id, 'goodness-individual/images', response);
  }

  // badness-individual
  @Get('badness-individual/images/:id')
  @HttpCode(HttpStatus.OK)
  async getBadnessIndividual(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    await this.serveImage(id, 'badness-individual/images', response);
  }

  private async serveImage(
    id: string,
    prefix: string,
    response: Response,
  ) {
    try {
      const bucketName = configuration().minioBucket;
      const dataStream = await this.staticsService.getAvatar(bucketName, `${prefix}/${id}`);
      response.contentType('image/webp');
      response.attachment(`${id}.webp`);
      dataStream.pipe(response);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

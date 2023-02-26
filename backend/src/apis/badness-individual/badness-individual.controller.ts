import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { BadnessIndividualService } from './badness-individual.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('badness-individual')
@Controller('badness-individual')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BadnessIndividualController {
  constructor(private readonly badnessIndividualService: BadnessIndividualService) {}

  @Post()
  async create(@Body() createBadnessIndividualDto: any) {
    return await this.badnessIndividualService.create(createBadnessIndividualDto);
  }

  @Post('search')
  async search(@Body() body: any) {
    return await this.badnessIndividualService.search(body);
  }

}

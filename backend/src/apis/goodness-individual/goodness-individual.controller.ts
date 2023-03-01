import { Controller, Post, Body, UseGuards, Query } from '@nestjs/common';
import { GoodnessIndividualService } from './goodness-individual.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('goodness-individual')
@Controller('goodness-individual')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoodnessIndividualController {
  constructor(private readonly goodnessIndividualService: GoodnessIndividualService) { }

  @Post()
  async create(@Body() createGoodnessIndividualDto: any) {
    return await this.goodnessIndividualService.create(createGoodnessIndividualDto);
  }

  @Post('group')
  async group(@Body() createGoodnessIndividualDto: any) {
    return await this.goodnessIndividualService.group(createGoodnessIndividualDto);
  }

  @Post('search')
  async search(@Body() body: any) {
    return await this.goodnessIndividualService.search(body);
  }

}

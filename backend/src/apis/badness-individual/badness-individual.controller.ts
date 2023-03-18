import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';

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

  @Post('group')
  async group(@Body() createGoodnessIndividualDto: any) {
    return await this.badnessIndividualService.group(createGoodnessIndividualDto);
  }

  @Post('search')
  async search(@Body() body: any) {
    return await this.badnessIndividualService.search(body);
  }
  
   // summary
   @Post('summary')
   async summary(@Body() body: any) {
     return await this.badnessIndividualService.getBadnessSummary(body);
   }

    // DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param('id') id: string) {
    return await this.badnessIndividualService.deleteById(id);
  }
}

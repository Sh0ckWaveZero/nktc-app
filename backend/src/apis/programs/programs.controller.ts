import { Controller, Get, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgramsService } from './programs.service';


@Controller('programs')
@ApiTags('programs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) { }


  @Get()
  async findAll() {
    try {
      const response = await this.programsService.findAll();
      return response;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Cannot get programs',
      }, HttpStatus.FORBIDDEN);
    }
  }
}

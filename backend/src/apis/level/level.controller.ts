import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { LevelService } from './level.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/common/guards';

@ApiTags('levels')
@Controller('levels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Get()
  async findAll() {
    return await this.levelService.findAll();
  }
}

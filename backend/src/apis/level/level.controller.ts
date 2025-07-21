import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatisticsService } from './statistics.service';
import {
  TermStatisticsQueryDto,
  TermStatisticsResponseDto,
} from './dto/term-statistics.dto';

@UseGuards(JwtAuthGuard)
@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('term')
  @ApiOperation({
    summary: 'Get term-based statistics',
    description:
      'Retrieve comprehensive statistics for a specific term including student check-in rates and teacher usage',
  })
  @ApiResponse({
    status: 200,
    description: 'Term statistics retrieved successfully',
    type: TermStatisticsResponseDto,
  })
  async getTermStatistics(@Query() query: TermStatisticsQueryDto) {
    return await this.statisticsService.getTermStatistics(query);
  }

}

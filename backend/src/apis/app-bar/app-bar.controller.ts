import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/apis/auth/jwt-auth.guard';
import { AppBarService } from './app-bar.service';

@ApiTags('app-bar')
@Controller('app-bar')
@UseGuards(JwtAuthGuard)
export class AppBarController {
  constructor(private readonly appBarService: AppBarService) { }


  @ApiSecurity('access-key')
  @Get('search')
  @ApiParam({
    name: 'q',
    required: true,
    description: 'สำหรับค้นหาเมนูต่างๆของแอปพลิเคชัน',
    schema: { oneOf: [{ type: 'string' }] },
    type: 'string',
  })
  findOne(@Query() { q }) {
    return this.appBarService.search(q);
  }
}

import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  Param,
  Put,
  Ip,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService, RegistrationStatus } from './auth.service';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Tokens } from './types/tokens.type';
import { JwtAuthGuard, LocalAuthGuard, RefreshTokenGuard } from './common/guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  public async register(
    @Body() createUserDto: any,
  ): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.register(
      createUserDto,
    );
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  public async login(
    @Ip() userIp: any,
    @Body() loginUserDto: any,
  ): Promise<any> {
    const loginResults = await this.authService.login(loginUserDto, userIp);

    if (!loginResults) {
      throw new UnauthorizedException(
        'This user name, password combination was not found',
      );
    }

    return loginResults;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiSecurity('access-key')
  @Get('me')
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  public async me(@Request() req: any): Promise<any> {
    return await this.authService.getMe(req.user);
  }

  @Put('/update/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.ACCEPTED)
  public async updatePassword(
    @Request() req: any,
    @Body() updatePasswordDto: any,
  ) {
    try {
      return await this.authService.updatePassword(
        updatePasswordDto,
        req.user.id,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @Request() req: any
  ): Promise<Tokens> {
    return this.authService.refreshTokens(req.user);
  }
}

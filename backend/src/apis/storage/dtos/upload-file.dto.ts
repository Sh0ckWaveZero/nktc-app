import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';
import { AppMimeType } from '../constants';

export class UploadFileDto {
  @ApiProperty({ description: 'File data (base64 encoded)' })
  @IsString()
  @IsNotEmpty()
  data: string;

  @ApiPropertyOptional({ description: 'Path prefix for file storage', example: 'images/' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  path?: string;
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { AppMimeType } from '../constants';

export class FileResponseDto {
  @ApiProperty({ description: 'Unique file identifier' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'File name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'File encoding' })
  @Expose()
  encoding: string;

  @ApiProperty({ description: 'File MIME type', enum: AppMimeType })
  @Expose()
  @IsEnum(AppMimeType)
  mimetype: AppMimeType;

  @ApiProperty({ description: 'File size in bytes' })
  @Expose()
  size: number;

  @ApiProperty({ description: 'File access URL' })
  @Expose()
  url: string;

  @ApiPropertyOptional({ description: 'Last update timestamp' })
  @Expose()
  @IsOptional()
  @Type(() => Date)
  updatedAt?: Date;

  constructor(partial: Partial<FileResponseDto>) {
    Object.assign(this, partial);
  }
}
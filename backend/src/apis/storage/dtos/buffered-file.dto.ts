import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, MaxLength, IsNumber, Min } from 'class-validator';
import { AppMimeType } from '../constants';

export class BufferedFileDto {
  @ApiProperty({ description: 'Field name from form' })
  @IsString()
  @IsNotEmpty()
  fieldname: string;

  @ApiProperty({ description: 'Original file name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalname: string;

  @ApiProperty({ description: 'File encoding' })
  @IsString()
  @IsNotEmpty()
  encoding: string;

  @ApiProperty({ description: 'File MIME type', enum: AppMimeType })
  @IsEnum(AppMimeType)
  mimetype: AppMimeType;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  @Min(0)
  size: number;

  @ApiProperty({ description: 'File buffer' })
  buffer: Buffer | string;
}
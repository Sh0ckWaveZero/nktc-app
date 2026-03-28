import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DeleteFileDto {
  @ApiProperty({ description: 'File name/object key to delete' })
  @IsString()
  @IsNotEmpty()
  objectName: string;

  @ApiPropertyOptional({ description: 'Bucket name' })
  @IsOptional()
  @IsString()
  bucketName?: string;
}
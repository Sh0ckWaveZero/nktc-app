import { PartialType } from '@nestjs/swagger';
import { CreateAppBarDto } from './create-app-bar.dto';

export class UpdateAppBarDto extends PartialType(CreateAppBarDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateVisitDto } from './create-visit.dto';

export class UpdateVisitDto extends PartialType(CreateVisitDto) {}

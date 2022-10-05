import { PartialType } from '@nestjs/swagger';
import { CreateReportCheckInDto } from './create-report-check-in.dto';

export class UpdateReportCheckInDto extends PartialType(CreateReportCheckInDto) {}

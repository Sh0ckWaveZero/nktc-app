import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class Class {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  teacher: Array<string>;

  @ApiProperty()
  student: Array<string>;
}

import { ApiProperty } from "@nestjs/swagger";

export class Account {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  images: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  firstNameEn: string;

  @ApiProperty()
  lastNameEn: string;

  @ApiProperty()
  idCard: string;

  @ApiProperty()
  birthday: Date;

  @ApiProperty()
  bloodType: string;

  @ApiProperty()
  fatherName: string;

  @ApiProperty()
  fatherPhone: string;

  @ApiProperty()
  motherName: string;

  @ApiProperty()
  motherPhone: string;

  @ApiProperty()
  parentName: string;

  @ApiProperty()
  parentPhone: string;

  @ApiProperty()
  addressLine1: string;

  @ApiProperty()
  subDistrict: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  province: string;

  @ApiProperty()
  postcode: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty()
  access_token: string;

  @ApiProperty()
  expires_at: number;

  @ApiProperty()
  token_type: string;

  @ApiProperty()
  id_token: string;

  @ApiProperty()
  session_state: string;
}

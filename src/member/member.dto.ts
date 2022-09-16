import { IsNotEmpty, IsString, IsEmail, IsDateString } from 'class-validator';

export class MemberDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsDateString()
  readonly birthDate: string;
}

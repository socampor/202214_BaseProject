import {
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  IsDateString,
} from 'class-validator';

export class ClubDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  readonly description: string;

  @IsDateString()
  readonly foundationDate: string;

  @IsUrl()
  @IsNotEmpty()
  readonly image: string;
}

import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateLinkDto {
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  originalUrl!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9_-]+$/)
  customSlug?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

import { IsString, MinLength } from 'class-validator';

export class GenerateInvoicePdfDto {
  /** Full HTML document (or fragment wrapped by client) matching the admin invoice layout. */
  @IsString()
  @MinLength(32)
  html: string;
}

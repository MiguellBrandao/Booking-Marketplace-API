import { Expose } from 'class-transformer';

export class AuthDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}

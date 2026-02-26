import { registerAs } from '@nestjs/config';
import { JwtConfig } from './jwt-config.type';


export default registerAs('jwt', (): JwtConfig => {
  const accessTtl = parseInt(process.env.JW_ACCESS_TOKEN_TTL ?? '3600', 10);
  if (isNaN(accessTtl)) {
    throw new Error('JW_ACCESS_TOKEN_TTL must be a number');
  }

  const refreshTtl = parseInt(process.env.JW_REFRESH_TOKEN_TTL ?? '86400', 10);
  if (isNaN(refreshTtl)) {
    throw new Error('JW_REFRESH_TOKEN_TTL must be a number');
  }

  return {
    secret: process.env.JWT_SECRET!,
    audience: process.env.JW_TOKEN_AUDIENCE!,
    issuer: process.env.JW_TOKEN_ISSUER!,
    accessTokenTtl: accessTtl,
    refreshTokenTtl: refreshTtl,
  };
  
});
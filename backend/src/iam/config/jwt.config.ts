import { registerAs } from '@nestjs/config';
import { JwtConfig } from './jwt-config.type';
import { createReadStream, existsSync, } from 'fs';
import * as fs from 'fs';

export default registerAs('jwt', (): JwtConfig => {
  const accessTtl = parseInt(process.env.JW_ACCESS_TOKEN_TTL ?? '3600', 10);
  if (isNaN(accessTtl)) {
    throw new Error('JW_ACCESS_TOKEN_TTL must be a number');
  }

  const refreshTtl = parseInt(process.env.JW_REFRESH_TOKEN_TTL ?? '86400', 10);
  if (isNaN(refreshTtl)) {
    throw new Error('JW_REFRESH_TOKEN_TTL must be a number');
  }

  const fileDestination = process.env.UPLOADED_FILES_DESTINATION ?? 'error' ;
  if (!fs.existsSync(fileDestination)) {
    throw new Error('UPLOADED_FILES_DESTINATION not found');
  }

  const cover = process.env.DEFAULT_FILE_COVER ?? 'error' ;
  if (!fs.existsSync(cover)) {
    throw new Error('DEFAULT_FILE_COVER not found');
  }

  const avatar = process.env.DEFAULT_FILE_AVATAR ?? 'error' ;
  if (!fs.existsSync(avatar)) {
    throw new Error('DEFAULT_FILE_AVATAR not found');
  }

  return {
    secret: process.env.JWT_SECRET!,
    audience: process.env.JW_TOKEN_AUDIENCE!,
    issuer: process.env.JW_TOKEN_ISSUER!,
    accessTokenTtl: accessTtl,
    refreshTokenTtl: refreshTtl,
    fileDestination,
    cover,
    avatar
  };
  
});
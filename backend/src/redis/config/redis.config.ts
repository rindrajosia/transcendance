import { registerAs } from '@nestjs/config';
import { RedisConfig } from './redis-config.type';


export default registerAs('redis', (): RedisConfig => {
  const redisPort = parseInt(process.env.REDIS_PORT as string, 10);
  if (isNaN(redisPort)) {
    throw new Error('REDIS_PORT must be a number');
  }

  return {
    host: process.env.REDIS_HOST!,
    port: redisPort,
  };
  
});
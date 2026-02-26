import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import redisConfig from './config/redis.config';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  private redisClient: Redis.Redis;

  constructor(
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
  ) {}

  onModuleInit() {
    const config = {
      host: this.redisConfiguration.host,
      port: this.redisConfiguration.port,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
    };

    this.logger.log('Connecting to Redis...', config);

    this.redisClient = new Redis.Redis(config);

    this.redisClient.on('connect', () => {
      this.logger.log('Redis client connected successfully');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('Redis client error:', error);
    });
  }

  onModuleDestroy() {
    this.redisClient.quit();
    this.logger.log('Redis connection closed');
  }

  /**
   * Set a value in Redis under the given key.
   * If the value is an object, we convert it to a JSON string before saving,
   * because Redis only stores strings.
   */
  async set(key: string, value: any): Promise<string> {
    try {
      const stringValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);

      return await this.redisClient.set(key, stringValue);
    } catch (error) {
      this.logger.error(`Error setting key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Get a value from Redis using a key.
   * If the value is in JSON format, we parse it to convert it back to an object.
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      if (!value) return null;

      try {
        // Try to parse JSON string back to object
        return JSON.parse(value);
      } catch {
        // If parsing fails, just return the raw string value
        return value as T;
      }
    } catch (error) {
      this.logger.error(`Error getting key "${key}":`, error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      const value = await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Error getting key "${key}":`, error);
       throw error;
    }
  }

}
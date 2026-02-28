import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';
import redisConfig from './redis/config/redis.config';
import { RedisService } from './redis/redis.service';

import * as Joi from 'joi';
import { RedisModule } from './redis/redis.module';
import { RoleModule } from './roles/role.module';
import { SongsModule } from './songs/songs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'docker', 'production').required(),

        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        JWT_SECRET: Joi.string().min(10).required(),
        JW_TOKEN_AUDIENCE: Joi.string().required(),
        JW_TOKEN_ISSUER: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        UPLOADED_FILES_DESTINATION: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        logging: config.get<string>('NODE_ENV') === 'development',
        retryAttempts: 5,
        retryDelay: 3000,
      }),
    }),

    UsersModule,
    IamModule,
    RedisModule,
    RoleModule,
    SongsModule,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    this.init();
  }

  private async init() {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }
      console.log(
        'DB Connected:',
        this.dataSource.options.type,
        this.dataSource.options.database,
      );
    } catch (err) {
      console.error('❌ DB Connection failed:', err);
    }
  }
}
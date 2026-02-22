import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),

        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),

        JWT_SECRET: Joi.string().min(10).required(),
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
        entities: ['dist/src/**/*.entity.js'],
        synchronize: true,
        logging: config.get<string>('NODE_ENV') === 'development',
        retryAttempts: 5,
        retryDelay: 3000,
      }),
    }),
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    this.logDatabaseConnection();
  }

  private async logDatabaseConnection() {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      console.log(
        'Connected to DB:',
        this.dataSource.options.type,
        this.dataSource.options.database,
      );
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }
}
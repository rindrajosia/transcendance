import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456789',
      database: 'spotify',
      entities: ['dist/src/**/*.entity.js'],
      synchronize: true,
    }),
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    console.log('DBname: ', dataSource.driver.database);
  }
}
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { Article } from './articles/entities/article.entity';
import { Image } from './articles/entities/images.entity';
import { PubModule } from './pub/pub.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    TypeOrmModule.forFeature([Article, User, Image]),
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          connectorPackage: 'mysql2',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          ssl: {
            rejectUnauthorized: false,
          },
          extr: {
            connectTimeout: 60000,
            socketPath: null,
          },
          synchronize: false,
          extra: {
            authPlugin: 'mysql_native_password',
          },
        };
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads/',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads/profile'),
      serveRoot: '/uploads/profile/',
    }),
    UsersModule,
    ArticlesModule,
    PubModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

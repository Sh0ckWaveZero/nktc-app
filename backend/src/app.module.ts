import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './apis/auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UsersModule } from "./apis/users/users.module";
import { ClassModule } from './apis/class/class.module';
import { TeachersModule } from './apis/teachers/teachers.module';
import { StudentsModule } from './apis/students/students.module';
import { AccountsModule } from './apis/accounts/accounts.module';
import { AppBarModule } from './apis/app-bar/app-bar.module';
import { PrismaService as PrismaMongoDbService } from './prisma/prisma-mongodb.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import validate from './config/validation';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ClassModule,
    TeachersModule,
    StudentsModule,
    AccountsModule,
    AppBarModule,
    ConfigModule.forRoot({
      load: [configuration],
      validate,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaMongoDbService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('auth');
  }
}

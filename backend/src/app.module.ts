import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UsersModule } from "./users/users.module";
import { ClassModule } from './class/class.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';
import { AccountsModule } from './accounts/accounts.module';
import { AppBarModule } from './app-bar/app-bar.module';
import { PrismaService as PrismaMongoDbService } from './prisma/prisma-mongodb.service';

@Module({
  imports: [AuthModule, UsersModule, ClassModule, TeachersModule, StudentsModule, AccountsModule, AppBarModule],
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

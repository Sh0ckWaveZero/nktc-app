import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UsersModule } from "./users/users.module";
import { ClassRoomModule } from './classroom/classroom.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';
import { AccountsModule } from './accounts/accounts.module';


@Module({
  imports: [AuthModule, UsersModule, ClassRoomModule, TeachersModule, StudentsModule, AccountsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('auth');
  }
}

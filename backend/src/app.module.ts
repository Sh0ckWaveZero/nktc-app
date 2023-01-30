import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './apis/auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UsersModule } from './apis/users/users.module';
import { TeachersModule } from './apis/teachers/teachers.module';
import { StudentsModule } from './apis/students/students.module';
import { AccountsModule } from './apis/accounts/accounts.module';
import { AppBarModule } from './apis/app-bar/app-bar.module';
import { PrismaService as PrismaMongoDbService } from './common/services/prisma-mongodb.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import validate from './config/validation';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { APP_GUARD } from '@nestjs/core';
import { ClassroomModule } from './apis/classroom/classroom.module';
import { ReportCheckInModule } from './apis/report-check-in/report-check-in.module';
import { AuditLogModule } from './apis/audit-log/audit-log.module';
import { DepartmentsModule } from './apis/departments/departments.module';
import { ProgramsModule } from './apis/programs/programs.module';
import { MinioClientModule } from './apis/minio/minio-client.module';
import { ActivityCheckInModule } from './apis/activity-check-in/activity-check-in.module';
import { StaticsModule } from './apis/statics/statics.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 50,
    }),
    AuthModule,
    UsersModule,
    TeachersModule,
    StudentsModule,
    AccountsModule,
    AppBarModule,
    ProgramsModule,
    ClassroomModule,
    ReportCheckInModule,
    AuditLogModule,
    DepartmentsModule,
    ActivityCheckInModule,
    StaticsModule,
    ConfigModule.forRoot(
      {
        load: [configuration],
        validate,
      },
    ),
    MinioClientModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaMongoDbService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('auth/login');
  }
}

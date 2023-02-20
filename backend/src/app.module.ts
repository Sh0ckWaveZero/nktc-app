import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { AccountsModule } from './apis/accounts/accounts.module';
import { ActivityCheckInModule } from './apis/activity-check-in/activity-check-in.module';
import { AppBarModule } from './apis/app-bar/app-bar.module';
import { AppController } from './app.controller';
import { AuditLogModule } from './apis/audit-log/audit-log.module';
import { AuthModule } from './apis/auth/auth.module';
import { ClassroomModule } from './apis/classroom/classroom.module';
import { ConfigModule } from '@nestjs/config';
import { DepartmentsModule } from './apis/departments/departments.module';
import { GoodnessIndividualModule } from './apis/goodness-individual/goodness-individual.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { MinioClientModule } from './apis/minio/minio-client.module';
import { PrismaService as PrismaMongoDbService } from './common/services/prisma-mongodb.service';
import { ProgramsModule } from './apis/programs/programs.module';
import { ReportCheckInModule } from './apis/report-check-in/report-check-in.module';
import { StaticsModule } from './apis/statics/statics.module';
import { StudentsModule } from './apis/students/students.module';
import { TeachersModule } from './apis/teachers/teachers.module';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './apis/users/users.module';
import configuration from './config/configuration';
import validate from './config/validation';
import { PrismaService } from './common/services/prisma.service';
import { BadnessIndividualModule } from './apis/badness-individual/badness-individual.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 50,
    }),
    AccountsModule,
    ActivityCheckInModule,
    AppBarModule,
    AuditLogModule,
    AuthModule,
    ClassroomModule,
    DepartmentsModule,
    GoodnessIndividualModule,
    ProgramsModule,
    ReportCheckInModule,
    StaticsModule,
    StudentsModule,
    TeachersModule,
    UsersModule,
    BadnessIndividualModule,
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
    PrismaService,
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

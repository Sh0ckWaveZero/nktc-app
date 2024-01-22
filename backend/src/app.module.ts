import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { AccountsModule } from './apis/accounts/accounts.module';
import { ActivityCheckInModule } from './apis/activity-check-in/activity-check-in.module';
import { AppBarModule } from './apis/app-bar/app-bar.module';
import { AppController } from './app.controller';
import { AuditLogModule } from './apis/audit-log/audit-log.module';
import { AuthModule } from './apis/auth/auth.module';
import { BadnessIndividualModule } from './apis/badness-individual/badness-individual.module';
import { ClassroomModule } from './apis/classroom/classroom.module';
import { ConfigModule } from '@nestjs/config';
import { DepartmentsModule } from './apis/departments/departments.module';
import { GoodnessIndividualModule } from './apis/goodness-individual/goodness-individual.module';
import { LevelModule } from './apis/level/level.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { MinioClientModule } from './apis/minio/minio-client.module';
import { PrismaService as PrismaMongoDbService } from './common/services/prisma-mongodb.service';
import { PrismaService } from './common/services/prisma.service';
import { ProgramsModule } from './apis/programs/programs.module';
import { ReportCheckInMiddleware } from './middlewares/report-check-in.middleware';
import { ReportCheckInModule } from './apis/report-check-in/report-check-in.module';
import { StaticsModule } from './apis/statics/statics.module';
import { StudentsModule } from './apis/students/students.module';
import { TeachersModule } from './apis/teachers/teachers.module';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './apis/users/users.module';
import { VisitsModule } from './apis/visits/visits.module';
import configuration from './config/configuration';
import validate from './config/validation';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AccountsModule,
    ActivityCheckInModule,
    AppBarModule,
    AuditLogModule,
    AuthModule,
    BadnessIndividualModule,
    ClassroomModule,
    DepartmentsModule,
    GoodnessIndividualModule,
    ProgramsModule,
    ReportCheckInModule,
    StaticsModule,
    StudentsModule,
    TeachersModule,
    UsersModule,
    VisitsModule,
    ConfigModule.forRoot({
      load: [configuration],
      validate,
    }),
    MinioClientModule,
    LevelModule,
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
    consumer
      .apply(ReportCheckInMiddleware)
      .forRoutes({ path: 'reportCheckIn', method: RequestMethod.POST });
  }
}

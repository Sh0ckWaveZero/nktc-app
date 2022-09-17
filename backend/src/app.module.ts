import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './apis/auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UsersModule } from './apis/users/users.module';
import { ClassModule } from './apis/class/class.module';
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

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 50,
    }),
    AuthModule,
    UsersModule,
    ClassModule,
    TeachersModule,
    StudentsModule,
    AccountsModule,
    AppBarModule,
    ConfigModule.forRoot(
      {
        load: [configuration],
        validate,
      },
    ),
  ],
  controllers: [AppController],
  providers: [
    PrismaMongoDbService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('auth');
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health check', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should have healthCheck method', () => {
      expect(appController.healthCheck).toBeDefined();
      expect(typeof appController.healthCheck).toBe('function');
    });
  });
});

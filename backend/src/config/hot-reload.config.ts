import { INestApplication } from '@nestjs/common';

declare const module: any;

/**
 * ตั้งค่า Hot Module Replacement สำหรับ development
 * @param app - อินสแตนซ์ของ NestJS application
 */
export const setupHotReload = (app: INestApplication): void => {
  if (!module.hot) {
    return;
  }

  module.hot.accept();
  module.hot.dispose(() => app.close());
};

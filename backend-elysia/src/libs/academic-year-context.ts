import { AsyncLocalStorage } from "node:async_hooks";

export interface AcademicYearContext {
  academicYear: number;
  activeAcademicYear: number;
  version: number;
  expectedVersion: number | null;
}

const storage = new AsyncLocalStorage<AcademicYearContext>();

/** อ่าน Academic year ของ request ปัจจุบัน โดยไม่ปะปนกับ request อื่น */
export const getAcademicYearContext = (): AcademicYearContext | undefined => storage.getStore();

/** ครอบงานทั้งหมดของ request ด้วย Academic year ที่เลือก */
export const withAcademicYearContext = <T>(context: AcademicYearContext, callback: () => T | PromiseLike<T>): Promise<T> =>
  // Await inside run: Prisma promises execute lazily when then/await is called.
  storage.run(context, async () => await callback());

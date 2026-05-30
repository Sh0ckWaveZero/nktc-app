import { describe, it, expect } from 'vitest';
import {
  calculateSdqResult,
  buildSdqRecord,
  isAllQuestionsAnswered,
  countAnswered,
  rebuildResultFromRecord,
} from '../sdq-scoring';
import type { SdqAnswers } from '../sdq-scoring';

describe('SDQ Scoring Utilities', () => {
  // สร้าง mock answers ที่ตอบ 0 ทุกข้อ
  // ข้อสังเกต: ข้อที่มีการกลับคะแนน (Reverse Scored) คือ ข้อ 7, 11, 14, 21, 25
  // ใน Subscales:
  // - Prosocial (ข้อ 1, 4, 9, 17, 20): ไม่มีกลับคะแนน ตอบ 0 จะได้คะแนน 0 ซึ่งในทางจุดแข็งหมายถึง "ไม่มีจุดแข็ง" (abnormal)
  // - ปัญหาด้านพฤติกรรมเกเร (Conduct - ข้อ 5, 7*, 12, 18, 22): ข้อ 7 กลับคะแนน ตอบ 0 จะได้คะแนน 2
  // - ปัญหาความสัมพันธ์กับเพื่อน (Peer - ข้อ 6, 11*, 14*, 19, 23): ข้อ 11, 14 กลับคะแนน ตอบ 0 จะได้คะแนน 4
  // - ปัญหาอยู่ไม่นิ่ง (Hyperactivity - ข้อ 2, 10, 15, 21*, 25*): ข้อ 21, 25 กลับคะแนน ตอบ 0 จะได้คะแนน 4
  // - ปัญหาอารมณ์ (Emotional - ข้อ 3, 8, 13, 16, 24): ไม่มีกลับคะแนน ตอบ 0 จะได้คะแนน 0
  const allZerosAnswers: SdqAnswers = Array.from({ length: 25 }, (_, i) => i + 1).reduce(
    (acc, num) => ({ ...acc, [num]: 0 }),
    {} as SdqAnswers,
  );

  describe('countAnswered & isAllQuestionsAnswered', () => {
    it('should correctly count answered questions', () => {
      expect(countAnswered({})).toBe(0);
      expect(isAllQuestionsAnswered({})).toBe(false);

      const partialAnswers: SdqAnswers = { 1: 0, 2: 1, 3: 2 };
      expect(countAnswered(partialAnswers)).toBe(3);
      expect(isAllQuestionsAnswered(partialAnswers)).toBe(false);

      expect(countAnswered(allZerosAnswers)).toBe(25);
      expect(isAllQuestionsAnswered(allZerosAnswers)).toBe(true);
    });
  });

  describe('calculateSdqResult', () => {
    it('should calculate correct scores and classifications for all-zero answers', () => {
      const result = calculateSdqResult(allZerosAnswers);

      // ตรวจสอบคะแนนแต่ละด้าน
      // Emotional: 0
      expect(result.subscales.emotional.score).toBe(0);
      expect(result.subscales.emotional.classification).toBe('normal');

      // Conduct: ข้อ 7* กลับคะแนน ดังนั้นตอบ 0 ได้ 2. ข้ออื่นได้ 0. รวมเป็น 2
      expect(result.subscales.conduct.score).toBe(2);
      expect(result.subscales.conduct.classification).toBe('normal');

      // Hyperactivity: ข้อ 21*, 25* กลับคะแนน ตอบ 0 ได้ 4. รวมเป็น 4
      expect(result.subscales.hyperactivity.score).toBe(4);
      expect(result.subscales.hyperactivity.classification).toBe('normal');

      // Peer: ข้อ 11*, 14* กลับคะแนน ตอบ 0 ได้ 4. รวมเป็น 4
      expect(result.subscales.peer.score).toBe(4);
      expect(result.subscales.peer.classification).toBe('normal');

      // Prosocial: ไม่มีกลับคะแนน ตอบ 0 ได้ 0
      expect(result.prosocialScore).toBe(0);
      expect(result.prosocialClassification).toBe('abnormal'); // 0 คะแนนคือไม่มีจุดแข็ง (Abnormal)

      // Total Difficulty = Emotional(0) + Conduct(2) + Hyperactivity(4) + Peer(4) = 10
      expect(result.totalDifficulty).toBe(10);
      expect(result.totalClassification).toBe('normal'); // เกณฑ์ปกติคือ 0-15
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should calculate correct scores when all questions are answered with maximum difficulty (2 or 0 for reversed)', () => {
      // เพื่อให้ได้คะแนนด้านปัญหาเต็ม 10 และ Prosocial เป็น 10:
      // ด้านปัญหากระทำตรงกันข้ามกับ Reverse score:
      // - ข้อธรรมดา ตอบ 2 (จริง)
      // - ข้อกลับคะแนน (7, 11, 14, 21, 25) ตอบ 0 (ไม่จริง) เพื่อให้ได้คะแนนกลับมาเป็น 2
      // - Prosocial (1, 4, 9, 17, 20) ตอบ 2 (จริง) เพื่อให้จุดแข็งได้ 10 (เต็ม)
      const maxProblemAnswers: SdqAnswers = Array.from({ length: 25 }, (_, i) => i + 1).reduce((acc, num) => {
        const isReversed = [7, 11, 14, 21, 25].includes(num);
        acc[num] = isReversed ? 0 : 2;
        return acc;
      }, {} as SdqAnswers);

      const result = calculateSdqResult(maxProblemAnswers);

      expect(result.subscales.emotional.score).toBe(10);
      expect(result.subscales.emotional.classification).toBe('abnormal');

      expect(result.subscales.conduct.score).toBe(10);
      expect(result.subscales.conduct.classification).toBe('abnormal');

      expect(result.subscales.hyperactivity.score).toBe(10);
      expect(result.subscales.hyperactivity.classification).toBe('abnormal');

      expect(result.subscales.peer.score).toBe(10);
      expect(result.subscales.peer.classification).toBe('abnormal');

      expect(result.prosocialScore).toBe(10);
      expect(result.prosocialClassification).toBe('normal'); // 10 คะแนนคือมีจุดแข็งดีเยี่ยม

      expect(result.totalDifficulty).toBe(40);
      expect(result.totalClassification).toBe('abnormal'); // 40 คะแนนเต็มคือมีปัญหาแน่นอน
    });
  });

  describe('buildSdqRecord & rebuildResultFromRecord', () => {
    it('should build a record and rebuild it accurately', () => {
      const result = calculateSdqResult(allZerosAnswers);
      const record = buildSdqRecord(allZerosAnswers, result, 'teacher-123');

      expect(record.assessedBy).toBe('teacher-123');
      expect(record.version).toBe('teacher-thai-v1');
      expect(record.answers).toEqual(allZerosAnswers);
      expect(record.scores.totalDifficulty).toBe(10);
      expect(record.classifications.totalDifficulty).toBe('normal');

      const rebuiltResult = rebuildResultFromRecord(record);
      expect(rebuiltResult.totalDifficulty).toBe(10);
      expect(rebuiltResult.prosocialScore).toBe(0);
      expect(rebuiltResult.totalClassification).toBe('normal');
      expect(rebuiltResult.assessmentDate).toBe(record.assessmentDate);
    });
  });
});

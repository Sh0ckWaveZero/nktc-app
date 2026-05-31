/**
 * ระบบคำนวณคะแนน SDQ (Strengths and Difficulties Questionnaire)
 * อ้างอิงเกณฑ์จากกรมสุขภาพจิต ฉบับครูประเมินนักเรียน
 */

import {
  SDQ_QUESTIONS,
  SDQ_SUBSCALES,
  SDQ_SUBSCALE_ORDER,
  SDQ_TOTAL_DIFFICULTY_CUTOFF,
  SDQ_CLASSIFICATION_INFO,
  SDQ_RECOMMENDATIONS,
} from './sdq-constants';

import type { SdqSubscaleKey, SdqClassification } from './sdq-constants';

/** คำตอบทั้ง 25 ข้อ (key = หมายเลขข้อ, value = 0/1/2) */
export type SdqAnswers = Record<number, number>;

/** ผลคะแนนแต่ละ Subscale */
export interface SdqSubscaleResult {
  readonly key: SdqSubscaleKey;
  readonly nameTh: string;
  readonly nameEn: string;
  readonly score: number;
  readonly maxScore: number;
  readonly classification: SdqClassification;
  readonly icon: string;
  readonly color: string;
}

/** ผลการประเมิน SDQ ทั้งหมด */
export interface SdqAssessmentResult {
  readonly subscales: Record<SdqSubscaleKey, SdqSubscaleResult>;
  readonly totalDifficulty: number;
  readonly totalClassification: SdqClassification;
  readonly prosocialScore: number;
  readonly prosocialClassification: SdqClassification;
  readonly recommendations: readonly string[];
  readonly assessmentDate: string;
}

/** ข้อมูลสำหรับเก็บใน visitDetail JSON */
export interface SdqAssessmentRecord {
  readonly assessmentDate: string;
  readonly assessedBy: string;
  readonly version: string;
  readonly answers: SdqAnswers;
  readonly scores: Record<SdqSubscaleKey | 'totalDifficulty', number>;
  readonly classifications: Record<SdqSubscaleKey | 'totalDifficulty', SdqClassification>;
}

/**
 * คำนวณคะแนนข้อเดียว โดยพิจารณา Reverse Scoring
 * ปกติ: ไม่จริง=0, ค่อนข้างจริง=1, จริง=2
 * กลับ: ไม่จริง=2, ค่อนข้างจริง=1, จริง=0
 */
const getItemScore = (rawAnswer: number, isReversed: boolean): number => {
  if (isReversed) {
    return 2 - rawAnswer;
  }

  return rawAnswer;
};

/**
 * คำนวณคะแนน Subscale เดียว
 */
const calculateSubscaleScore = (answers: SdqAnswers, subscaleKey: SdqSubscaleKey): number => {
  const questions = SDQ_QUESTIONS.filter((question) => question.subscale === subscaleKey);

  return questions.reduce((total, question) => {
    const rawAnswer = answers[question.number];

    if (rawAnswer === undefined || rawAnswer === null) {
      return total;
    }

    return total + getItemScore(rawAnswer, question.isReversed);
  }, 0);
};

/**
 * จัดระดับผลคัดกรองสำหรับ Subscale ที่เป็นปัญหา (ไม่ใช่ Prosocial)
 * คะแนนสูง = มีปัญหามาก
 */
const classifyProblemSubscale = (score: number, cutoff: readonly [number, number]): SdqClassification => {
  if (score <= cutoff[0]) {
    return 'normal';
  }

  if (score <= cutoff[1]) {
    return 'borderline';
  }

  return 'abnormal';
};

/**
 * จัดระดับผลคัดกรองสำหรับ Prosocial (จุดแข็ง)
 * คะแนนต่ำ = มีปัญหา (กลับทิศจากปัญหาอื่น)
 * cutoff prosocial: [3, 3] → 0-3 = abnormal, 4-10 = normal
 */
const classifyStrengthSubscale = (score: number, cutoff: readonly [number, number]): SdqClassification => {
  if (score <= cutoff[0]) {
    return 'abnormal';
  }

  return 'normal';
};

/**
 * จัดระดับคะแนนรวม Total Difficulty
 */
const classifyTotalDifficulty = (totalScore: number): SdqClassification => {
  if (totalScore <= SDQ_TOTAL_DIFFICULTY_CUTOFF.normalMax) {
    return 'normal';
  }

  if (totalScore <= SDQ_TOTAL_DIFFICULTY_CUTOFF.borderlineMax) {
    return 'borderline';
  }

  return 'abnormal';
};

/**
 * คำนวณผลการประเมิน SDQ ทั้งหมดจากคำตอบ 25 ข้อ
 */
export const calculateSdqResult = (answers: SdqAnswers): SdqAssessmentResult => {
  const subscales = {} as Record<SdqSubscaleKey, SdqSubscaleResult>;

  for (const key of SDQ_SUBSCALE_ORDER) {
    const info = SDQ_SUBSCALES[key];
    const score = calculateSubscaleScore(answers, key);
    const classification = info.isStrength
      ? classifyStrengthSubscale(score, info.cutoff)
      : classifyProblemSubscale(score, info.cutoff);

    subscales[key] = {
      key,
      nameTh: info.nameTh,
      nameEn: info.nameEn,
      score,
      maxScore: 10,
      classification,
      icon: info.icon,
      color: info.color,
    };
  }

  const totalDifficulty =
    subscales.emotional.score + subscales.conduct.score + subscales.hyperactivity.score + subscales.peer.score;

  const totalClassification = classifyTotalDifficulty(totalDifficulty);

  return {
    subscales,
    totalDifficulty,
    totalClassification,
    prosocialScore: subscales.prosocial.score,
    prosocialClassification: subscales.prosocial.classification,
    recommendations: SDQ_RECOMMENDATIONS[totalClassification],
    assessmentDate: new Date().toISOString().slice(0, 10),
  };
};

/**
 * สร้าง record สำหรับบันทึกลง visitDetail JSON
 */
export const buildSdqRecord = (
  answers: SdqAnswers,
  result: SdqAssessmentResult,
  assessedBy: string,
): SdqAssessmentRecord => {
  const scores: Record<string, number> = { totalDifficulty: result.totalDifficulty };
  const classifications: Record<string, SdqClassification> = { totalDifficulty: result.totalClassification };

  for (const key of SDQ_SUBSCALE_ORDER) {
    scores[key] = result.subscales[key].score;
    classifications[key] = result.subscales[key].classification;
  }

  return {
    assessmentDate: result.assessmentDate,
    assessedBy,
    version: 'teacher-thai-v1',
    answers: { ...answers },
    scores: scores as SdqAssessmentRecord['scores'],
    classifications: classifications as SdqAssessmentRecord['classifications'],
  };
};

/**
 * ตรวจสอบว่าตอบครบทุกข้อหรือไม่
 */
export const isAllQuestionsAnswered = (answers: SdqAnswers): boolean => {
  return SDQ_QUESTIONS.every((question) => {
    const answer = answers[question.number];

    return answer !== undefined && answer !== null;
  });
};

/**
 * นับจำนวนข้อที่ตอบแล้ว
 */
export const countAnswered = (answers: SdqAnswers): number => {
  return SDQ_QUESTIONS.filter((question) => {
    const answer = answers[question.number];

    return answer !== undefined && answer !== null;
  }).length;
};

/**
 * สร้างผลลัพธ์จาก SdqAssessmentRecord (สำหรับดูประวัติ)
 */
export const rebuildResultFromRecord = (record: SdqAssessmentRecord): SdqAssessmentResult => {
  const result = calculateSdqResult(record.answers);

  return {
    ...result,
    assessmentDate: record.assessmentDate,
  };
};

/** Re-export classification info and recommendations */
export { SDQ_CLASSIFICATION_INFO, SDQ_RECOMMENDATIONS, SDQ_SUBSCALES, SDQ_SUBSCALE_ORDER, SDQ_QUESTIONS };

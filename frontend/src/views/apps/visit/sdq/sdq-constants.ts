/**
 * แบบประเมินจุดแข็งและจุดอ่อน (SDQ) ฉบับครูประเมินนักเรียน
 * อ้างอิง: กรมสุขภาพจิต กระทรวงสาธารณสุข / sdqinfo.org
 *
 * 25 ข้อ แบ่ง 5 ด้าน (Subscales) ด้านละ 5 ข้อ
 * ตัวเลือก: ไม่จริง (0) / ค่อนข้างจริง (1) / จริง (2)
 * บางข้อเป็น Reverse Scored (คะแนนกลับ)
 */

/** ประเภท Subscale ของ SDQ */
export type SdqSubscaleKey = 'emotional' | 'conduct' | 'hyperactivity' | 'peer' | 'prosocial';

/** ระดับผลคัดกรอง */
export type SdqClassification = 'normal' | 'borderline' | 'abnormal';

/** คำถาม SDQ แต่ละข้อ */
export interface SdqQuestion {
  /** ลำดับข้อ (1-25) */
  readonly number: number;
  /** คำถามภาษาไทย */
  readonly text: string;
  /** ด้านที่สังกัด */
  readonly subscale: SdqSubscaleKey;
  /** เป็นข้อกลับคะแนนหรือไม่ */
  readonly isReversed: boolean;
}

/** ข้อมูล Subscale */
export interface SdqSubscaleInfo {
  readonly key: SdqSubscaleKey;
  readonly nameTh: string;
  readonly nameEn: string;
  readonly icon: string;
  readonly color: string;
  readonly gradientFrom: string;
  readonly gradientTo: string;
  /** เกณฑ์ตัดคะแนน [ปกติMax, เสี่ยงMax] – เสี่ยงMax+1 ขึ้นไปเป็นมีปัญหา */
  readonly cutoff: readonly [number, number];
  /** สำหรับ Prosocial: scoring direction กลับกัน (สูง=ดี) */
  readonly isStrength: boolean;
}

/** ตัวเลือกคำตอบ */
export const SDQ_ANSWER_OPTIONS = [
  { value: 0, label: 'ไม่จริง' },
  { value: 1, label: 'ค่อนข้างจริง' },
  { value: 2, label: 'จริง' },
] as const;

/** คำถาม SDQ ทั้ง 25 ข้อ (ฉบับครูประเมินนักเรียน) */
export const SDQ_QUESTIONS: readonly SdqQuestion[] = [
  // --- Prosocial (จุดแข็ง) ---
  { number: 1, text: 'ห่วงใยความรู้สึกของคนอื่น', subscale: 'prosocial', isReversed: false },
  // --- Hyperactivity (สมาธิ) ---
  { number: 2, text: 'อยู่ไม่นิ่ง นั่งนิ่งๆ ไม่ได้', subscale: 'hyperactivity', isReversed: false },
  // --- Emotional (อารมณ์) ---
  { number: 3, text: 'มักจะบ่นว่าปวดศีรษะ ปวดท้อง หรือไม่สบาย', subscale: 'emotional', isReversed: false },
  // --- Prosocial ---
  {
    number: 4,
    text: 'เต็มใจแบ่งปันสิ่งของให้เพื่อน (ขนม ของเล่น ดินสอ เป็นต้น)',
    subscale: 'prosocial',
    isReversed: false,
  },
  // --- Conduct (พฤติกรรม) ---
  { number: 5, text: 'มักจะอาละวาดหรือโมโหร้าย', subscale: 'conduct', isReversed: false },
  // --- Peer (เพื่อน) ---
  { number: 6, text: 'ค่อนข้างแยกตัว ชอบเล่นคนเดียว', subscale: 'peer', isReversed: false },
  // --- Conduct (กลับคะแนน) ---
  { number: 7, text: 'เชื่อฟัง มักจะทำตามที่ผู้ใหญ่ต้องการ', subscale: 'conduct', isReversed: true },
  // --- Emotional ---
  { number: 8, text: 'กังวลใจหลายเรื่อง ดูวิตกกังวลอยู่เสมอ', subscale: 'emotional', isReversed: false },
  // --- Prosocial ---
  {
    number: 9,
    text: 'เป็นที่พึ่งได้เวลาที่คนอื่นเสียใจ อารมณ์ไม่ดี หรือไม่สบายใจ',
    subscale: 'prosocial',
    isReversed: false,
  },
  // --- Hyperactivity ---
  { number: 10, text: 'อยู่ไม่สุข วุ่นวายอย่างมาก', subscale: 'hyperactivity', isReversed: false },
  // --- Peer (กลับคะแนน) ---
  { number: 11, text: 'มีเพื่อนสนิทอย่างน้อยหนึ่งคน', subscale: 'peer', isReversed: true },
  // --- Conduct ---
  { number: 12, text: 'มักมีเรื่องทะเลาะวิวาทกับเด็กอื่น หรือรังแกเด็กอื่น', subscale: 'conduct', isReversed: false },
  // --- Emotional ---
  { number: 13, text: 'ดูไม่มีความสุข ท้อแท้ ร้องไห้บ่อย', subscale: 'emotional', isReversed: false },
  // --- Peer (กลับคะแนน) ---
  { number: 14, text: 'โดยทั่วไปเป็นที่ชื่นชอบของเด็กอื่น', subscale: 'peer', isReversed: true },
  // --- Hyperactivity ---
  { number: 15, text: 'วอกแวกง่าย สมาธิสั้น', subscale: 'hyperactivity', isReversed: false },
  // --- Emotional ---
  {
    number: 16,
    text: 'เครียดไม่ยอมห่างเวลาอยู่ในสถานการณ์ที่ไม่คุ้น และขาดความเชื่อมั่นในตนเอง',
    subscale: 'emotional',
    isReversed: false,
  },
  // --- Prosocial ---
  { number: 17, text: 'ใจดีกับเด็กที่เล็กกว่า', subscale: 'prosocial', isReversed: false },
  // --- Conduct ---
  { number: 18, text: 'ชอบโกหกหรือขี้โกง', subscale: 'conduct', isReversed: false },
  // --- Peer ---
  { number: 19, text: 'ถูกเด็กคนอื่นล้อเลียนหรือรังแก', subscale: 'peer', isReversed: false },
  // --- Prosocial ---
  { number: 20, text: 'ชอบอาสาช่วยเหลือคนอื่น (พ่อ แม่ ครู เด็กคนอื่น)', subscale: 'prosocial', isReversed: false },
  // --- Hyperactivity (กลับคะแนน) ---
  { number: 21, text: 'คิดก่อนทำ', subscale: 'hyperactivity', isReversed: true },
  // --- Conduct ---
  { number: 22, text: 'ขโมยของที่บ้าน ที่โรงเรียน หรือที่อื่น', subscale: 'conduct', isReversed: false },
  // --- Peer ---
  { number: 23, text: 'เข้ากับผู้ใหญ่ได้ดีกว่าเด็กในวัยเดียวกัน', subscale: 'peer', isReversed: false },
  // --- Emotional ---
  { number: 24, text: 'ขี้กลัว รู้สึกหวาดกลัวได้ง่าย', subscale: 'emotional', isReversed: false },
  // --- Hyperactivity (กลับคะแนน) ---
  { number: 25, text: 'ทำงานได้จนสำเร็จ มีความตั้งใจในการทำงาน', subscale: 'hyperactivity', isReversed: true },
] as const;

/**
 * ข้อมูล Subscale ทั้ง 5 ด้าน พร้อมเกณฑ์ตัดคะแนน (ฉบับครู)
 * cutoff: [normalMax, borderlineMax] → borderlineMax+1 ขึ้นไป = abnormal
 */
export const SDQ_SUBSCALES: Record<SdqSubscaleKey, SdqSubscaleInfo> = {
  emotional: {
    key: 'emotional',
    nameTh: 'พฤติกรรมด้านอารมณ์',
    nameEn: 'Emotional Symptoms',
    icon: '💙',
    color: '#5b8def',
    gradientFrom: '#667eea',
    gradientTo: '#764ba2',
    cutoff: [3, 4],
    isStrength: false,
  },
  conduct: {
    key: 'conduct',
    nameTh: 'พฤติกรรมเกเร',
    nameEn: 'Conduct Problems',
    icon: '🔥',
    color: '#f97066',
    gradientFrom: '#f093fb',
    gradientTo: '#f5576c',
    cutoff: [3, 4],
    isStrength: false,
  },
  hyperactivity: {
    key: 'hyperactivity',
    nameTh: 'อยู่ไม่นิ่ง/สมาธิสั้น',
    nameEn: 'Hyperactivity',
    icon: '⚡',
    color: '#fbbf24',
    gradientFrom: '#f6d365',
    gradientTo: '#fda085',
    cutoff: [5, 6],
    isStrength: false,
  },
  peer: {
    key: 'peer',
    nameTh: 'ความสัมพันธ์กับเพื่อน',
    nameEn: 'Peer Problems',
    icon: '👥',
    color: '#34d399',
    gradientFrom: '#a8edea',
    gradientTo: '#fed6e3',
    cutoff: [5, 6],
    isStrength: false,
  },
  prosocial: {
    key: 'prosocial',
    nameTh: 'จุดแข็ง/สัมพันธภาพสังคม',
    nameEn: 'Prosocial Behaviour',
    icon: '🌟',
    color: '#a78bfa',
    gradientFrom: '#a18cd1',
    gradientTo: '#fbc2eb',
    cutoff: [3, 3],
    isStrength: true,
  },
} as const;

/** ลำดับการแสดงผล Subscales */
export const SDQ_SUBSCALE_ORDER: readonly SdqSubscaleKey[] = [
  'emotional',
  'conduct',
  'hyperactivity',
  'peer',
  'prosocial',
] as const;

/**
 * เกณฑ์คะแนนรวม Total Difficulty (ไม่รวม Prosocial)
 * ปกติ: 0–15 | เสี่ยง: 16–17 | มีปัญหา: 18–40
 */
export const SDQ_TOTAL_DIFFICULTY_CUTOFF = {
  normalMax: 15,
  borderlineMax: 17,
} as const;

/** ข้อมูลระดับผลคัดกรอง */
export const SDQ_CLASSIFICATION_INFO: Record<
  SdqClassification,
  {
    readonly label: string;
    readonly description: string;
    readonly color: string;
    readonly bgColor: string;
    readonly borderColor: string;
    readonly icon: string;
  }
> = {
  normal: {
    label: 'ปกติ',
    description: 'ยังไม่พบสัญญาณเสี่ยงเด่นชัด',
    color: '#16a34a',
    bgColor: 'rgba(22, 163, 74, 0.08)',
    borderColor: 'rgba(22, 163, 74, 0.25)',
    icon: '✅',
  },
  borderline: {
    label: 'เสี่ยง / Borderline',
    description: 'เริ่มมีสัญญาณที่ควรเฝ้าระวัง',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.08)',
    borderColor: 'rgba(217, 119, 6, 0.25)',
    icon: '⚠️',
  },
  abnormal: {
    label: 'มีปัญหา / Abnormal',
    description: 'ควรติดตาม ช่วยเหลือ หรือส่งต่อผู้เชี่ยวชาญตามความเหมาะสม',
    color: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.08)',
    borderColor: 'rgba(220, 38, 38, 0.25)',
    icon: '🔴',
  },
} as const;

/** คำแนะนำตามระดับผลคัดกรอง */
export const SDQ_RECOMMENDATIONS: Record<SdqClassification, readonly string[]> = {
  normal: [
    'นักเรียนมีพฤติกรรมอยู่ในเกณฑ์ปกติ',
    'ควรส่งเสริมจุดแข็งที่มีอยู่อย่างต่อเนื่อง',
    'สร้างบรรยากาศการเรียนรู้ที่เป็นมิตรและสนับสนุน',
    'ติดตามประเมินซ้ำเป็นระยะ (อย่างน้อยปีละ 1 ครั้ง)',
  ],
  borderline: [
    'นักเรียนเริ่มมีสัญญาณที่ควรเฝ้าระวัง',
    'ควรสังเกตพฤติกรรมอย่างใกล้ชิดในช่วง 1–3 เดือนข้างหน้า',
    'พูดคุยกับนักเรียนและผู้ปกครองเพื่อทำความเข้าใจปัจจัยที่เกี่ยวข้อง',
    'หากพฤติกรรมไม่ดีขึ้น ควรปรึกษาครูแนะแนวหรือนักจิตวิทยา',
    'ประเมินซ้ำภายใน 3 เดือน',
  ],
  abnormal: [
    'นักเรียนมีพฤติกรรมที่ต้องการการช่วยเหลือ',
    'ควรส่งต่อครูแนะแนว หรือนักจิตวิทยาโรงเรียนเพื่อประเมินเพิ่มเติม',
    'พิจารณาส่งต่อผู้เชี่ยวชาญด้านสุขภาพจิตตามความเหมาะสม',
    'สร้างแผนดูแลช่วยเหลือรายบุคคลร่วมกับผู้ปกครอง',
    'ติดตามและประเมินซ้ำอย่างสม่ำเสมอ (ทุก 1–2 เดือน)',
    'บันทึกพฤติกรรมที่สังเกตเห็นเพื่อเป็นข้อมูลอ้างอิง',
  ],
} as const;

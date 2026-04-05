import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const studentAddSchema = z.object({
  studentId: z
    .string()
    .min(1, 'กรุณากรอกรหัสนักศึกษา')
    .min(10, 'รหัสนักเรียนต้องมีอย่างน้อย 10 ตัวอักษร')
    .max(20, 'รหัสนักเรียนต้องมีไม่เกิน 20 ตัวอักษร'),
  title: z.string().min(1, 'กรุณาเลือกคำนำหน้าชื่อ'),
  firstName: z
    .string()
    .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อต้องมีไม่เกิน 100 ตัวอักษร'),
  lastName: z
    .string()
    .min(2, 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'นามสกุลต้องมีไม่เกิน 100 ตัวอักษร'),
  classroom: z
    .object({
      id: z.string(),
      name: z.string(),
      department: z.object({ id: z.string(), name: z.string() }).optional(),
      level: z.object({ id: z.string(), levelName: z.string() }).optional(),
    })
    .nullable(),
  idCard: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{13}$/.test(val), 'เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก'),
  birthDate: z
    .date()
    .nullable()
    .refine((date) => !date || date <= new Date(), 'วันเกิดไม่ถูกต้อง')
    .refine(
      (date) => !date || new Date().getFullYear() - date.getFullYear() >= 10,
      'อายุต้องมากกว่า 10 ปี'
    ),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10}$/.test(val), 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'),
  addressLine1: z.string().optional(),
});

export type StudentAddFormData = z.infer<typeof studentAddSchema>;

export const useStudentAddForm = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<StudentAddFormData>({
    defaultValues: {
      studentId: '',
      title: '',
      firstName: '',
      lastName: '',
      classroom: null,
      idCard: '',
      birthDate: null,
      phone: '',
      addressLine1: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(studentAddSchema),
  });

  return {
    control,
    handleSubmit,
    reset,
    errors,
    isDirty,
    isValid,
  };
};

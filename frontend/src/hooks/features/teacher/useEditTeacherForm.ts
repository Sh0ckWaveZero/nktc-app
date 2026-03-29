import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Teacher } from '@/views/apps/teacher/list/utils/teacherUtils';

const thaiTextRegex = /^[\u0E00-\u0E7F\s]+$/;
const alphanumericRegex = /^[A-Za-z0-9]+$/;
const numericRegex = /^[0-9]+$/;

export const editTeacherSchema = z.object({
  firstName: z
    .string()
    .min(3, 'ชื่อต้องมีอย่างน้อย 3 ตัวอักษร')
    .regex(thaiTextRegex, 'กรุณากรอกภาษาไทยเท่านั้น'),
  lastName: z
    .string()
    .min(3, 'นามสกุลต้องมีอย่างน้อย 3 ตัวอักษร')
    .regex(thaiTextRegex, 'กรุณากรอกภาษาไทยเท่านั้น'),
  username: z
    .string()
    .min(3, 'ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร')
    .regex(alphanumericRegex, 'กรุณากรอกเฉพาะภาษาอังกฤษเท่านั้น'),
  idCard: z.string().regex(numericRegex, 'กรุณากรอกเฉพาะตัวเลขเท่านั้น').or(z.literal('')),
  birthDate: z.date().nullable(),
  jobTitle: z.string().min(1, 'กรุณาเลือกตำแหน่ง'),
  status: z.string().min(1, 'กรุณาเลือกสถานะ'),
});

export type EditTeacherFormData = z.infer<typeof editTeacherSchema>;

const normalizeStatus = (status: string | undefined): string => {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s === 'true' || s === 'active') return 'active';
  if (s === 'false' || s === 'inactive') return 'inactive';
  return s;
};

export const useEditTeacherForm = (data: Teacher | null) => {
  const account = data?.user?.account;
  const user = data?.user;

  const defaultValues = useMemo(
    () => ({
      firstName: (account?.firstName as string) ?? (data?.firstName as string) ?? '',
      lastName: (account?.lastName as string) ?? (data?.lastName as string) ?? '',
      username: (user?.username as string) ?? (data?.username as string) ?? '',
      idCard: (account?.idCard as string) ?? (data?.idCard as string) ?? '',
      birthDate: account?.birthDate
        ? new Date(account.birthDate as string | Date)
        : data?.birthDate
          ? new Date(data.birthDate as string | Date)
          : null,
      jobTitle: data?.jobTitle ?? '',
      status: normalizeStatus(data?.status),
    }),
    [data, account, user],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTeacherFormData>({
    defaultValues,
    mode: 'onBlur',
    resolver: zodResolver(editTeacherSchema),
  });

  useEffect(() => {
    if (data) {
      reset(defaultValues);
    }
  }, [data, reset, defaultValues]);

  return {
    control,
    errors,
    handleSubmit,
    reset,
    defaultValues,
  };
};

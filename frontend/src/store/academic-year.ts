import { create } from 'zustand';

interface AcademicYearState {
  academicYear: number | null;
  activeAcademicYear: number | null;
  version: number | null;
  selectedAcademicYear: number | null;
  selectYear: (academicYear: number | null) => void;
  setScope: (academicYear: number, activeAcademicYear: number, version: number) => void;
}

/** เก็บปีที่เลือกใน UI และส่ง Scope เดียวกันให้ HTTP client */
export const useAcademicYearStore = create<AcademicYearState>((set) => ({
  academicYear: null,
  activeAcademicYear: null,
  version: null,
  selectedAcademicYear: null,
  selectYear: (selectedAcademicYear) => set({ selectedAcademicYear }),
  setScope: (academicYear, activeAcademicYear, version) => set({ academicYear, activeAcademicYear, version }),
}));

export type CheckInLevel = {
  id: string;
  levelName: string;
  levelFullName: string;
};

export type CheckInDepartment = {
  id: string;
  departmentId: string;
  name: string;
};

export type CheckInAccount = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
};

export type CheckInBy = {
  id: string;
  username: string;
  account: CheckInAccount;
};

export type CheckInClassroom = {
  id: string;
  name: string;
  level: CheckInLevel;
  department: CheckInDepartment;
  present: number;
  presentPercent: number;
  absent: number;
  absentPercent: number;
  late: number;
  latePercent: number;
  leave: number;
  leavePercent: number;
  internship: number;
  internshipPercent: number;
  total: number;
  checkInDate: string | null;
  checkInBy?: CheckInBy;
};

export type ReportCheckIn = {
  students: number;
  checkIn: CheckInClassroom[] | undefined;
};

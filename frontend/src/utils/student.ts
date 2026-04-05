/**
 * Helper functions for extracting student data from various API response structures.
 *
 * Handles two shapes returned by different endpoints:
 *   - /students/list  → { studentId, fullName, title, classroom, user?: { account } }
 *   - /students/…     → { studentId, user: { username, account: { title, firstName, lastName } }, classroom }
 */

export function getStudentAccount(row: any): { title?: string; firstName?: string; lastName?: string } | null {
  return row.user?.account || row.account || null;
}

export function getStudentName(row: any): string {
  const account = getStudentAccount(row);
  if (account) {
    return `${account.title || ''}${account.firstName || ''} ${account.lastName || ''}`.trim();
  }
  return row.fullName || '';
}

export function getStudentId(row: any): string {
  return row.studentId || row.user?.username || row.username || '';
}

export function getStudentClassroom(row: any): { id?: string; name?: string } | null {
  return row.classroom || row.student?.classroom || null;
}

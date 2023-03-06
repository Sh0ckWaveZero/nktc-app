import React from 'react';

type Props = {
  children: React.ReactNode;
};

const StudentBadnessReport = (props: Props) => {
  return <div>StudentBadnessReport</div>;
};

StudentBadnessReport.acl = {
  action: 'read',
  subject: 'student-badness-report',
};
export default StudentBadnessReport;

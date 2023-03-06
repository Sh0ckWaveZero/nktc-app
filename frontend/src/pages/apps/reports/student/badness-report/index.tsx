import React from 'react';

type Props = {};

const StudentBadnessReport = (props: Props) => {
  return <div>StudentBadnessReport</div>;
};

StudentBadnessReport.acl = {
  action: 'read',
  subject: 'student-badness-report',
};
export default StudentBadnessReport;

import React from 'react';

type Props = {
  children: React.ReactNode;
};

const StudentGoodnessReport = (props: Props) => {
  return <div>StudentGoodnessReport </div>;
};

StudentGoodnessReport.acl = {
  action: 'read',
  subject: 'student-goodness-report',
}
export default StudentGoodnessReport;

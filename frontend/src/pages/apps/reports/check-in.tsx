// ** React Imports
import { useState } from 'react';

// ** MUI Imports
import { Typography, CardHeader, Card, Grid, Avatar, CardContent, Checkbox, Container } from '@mui/material';
import { DataGrid, GridCellParams, GridColumns } from '@mui/x-data-grid';

// ** Icons Imports

// ** Store Imports
import {
  useUserStore,
  useReportCheckInStore,
  useTeacherStore,
} from '@/store/index';

// ** Custom Components Imports
import TableHeader from '@/views/apps/reports/check-in/TableHeader';
import { useEffectOnce } from '@/hooks/userCommon';

// ** Config
import toast, { Toaster } from 'react-hot-toast';
import ReactHotToast from '@/@core/styles/libs/react-hot-toast';
import { HiOutlineFlag } from 'react-icons/hi';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { isEmpty } from '@/@core/utils/utils';
import CustomNoRowsOverlayCheckedIn from '@/@core/components/check-in/checkedIn';

interface CellType {
  // row: teachersTypes;
  row: any;
}

const StudentCheckIn = () => {
  // ** Hooks
  const { userInfo, accessToken } = useUserStore();
  const { reportCheckIn, getReportCheckIn, addReportCheckIn } = useReportCheckInStore();
  const { fetchClassroomByTeachId } = useTeacherStore();

  // ** Local State
  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [pageSize, setPageSize] = useState<number>(isEmpty(currentStudents) ? 0 : currentStudents.length);
  const [isPresentCheckAll, setIsPresentCheckAll] = useState(false);
  const [isAbsentCheckAll, setIsAbsentCheckAll] = useState(false);
  const [isLateCheckAll, setIsLateCheckAll] = useState(false);
  const [isLeaveCheckAll, setIsLeaveCheckAll] = useState(false);
  const [isPresentCheck, setIsPresentCheck] = useState<any>([]);
  const [isAbsentCheck, setIsAbsentCheck] = useState<any>([]);
  const [isLateCheck, setIsLateCheck] = useState<any>([]);
  const [isLeaveCheck, setIsLeaveCheck] = useState<any>([]);
  const [classroomName, setClassroomName] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);

  // ดึงข้อมูลห้องเรียนของครู
  useEffectOnce(() => {
    const fetch = async () => {
      await fetchClassroomByTeachId(accessToken, userInfo?.teacher?.id).then(async ({ data }: any) => {
        setClassroomName(await data?.classrooms[0]);
        setClassrooms(await data?.classrooms);
        setCurrentStudents(await data?.classrooms[0]?.students);
        getReportCheckIn(accessToken, {
          teacher: userInfo?.teacher?.id,
          classroom: await data?.classrooms[0]?.id,
        });
      });
    };
    fetch();
  });

  const onHandleToggle = (action: string, param: any): void => {
    switch (action) {
      case 'present':
        handleTogglePresent(param);
        break;
      case 'absent':
        handleToggleAbsent(param);
        break;
      case 'late':
        handleToggleLate(param);
        break;
      case 'leave':
        handleToggleLeave(param);
        break;
      default:
        break;
    }
    onRemoveToggleOthers(action, param);
  };

  const handleTogglePresent = (param: any): void => {
    setIsPresentCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleAbsent = (param: any): void => {
    setIsAbsentCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleLate = (param: any): void => {
    setIsLateCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleLeave = (param: any): void => {
    setIsLeaveCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const onSetToggle = (prevState: any, param: any): any => {
    const prevSelection = prevState;
    const index = prevSelection.indexOf(param.id);

    let newSelection: any[] = [];

    if (index === -1) {
      newSelection = newSelection.concat(prevSelection, param.id);
    } else if (index === 0) {
      newSelection = newSelection.concat(prevSelection.slice(1));
    } else if (index === prevSelection.length - 1) {
      newSelection = newSelection.concat(prevSelection.slice(0, -1));
    } else if (index > 0) {
      newSelection = newSelection.concat(prevSelection.slice(0, index), prevSelection.slice(index + 1));
    }
    return newSelection;
  };

  const onRemoveToggleOthers = (action: string, param: any): void => {
    switch (action) {
      case 'present':
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        break;
      case 'absent':
        onHandlePresentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        break;
      case 'late':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLeaveChecked(param);
        break;
      case 'leave':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
        break;
      default:
        break;
    }
  };

  const onHandlePresentChecked = (param: any): void => {
    if (isPresentCheck.includes(param.id)) {
      setIsPresentCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleAbsentChecked = (param: any): void => {
    if (isAbsentCheck.includes(param.id)) {
      setIsAbsentCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleLateChecked = (param: any): void => {
    if (isLateCheck.includes(param.id)) {
      setIsLateCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleLeaveChecked = (param: any): void => {
    if (isLeaveCheck.includes(param.id)) {
      setIsLeaveCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onRemoveToggle = (prevState: any, param: any): any => {
    const prevSelection = prevState;
    const index = prevSelection.indexOf(param.id);

    let newSelection: any[] = [];

    if (index !== -1) {
      newSelection = newSelection.concat(prevSelection.slice(0, index), prevSelection.slice(index + 1));
    }

    return newSelection;
  };

  const onHandleCheckAll = (e: any, action: string): void => {
    if (action === 'present') {
      handleTogglePresentAll();
    } else if (action === 'absent') {
      handleToggleAbsentAll();
    } else if (action === 'late') {
      handleToggleLateAll();
    } else if (action === 'leave') {
      handleToggleLeaveAll();
    }
    onClearAll(action);
  };

  const handleTogglePresentAll = (): void => {
    setIsPresentCheckAll(!isPresentCheckAll);
    setIsPresentCheck(currentStudents.map((student: any) => student.id));
    if (isPresentCheckAll) {
      setIsPresentCheck([]);
    }
  };

  const handleToggleAbsentAll = (): void => {
    setIsAbsentCheckAll(!isAbsentCheckAll);
    setIsAbsentCheck(currentStudents.map((student: any) => student.id));
    if (isAbsentCheckAll) {
      setIsAbsentCheck([]);
    }
  };

  const handleToggleLateAll = (): void => {
    setIsLateCheckAll(!isLateCheckAll);
    setIsLateCheck(currentStudents.map((student: any) => student.id));
    if (isLateCheckAll) {
      setIsLateCheck([]);
    }
  };

  const handleToggleLeaveAll = (): void => {
    setIsLeaveCheckAll(!isLeaveCheckAll);
    setIsLeaveCheck(currentStudents.map((student: any) => student.id));
    if (isLeaveCheckAll) {
      setIsLeaveCheck([]);
    }
  };

  const onClearAll = (action: string): void => {
    if (action !== 'present') {
      setIsPresentCheckAll(false);
      setIsPresentCheck([]);
    }
    if (action !== 'absent') {
      setIsAbsentCheckAll(false);
      setIsAbsentCheck([]);
    }
    if (action !== 'late') {
      setIsLateCheckAll(false);
      setIsLateCheck([]);
    }
    if (action !== 'leave') {
      setIsLeaveCheckAll(false);
      setIsLeaveCheck([]);
    }
  };

  const columns: GridColumns = [
    {
      flex: 0.25,
      minWidth: 220,
      field: 'fullName',
      headerName: 'ชื่อ-สกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        return (
          <Typography noWrap variant='body1' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
            {row.title + '' + row.firstName + ' ' + row.lastName}
          </Typography>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'present',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: (params: GridCellParams) => (
        <Checkbox
          color='success'
          checked={isPresentCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
          onClick={() => onHandleToggle('present', params)}
        />
      ),
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'มาเรียน'}
          <Checkbox
            color='success'
            sx={{ p: 0 }}
            checked={isPresentCheckAll || false}
            onChange={(e) => onHandleCheckAll(e, 'present')}
            style={{ paddingLeft: '4px' }}
          />
        </Container>
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'absent',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: (params: GridCellParams) => (
        <Checkbox
          color='error'
          checked={isAbsentCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
          onClick={() => onHandleToggle('absent', params)}
        />
      ),
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'ขาด'}
          <Checkbox
            color='error'
            sx={{ p: 0 }}
            checked={isAbsentCheckAll || false}
            onChange={(e) => onHandleCheckAll(e, 'absent')}
            style={{ paddingLeft: '4px' }}
          />
        </Container>
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'leave',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: (params: GridCellParams) => (
        <Checkbox
          color='secondary'
          checked={isLeaveCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
          onClick={() => onHandleToggle('leave', params)}
        />
      ),
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'ลา'}
          <Checkbox
            color='secondary'
            sx={{ p: 0 }}
            checked={isLeaveCheckAll || false}
            onChange={(e) => onHandleCheckAll(e, 'leave')}
            style={{ paddingLeft: '4px' }}
          />
        </Container>
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'late',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: (params: GridCellParams) => (
        <Checkbox
          color='warning'
          checked={isLateCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
          onClick={() => onHandleToggle('late', params)}
        />
      ),
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'มาสาย'}
          <Checkbox
            color='warning'
            sx={{ p: 0 }}
            checked={isLateCheckAll || false}
            onChange={(e) => onHandleCheckAll(e, 'late')}
            style={{ paddingLeft: '4px' }}
          />
        </Container>
      ),
    },
  ];

  // submit
  const onHandleSubmit = async (event: any) => {
    event.preventDefault();
    const data = {
      teacherId: userInfo?.teacher?.id,
      classroomId: classroomName.id,
      present: isPresentCheck,
      absent: isAbsentCheck,
      late: isLateCheck,
      leave: isLeaveCheck,
      checkInDate: new Date(),
      status: '1',
    };
    const totalStudents = isPresentCheck.concat(isAbsentCheck, isLateCheck, isLeaveCheck).length;
    if (totalStudents === currentStudents.length && isEmpty(reportCheckIn)) {
      toast.promise(addReportCheckIn(accessToken, data), {
        loading: 'กำลังบันทึกเช็คชื่อ...',
        success: 'บันทึกเช็คชื่อสำเร็จ',
        error: 'เกิดข้อผิดพลาด',
      });
      onClearAll('');
    } else {
      toast.error('กรุณาเช็คชื่อของนักเรียนทุกคนให้ครบถ้วน!');
    }
  };

  const handleSelectChange = (event: any) => {
    event.preventDefault();
    onClearAll('');
    const {
      target: { value },
    } = event;
    const classroomName: any = classrooms.filter((item: any) => item.name === value)[0];
    setClassroomName(classroomName);
    setCurrentStudents(classroomName.students);
    getReportCheckIn(accessToken, {
      teacher: userInfo?.teacher?.id,
      classroom: classroomName?.id,
    });
  };

  return (
    <>
      <ReactHotToast>
        <Toaster position='top-right' reverseOrder={false} toastOptions={{ className: 'react-hot-toast' }} />
      </ReactHotToast>

      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                  <HiOutlineFlag />
                </Avatar>
              }
              sx={{ color: 'text.primary' }}
              title={`เช็คชื่อตอนเช้า กิจกรรมหน้าเสาธง`}
              subheader={`${new Date(Date.now()).toLocaleDateString('th-TH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`}
            />
            <CardContent>
              {!isEmpty(currentStudents) && (
                <Typography variant='subtitle1'>{`ชั้น ${classroomName?.name} จำนวน ${currentStudents.length} คน`}</Typography>
              )}
            </CardContent>
            <TableHeader
              value={classrooms}
              handleChange={handleSelectChange}
              defaultValue={classroomName?.name}
              handleSubmit={onHandleSubmit}
            />
            <DataGrid
              autoHeight
              columns={columns}
              rows={isEmpty(reportCheckIn) ? currentStudents ?? [] : []}
              disableColumnMenu
              headerHeight={150}
              rowHeight={isEmpty(reportCheckIn) ? (isEmpty(currentStudents) ? 100 : 50) : 100}
              rowsPerPageOptions={[pageSize]}
              onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
              components={{
                NoRowsOverlay: isEmpty(reportCheckIn) ? CustomNoRowsOverlay : CustomNoRowsOverlayCheckedIn,
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

StudentCheckIn.acl = {
  action: 'read',
  subject: 'check-in-page',
};

export default StudentCheckIn;

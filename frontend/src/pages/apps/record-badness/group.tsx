import { Avatar, Button, Card, CardHeader, Grid, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { Fragment, useCallback, useContext, useState } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import DialogClassroomGoodnessGroup from '@/views/apps/record-goodness/DialogClassroomGroup';
import DialogStudentGroup from '@/views/apps/record-goodness/DialogStudentsGroup';
import { HiThumbDown } from 'react-icons/hi';
import Icon from '@/@core/components/icon';
import { LocalStorageService } from '@/services/localStorageService';
import TableHeaderGroup from '@/views/apps/record-goodness/TableHeaderGroup';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/userCommon';
import useFetchClassrooms from '@/hooks/useFetchClassrooms';
import useStudentList from '@/hooks/useStudentList';
import { deepOrange } from '@mui/material/colors';
import DialogAddGroup from '@/views/apps/record-badness/DialogAddGroup';

interface CellType {
  row: any;
}

const localStorageService = new LocalStorageService();
export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

const BadnessGroup = () => {
  // ** Hooks
  const auth = useAuth();

  const storedToken = localStorageService.getToken()!;
  const ability = useContext(AbilityContext);

  // ** Local State
  const [students, setStudents] = useState<any>([]);
  // const [studentLoading, setStudentLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [selectStudents, setSelectStudents] = useState<any>([] || null);
  const [searchValue, setSearchValue] = useState<any>({});
  const debouncedValue = useDebounce<string>(searchValue, 500);
  const [openSelectStudents, setOpenSelectStudents] = useState(false);
  const [currentImage, setCurrentImage] = useState<any>(null);
  const [openGoodnessDetail, setOpenGoodnessDetail] = useState(false);
  const [openSelectClassroom, setOpenSelectClassroom] = useState(false);
  const [selectClassrooms, setSelectClassrooms] = useState<any>([] || null);

  const [classrooms, classroomLoading] = useFetchClassrooms(storedToken);
  const { loading: studentLoading, students: studentsList } = useStudentList(storedToken, debouncedValue);

  const onSelectStudents = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      setSelectStudents(newValue);
      setSearchValue({ fullName: null });
    },
    [setSelectStudents],
  );

  const onSearchStudents = useCallback((event: any, value: any, reason: any) => {
    setSearchValue({ fullName: value });
  }, []);

  const onHandleClassroomChange = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      setDefaultClassroom(newValue);
      setSearchValue({ classroomId: newValue?.id });
    },
    [setDefaultClassroom],
  );

  const handleAddStudents = useCallback(() => {
    handleCloseSelectStudents();
    const selectedIds = selectStudents.map((student: any) => student.id);
    const uniqueStudents = students.filter((student: any) => !selectedIds.includes(student.id));
    setStudents([...uniqueStudents, ...selectStudents]);
  }, [students, selectStudents]);

  const handleDeleteStudent = useCallback(
    (id: any) => {
      const newStudents = students.filter((student: any) => student.id !== id);
      setStudents(newStudents);
    },
    [students],
  );

  const onOpenSelectStudents = () => {
    setOpenSelectStudents(true);
  };
  const handleCloseSelectStudents = () => {
    setOpenSelectStudents(false);
  };

  const onOpenSelectClassroom = () => {
    setOpenSelectClassroom(true);
  };

  const handleCloseClassroom = () => {
    setOpenSelectClassroom(false);
  };

  const onOpenGoodnessDetail = () => {
    setOpenGoodnessDetail(true);
  };

  const handleCloseGoodnessDetail = () => {
    setOpenGoodnessDetail(false);
  };

  const onSelectionModelChange = useCallback(
    (newSelection: any) => {
      const selectedRowsData = newSelection.map((id: any) => studentsList.find((row: any) => row.id === id));
      setSelectClassrooms(selectedRowsData);
    },
    [setSelectClassrooms, studentsList],
  );

  const onAddClassroom = useCallback(() => {
    handleCloseClassroom();
    setDefaultClassroom(null);

    const selectedIds = selectClassrooms.map((student: any) => student.id);
    const uniqueStudents = students.filter((student: any) => !selectedIds.includes(student.id));

    setStudents([...uniqueStudents, ...selectClassrooms]);
    setSearchValue({ classroomId: null });
  }, [students, selectClassrooms]);

  const handleSusses = useCallback(() => {
    setStudents([]);
    setDefaultClassroom(null);
    setSearchValue({ fullName: null });
  }, []);

  const columns: GridColumns = [
    {
      flex: 0.13,
      minWidth: 160,
      field: 'studentId',
      headerName: 'รหัสนักเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { studentId } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {studentId}
          </Typography>
        );
      },
    },
    {
      flex: 0.17,
      minWidth: 150,
      field: 'fullName',
      headerName: 'ชื่อ-นามสกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { title, fullName } = row;

        const studentName = title + fullName;
        return (
          <Tooltip title={studentName} arrow>
            <span>
              <Typography
                noWrap
                variant='subtitle2'
                sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
              >
                {studentName}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'classroomName',
      headerName: 'ชั้นเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { classroom } = row;
        return (
          <Tooltip title={classroom?.name} arrow>
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {classroom?.name}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.12,
      minWidth: 100,
      field: 'action',
      headerName: 'ดำเนินการ',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        return (
          <Tooltip title={'นำรายชื่อออกเฉพาะแถวที่เลือก'} arrow>
            <span>
              <Button
                startIcon={<Icon icon='line-md:account-remove' />}
                variant='contained'
                color='error'
                size='small'
                onClick={() => handleDeleteStudent(row.id)}
              >
                นำรายชื่อออก
              </Button>
            </span>
          </Tooltip>
        );
      },
    },
  ];

  return (
    ability?.can('read', 'report-badness-group-page') &&
    auth?.user?.role !== 'Admin' && (
      <Fragment>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                    <HiThumbDown
                      style={{
                        color: deepOrange[800],
                      }}
                    />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`บันทึกพฤติกรรมที่ไม่เหมาะสมแบบกลุ่ม ${students ? students.length : 0} คน`}
              />
              <TableHeaderGroup
                onOpenClassroom={onOpenSelectClassroom}
                onOpenGoodnessDetail={onOpenGoodnessDetail}
                onOpenSelectStudents={onOpenSelectStudents}
                students={students}
                tooltipName='เพิ่มรายละเอียดต่าง ๆ ในการบันทึกพฤติกรรมที่ไม่เหมาะสม'
              />
              <DataGrid
                autoHeight
                columns={columns}
                rows={students}
                disableColumnMenu
                pageSize={pageSize}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
                components={{
                  NoRowsOverlay: CustomNoRowsOverlay,
                }}
              />
            </Card>
          </Grid>
        </Grid>

        <DialogStudentGroup
          handleCloseSelectStudents={handleCloseSelectStudents}
          onAddStudents={handleAddStudents}
          onSearchStudents={onSearchStudents}
          onSelectStudents={onSelectStudents}
          openSelectStudents={openSelectStudents}
          studentLoading={studentLoading}
          studentsList={studentsList}
        />

        <DialogClassroomGoodnessGroup
          classroomLoading={classroomLoading}
          classrooms={classrooms}
          defaultClassroom={defaultClassroom}
          handleCloseSelectStudents={handleCloseSelectStudents}
          onAddClassroom={onAddClassroom}
          onCloseClassroom={handleCloseClassroom}
          onHandleClassroomChange={onHandleClassroomChange}
          onSelectionModelChange={onSelectionModelChange}
          openSelectClassroom={openSelectClassroom}
          selectClassrooms={selectClassrooms}
          studentLoading={studentLoading}
          students={students}
          studentsList={studentsList}
        />

        <DialogAddGroup
          onOpen={openGoodnessDetail}
          data={students}
          handleClose={handleCloseGoodnessDetail}
          auth={auth}
          handleSusses={handleSusses}
        />
      </Fragment>
    )
  );
};

BadnessGroup.acl = {
  action: 'read',
  subject: 'report-badness-group-page',
};

export default BadnessGroup;

import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { useClassroomStore, useVisitStore } from '@/store/index';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { CustomNoRowsOverlayCheckedIn } from '@/@core/components/check-in/checkedIn';
import { Icon } from '@iconify/react';
import IconifyIcon from '@/@core/components/icon';
import TableHeader from '@/views/apps/visit/TableHeader';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffectOnce } from '@/hooks/userCommon';
import { useRouter } from 'next/router';
import RenderAvatar from '@/@core/components/avatar';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface CellType {
  row: any;
}

const VisitStudentList = () => {
  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const alignCenter = useMediaQuery(theme.breakpoints.down('md')) ? 'center' : 'left';
  const { fetchVisits }: any = useVisitStore((state) => ({ fetchVisits: state.fetchVisits }), shallow);
  const { fetchClassroom }: any = useClassroomStore((state) => ({ fetchClassroom: state.fetchClassroom }), shallow);

  const ability = useContext(AbilityContext);
  const router = useRouter();
  const useLocal = useLocalStorage();
  const storedToken = useLocal.getToken()!;
  // ** Local State
  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [pageSize, setPageSize] = useState<number>(isEmpty(currentStudents) ? 0 : currentStudents.length);

  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [reportCheckIn, setReportCheckIn] = useState<any>(false);
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState<boolean>(true);
  const [visitNo, setVisitNo] = useState<string>('1');
  const [isHovered, setIsHovered] = useState(false);

  useEffectOnce(() => {
    try {
      if (!ability?.can('read', 'visit-student-list-page') || (auth?.user?.role as string) === 'Admin') {
        router.push('/401');
        return;
      }

      if (isEmpty(auth?.user?.teacherOnClassroom)) {
        toast.error('ไม่พบข้อมูลที่ปรีกษาประจำชั้น');
        router.push('/pages/account-settings');
        return;
      }

      const defaultClassroomId = auth?.user?.teacherOnClassroom[0];
      const fetchData = async () => {
        const data = await fetchClassroom(storedToken);
        if (!isEmpty(data) && !isEmpty(defaultClassroomId)) {
          const classroomMain = data.find((classroom: any) => classroom?.id === defaultClassroomId);
          setDefaultClassroom(classroomMain);
          const teacherClassrooms = data.filter((classroom: any) =>
            auth?.user?.teacherOnClassroom.includes(classroom?.id),
          );
          setClassrooms(teacherClassrooms);
        }
      };

      fetchData();
    } catch (error) {
      toast.error('ไม่พบข้อมูลที่ปรีกษาประจำชั้น');
      router.push('/pages/account-settings');
    }
  });

  useEffect(() => {
    const fetch = async () => {
      await fetchVisits(storedToken, {
        classroomId: defaultClassroom?.id,
        academicYear: 2566,
        visitNo: visitNo,
      }).then(async (data: any) => {
        console.log(data?.students);
        setCurrentStudents(data?.students);
      });
    };
    fetch();
  }, [defaultClassroom, visitNo]);

  const timer: any = useRef(null);

  const handleMouseEnter = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timer.current = setTimeout(() => {
      setIsHovered(false);
    }, 2000);
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
        const account = row?.account;
        const studentInfo = row?.student;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderAvatar row={account} storedToken={storedToken} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography
                noWrap
                variant='body2'
                sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
              >
                {account?.title + '' + account?.firstName + ' ' + account?.lastName}
              </Typography>
              <Stack direction='row' alignItems='center' gap={1}>
                <Typography
                  noWrap
                  variant='caption'
                  sx={{
                    textDecoration: 'none',
                  }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  @{studentInfo?.studentId}
                </Typography>
                {isHovered && (
                  <Tooltip title='คัดลอกไปยังคลิปบอร์ด' placement='top'>
                    <span>
                      <IconButton
                        size='small'
                        sx={{ p: 0, ml: 0 }}
                        onClick={() => {
                          navigator.clipboard.writeText(row?.studentId);
                          toast.success('คัดลอกไปยังคลิปบอร์ดเรียบร้อยแล้ว');
                        }}
                      >
                        <IconifyIcon
                          icon='pajamas:copy-to-clipboard'
                          color={`${theme.palette.grey[500]}`}
                          width={16}
                          height={16}
                        />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          </Box>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'address',
      headerName: 'ที่อยู่',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: alignCenter,
      renderCell: ({ row }: CellType) => {
        const account = row?.account;

        const renderAddress = (data: any) => {
          if (data?.addressLine1 && data?.subDistrict && data?.district && data?.province && data?.postalCode) {
            return `${data?.addressLine1} ต.${data?.subDistrict} อ.${data?.district} จ.${data?.province} ${data?.postalCode}`;
          } else {
            return 'ไม่มีข้อมูล';
          }
        };
        return (
          <Typography noWrap variant='body2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
            {renderAddress(account)}
          </Typography>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'detail',
      headerName: 'ข้อมูลทั่วไป',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: alignCenter,
      renderCell: ({ row }: CellType) => {
        const url: string = '/apps/visit/add';
        return (
          <Button
            variant='contained'
            color='error'
            startIcon={<IconifyIcon icon='fluent:home-more-20-regular' width={16} height={16} />}
            onClick={() => {
              router.push(
                {
                  pathname: url,
                  query: {
                    data: JSON.stringify({ ...row, defaultClassroom }),
                  },
                },
                url,
                { shallow: true },
              );
            }}
          >
            <Typography
              noWrap
              variant='body2'
              sx={{ fontWeight: 400, color: theme.palette.common.white, textDecoration: 'none' }}
            >
              {'กรอกข้อมูล'}
            </Typography>
          </Button>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'attach-file',
      headerName: 'แนบไฟล์รูปภาพ',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: alignCenter,
      renderCell: ({ row }: CellType) => {
        return (
          <Button
            variant='contained'
            color='error'
            startIcon={<IconifyIcon icon='fluent:image-add-24-regular' width={16} height={16} />}
          >
            <Typography
              noWrap
              variant='body2'
              sx={{ fontWeight: 400, color: theme.palette.common.white, textDecoration: 'none' }}
            >
              {'อัพโหลดรูปภาพ'}
            </Typography>
          </Button>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'map',
      headerName: 'ตำแหน่งที่อยู่',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: alignCenter,
      renderCell: ({ row }: CellType) => {
        return (
          <Button variant='contained' color='error' startIcon={<IconifyIcon icon='uiw:map' width={16} height={16} />}>
            <Typography
              noWrap
              variant='body2'
              sx={{ fontWeight: 400, color: theme.palette.common.white, textDecoration: 'none' }}
            >
              {'ที่ตั้งบ้าน'}
            </Typography>
          </Button>
        );
      },
    },
  ];

  return (
    ability?.can('read', 'visit-student-list-page') &&
    (auth?.user?.role as string) !== 'Admin' && (
      <Fragment>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                    <Icon icon='mdi:home-switch-outline' width={24} height={24} />
                  </Avatar>
                }
                sx={{
                  color: 'text.primary',
                  pb: 2,
                }}
                title={`บันทึกการเยี่ยมบ้านนักเรียน ${defaultClassroom?.name} จำนวน ${currentStudents.length} คน`}
              />

              <TableHeader
                classrooms={classrooms}
                handleChange={(event: any) => {
                  const classroom = classrooms?.find((item: any) => item?.name === event?.target?.value);
                  setDefaultClassroom(classroom);
                }}
                defaultValue={defaultClassroom?.name}
                visitNo={visitNo}
                handleVisitNoChange={(event: any) => {
                  setVisitNo(event?.target?.value);
                }}
              />
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  '& .internship--cell': {
                    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
                  },
                  '& .internship--header': {
                    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
                  },
                }}
              >
                <DataGrid
                  autoHeight
                  columns={columns}
                  rows={isEmpty(reportCheckIn) ? currentStudents ?? [] : []}
                  disableColumnMenu
                  headerHeight={150}
                  loading={loading}
                  rowHeight={isEmpty(reportCheckIn) ? (isEmpty(currentStudents) ? 200 : 50) : 200}
                  rowsPerPageOptions={[pageSize, 100]} // Include `pageSize` and `100` in the rowsPerPageOptions
                  onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
                  components={{
                    NoRowsOverlay: isEmpty(reportCheckIn) ? CustomNoRowsOverlay : CustomNoRowsOverlayCheckedIn,
                  }}
                />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Fragment>
    )
  );
};

VisitStudentList.acl = {
  action: 'read',
  subject: 'visit-student-list-page',
};

export default VisitStudentList;

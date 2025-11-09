import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Fragment } from 'react';
import { BriefcasePlusOutline } from 'mdi-material-ui';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Theme,
} from '@mui/material';
import Link from 'next/link';
import { styled } from '@mui/material/styles';
import RenderAvatar from '@/@core/components/avatar';
import CustomChip from '@/@core/components/mui/chip';
import IconifyIcon from '@/@core/components/icon';
import { userRoleType, userStatusType } from '@/@core/utils/types';
import { isEmpty } from '@/@core/utils/utils';
import { USER_ROLE_ICONS, USER_STATUS_COLORS } from '../constants';
import { Teacher, getFullName } from './teacherUtils';
import RowOptions from '../components/RowOptions';

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  marginRight: theme.spacing(8),
}));

interface GetColumnsParams {
  isMobile: boolean;
  handleEdit: (data: Teacher) => void;
  handleDelete: (data: Teacher) => void;
  handleChangePassword: (data: Teacher) => void;
  onAddClassroom: (teacher: Teacher) => void;
  theme: Theme;
}

export const getColumns = ({
  isMobile,
  handleEdit,
  handleDelete,
  handleChangePassword,
  onAddClassroom,
  theme,
}: GetColumnsParams): GridColDef<Teacher>[] => [
  {
    flex: 0.25,
    minWidth: isMobile ? 150 : 200,
    field: 'fullName',
    headerName: 'ชื่อผู้ใช้ระบบ',
    editable: false,
    sortable: false,
    hideSortIcons: true,
    renderCell: (params: GridRenderCellParams<Teacher>) => {
      const { id, username } = params.row;
      const fullName = getFullName(params.row);

      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RenderAvatar row={params.row} />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
            <StyledLink href={`/apps/user/view/${id}`} passHref id={`teacher-name-link-${id}`}>
              <Typography
                noWrap
                component='p'
                variant='body2'
                sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
              >
                {fullName}
              </Typography>
            </StyledLink>
            <StyledLink href={`/apps/user/view/${id}`} passHref id={`teacher-username-link-${id}`}>
              <Typography noWrap component='p' variant='caption' sx={{ textDecoration: 'none' }}>
                @{username}
              </Typography>
            </StyledLink>
          </Box>
        </Box>
      );
    },
  },
  {
    flex: 0.2,
    minWidth: isMobile ? 100 : 120,
    field: 'teacherOnClassroom',
    headerName: 'ครูประจำชั้น',
    hide: isMobile,
    editable: false,
    sortable: false,
    hideSortIcons: true,
    align: 'center',
    renderCell: (params: GridRenderCellParams<Teacher>) => {
      const { teacherOnClassroom = [], classrooms = [] } = params.row;
      const hasClassrooms = teacherOnClassroom.length > 0 && !isEmpty(classrooms);

      return (
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='center'
          spacing={3}
          divider={<Divider orientation='vertical' flexItem />}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip
              title={
                hasClassrooms ? (
                  <Fragment>
                    {classrooms.map((item: string, index: number) => (
                      <Typography key={`${item}-${index}`} variant='body2' sx={{ color: 'common.white' }}>
                        {item}
                      </Typography>
                    ))}
                  </Fragment>
                ) : (
                  <Typography variant='body2' sx={{ color: 'common.white' }}>
                    ยังไม่ได้เลือกเป็นปรึกษา
                  </Typography>
                )
              }
            >
              <span>
                <IconButton
                  id={`teacher-classroom-badge-${params.row.id}`}
                  sx={{
                    cursor: 'default',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                    '&:active': {
                      backgroundColor: 'transparent',
                    },
                    '&:disabled': {
                      backgroundColor: 'transparent',
                    },
                  }}
                  disabled
                >
                  <Badge
                    badgeContent={teacherOnClassroom.length > 0 ? teacherOnClassroom.length : '0'}
                    color={teacherOnClassroom.length > 0 ? 'error' : 'secondary'}
                    sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 15, minWidth: 15 } }}
                  >
                    <IconifyIcon
                      icon={'mdi:school-outline'}
                      width={22}
                      height={22}
                      style={{
                        color: teacherOnClassroom.length > 0
                          ? theme.palette.success.main
                          : theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.68)'
                            : 'rgba(58, 53, 65, 0.68)',
                      }}
                    />
                  </Badge>
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <IconButton
              id={`teacher-add-classroom-${params.row.id}`}
              onClick={() => onAddClassroom(params.row)}
              aria-label='เพิ่มห้องที่ปรึกษา'
            >
              <Tooltip
                title={
                  <Typography variant='body2' sx={{ color: 'common.white' }}>
                    เพิ่มห้องที่ปรึกษา
                  </Typography>
                }
              >
                <BriefcasePlusOutline fontSize='small' sx={{ mr: 1, color: 'success.main' }} />
              </Tooltip>
            </IconButton>
          </Box>
        </Stack>
      );
    },
  },
  {
    flex: 0.15,
    field: 'role',
    minWidth: isMobile ? 100 : 120,
    headerName: 'บทบาท',
    hide: isMobile,
    editable: false,
    sortable: false,
    hideSortIcons: true,
    renderCell: (params: GridRenderCellParams<Teacher>) => {
      const roleKey = params.row.role?.toLowerCase() || '';
      return (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {USER_ROLE_ICONS[roleKey]}
          <Typography
            variant='body2'
            noWrap
            sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}
          >
            {userRoleType[params.row.role] ?? 'ไม่ระบุ'}
          </Typography>
        </Box>
      );
    },
  },
  {
    flex: 0.15,
    minWidth: isMobile ? 100 : 130,
    headerName: 'ลงชื่อเข้าใช้งานสะสม',
    field: 'totalLogin',
    hide: isMobile,
    editable: false,
    sortable: false,
    hideSortIcons: true,
    align: 'center',
    renderCell: (params: GridRenderCellParams<Teacher>) => {
      const loginCount = params.row.loginCountByUser?.length || 0;
      return (
        <Typography
          variant='body2'
          noWrap
          sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}
        >
          {loginCount} วัน
        </Typography>
      );
    },
  },
  {
    flex: 0.15,
    minWidth: isMobile ? 70 : 80,
    field: 'status',
    headerName: 'สถานะ',
    hide: isMobile,
    editable: false,
    sortable: false,
    hideSortIcons: true,
    align: 'center',
    renderCell: (params: GridRenderCellParams<Teacher>) => {
      const status = typeof params.row.status === 'string' ? params.row.status.toLowerCase() : '';
      const statusKey = status || '';
      return (
        <CustomChip
          skin='light'
          size='small'
          label={userStatusType[params.row.status as string]}
          color={USER_STATUS_COLORS[statusKey]}
          sx={{ textTransform: 'capitalize' }}
        />
      );
    },
  },
  {
    flex: 0.15,
    minWidth: 90,
    sortable: false,
    field: 'actions',
    headerName: 'การดำเนินการอื่น ๆ',
    editable: false,
    hideSortIcons: true,
    align: 'right',
    renderCell: (params: GridRenderCellParams<Teacher>) => (
      <RowOptions
        row={params.row}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleChangePassword={handleChangePassword}
      />
    ),
  },
];


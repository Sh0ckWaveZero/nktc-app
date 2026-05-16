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
import { alpha, styled } from '@mui/material/styles';
import RenderAvatar from '@/@core/components/avatar';
import CustomChip from '@/@core/components/mui/chip';
import IconifyIcon from '@/@core/components/icon';
import { userRoleType, userStatusType } from '@/@core/utils/types';
import { USER_ROLE_ICONS, USER_STATUS_COLORS } from '../constants';
import { Teacher, getFullName, getTeacherDisplayData } from './teacherUtils';
import RowOptions from '../components/RowOptions';

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  marginRight: theme.spacing(3),
  maxWidth: '100%',
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
    minWidth: isMobile ? 150 : 240,
    field: 'fullName',
    headerName: 'ชื่อผู้ใช้ระบบ',
    editable: false,
    sortable: false,
    hideSortIcons: true,
    renderCell: (params: GridRenderCellParams<Teacher>) => {
      const { id } = params.row;
      const fullName = getFullName(params.row);
      const username = params.row.user?.username || '';
      const displayData = getTeacherDisplayData(params.row);

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <RenderAvatar row={displayData} />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', minWidth: 0 }}>
            <StyledLink href={`/apps/user/view/${id}`} passHref id={`teacher-name-link-${id}`}>
              <Typography
                noWrap
                component='p'
                variant='body2'
                sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.01em', textDecoration: 'none' }}
              >
                {fullName}
              </Typography>
            </StyledLink>
            <StyledLink href={`/apps/user/view/${id}`} passHref id={`teacher-username-link-${id}`}>
              <Typography
                noWrap
                component='p'
                variant='caption'
                sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}
              >
                @{username}
              </Typography>
            </StyledLink>
          </Box>
        </Box>
      );
    },
  },
  {
    flex: 0.18,
    minWidth: isMobile ? 100 : 150,
    field: 'teacherOnClassroom',
    headerName: 'ครูประจำชั้น',
    editable: false,
    sortable: false,
    hideSortIcons: true,
    align: 'center',
    renderCell: (params: GridRenderCellParams<Teacher>) => {
      const teacherOnClassroom = params.row.teacherOnClassroom || [];
      const classrooms = params.row.classroomNames || params.row.classrooms || [];
      const hasClassrooms = teacherOnClassroom.length > 0;

      return (
        <Stack
          direction='row'
          spacing={1.5}
          divider={
            <Divider
              orientation='vertical'
              flexItem
              sx={{ borderColor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.22 : 0.16) }}
            />
          }
          sx={{ alignItems: 'center', justifyContent: 'center' }}
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
                    borderRadius: 2,
                    border: `1px solid ${alpha(hasClassrooms ? theme.palette.success.main : theme.palette.text.primary, hasClassrooms ? 0.22 : 0.1)}`,
                    backgroundColor: hasClassrooms
                      ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.08)
                      : alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                    '&:hover': {
                      backgroundColor: hasClassrooms
                        ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.08)
                        : alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                    },
                    '&:active': {
                      backgroundColor: hasClassrooms
                        ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.08)
                        : alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                    },
                    '&:disabled': {
                      backgroundColor: hasClassrooms
                        ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.08)
                        : alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                    },
                  }}
                  disabled
                >
                  <Badge
                    badgeContent={teacherOnClassroom.length > 0 ? teacherOnClassroom.length : '0'}
                    color={teacherOnClassroom.length > 0 ? 'primary' : 'secondary'}
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
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.22)}`,
                backgroundColor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.18 : 0.13),
                },
              }}
            >
              <Tooltip
                title={
                  <Typography variant='body2' sx={{ color: 'common.white' }}>
                    เพิ่มห้องที่ปรึกษา
                  </Typography>
                }
              >
                <BriefcasePlusOutline fontSize='small' sx={{ color: 'success.main' }} />
              </Tooltip>
            </IconButton>
          </Box>
        </Stack>
      );
    },
  },
  {
    flex: 0.14,
    field: 'role',
    minWidth: isMobile ? 100 : 120,
    headerName: 'บทบาท',
    editable: false,
    sortable: false,
    hideSortIcons: true,
    renderCell: (params: GridRenderCellParams<Teacher>) => {
      const role = params.row.user?.role || '';
      const roleKey = role.toLowerCase();
      return (
        <Box
          sx={{
            px: 1.5,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            border: (muiTheme) => `1px solid ${alpha(muiTheme.palette.info.main, muiTheme.palette.mode === 'dark' ? 0.2 : 0.14)}`,
            bgcolor: (muiTheme) => alpha(muiTheme.palette.info.main, muiTheme.palette.mode === 'dark' ? 0.1 : 0.065),
          }}
        >
          {USER_ROLE_ICONS[roleKey]}
          <Typography
            variant='body2'
            noWrap
            sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}
          >
            {userRoleType[role] ?? 'ไม่ระบุ'}
          </Typography>
        </Box>
      );
    },
  },
  {
    flex: 0.13,
    minWidth: isMobile ? 100 : 120,
    headerName: 'เข้าใช้งาน (วัน)',
    field: 'totalLogin',
    editable: false,
    sortable: false,
    hideSortIcons: true,
    align: 'center',
    renderCell: (params: GridRenderCellParams<Teacher>) => {
      const loginCount = params.row.loginCountByUser?.length || 0;
      return (
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            color: loginCount > 0 ? 'primary.dark' : 'text.secondary',
            bgcolor: (muiTheme) =>
              alpha(loginCount > 0 ? muiTheme.palette.primary.main : muiTheme.palette.text.primary, loginCount > 0 ? 0.08 : 0.045),
          }}
        >
          <Typography variant='body2' noWrap sx={{ fontWeight: 800, textTransform: 'capitalize' }}>
            {loginCount} วัน
          </Typography>
        </Box>
      );
    },
  },
  {
    flex: 0.12,
    minWidth: isMobile ? 70 : 96,
    field: 'status',
    headerName: 'สถานะ',
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
    flex: 0.12,
    minWidth: 120,
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

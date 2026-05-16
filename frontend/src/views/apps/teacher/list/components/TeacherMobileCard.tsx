'use client';

import { BriefcasePlusOutline } from 'mdi-material-ui';
import {
  Badge,
  Box,
  Card,
  IconButton,
  Typography,
} from '@mui/material';
import React from 'react';
import Link from 'next/link';
import { styled, useTheme } from '@mui/material/styles';
import RenderAvatar from '@/@core/components/avatar';
import CustomChip from '@/@core/components/mui/chip';
import IconifyIcon from '@/@core/components/icon';
import { userRoleType, userStatusType } from '@/@core/utils/types';
import { USER_ROLE_ICONS, USER_STATUS_COLORS } from '../constants';
import { Teacher, getFullName, getTeacherDisplayData } from '../utils/teacherUtils';
import RowOptions from './RowOptions';

const StyledLink = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
});

interface TeacherMobileCardProps {
  teacher: Teacher;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  onChangePassword: (teacher: Teacher) => void;
  onAddClassroom: (teacher: Teacher) => void;
}

const InfoLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography variant='caption' sx={{ color: 'text.disabled', fontWeight: 500, display: 'block', mb: 0.25 }}>
    {children}
  </Typography>
);

const TeacherMobileCard = React.memo(({
  teacher,
  onEdit,
  onDelete,
  onChangePassword,
  onAddClassroom,
}: TeacherMobileCardProps) => {
  const theme = useTheme();
  const displayData = getTeacherDisplayData(teacher);
  const fullName = getFullName(teacher);
  const teacherOnClassroom = teacher.teacherOnClassroom || [];
  const loginCount = teacher.loginCountByUser?.length || 0;
  const role = teacher.user?.role || '';
  const roleKey = role.toLowerCase();
  const status = typeof teacher.status === 'string' ? teacher.status.toLowerCase() : '';

  const classroomColor = teacherOnClassroom.length > 0
    ? theme.palette.success.main
    : theme.palette.action.disabled;

  return (
    <Card
      sx={{
        mb: 2,
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      {/* Header row: avatar + name + actions */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
          <RenderAvatar row={displayData} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <StyledLink href={`/apps/user/view/${teacher.id}`} passHref>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {fullName}
              </Typography>
            </StyledLink>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              @{displayData.username}
            </Typography>
          </Box>
        </Box>
        <RowOptions
          row={teacher}
          handleEdit={onEdit}
          handleDelete={onDelete}
          handleChangePassword={onChangePassword}
        />
      </Box>

      {/* Info grid: 2 columns */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2.5,
        }}
      >
        <Box>
          <InfoLabel>บทบาท</InfoLabel>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {USER_ROLE_ICONS[roleKey]}
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {userRoleType[role] ?? 'ไม่ระบุ'}
            </Typography>
          </Box>
        </Box>

        <Box>
          <InfoLabel>สถานะ</InfoLabel>
          <CustomChip
            skin='light'
            size='small'
            label={userStatusType[teacher.status as string]}
            color={USER_STATUS_COLORS[status]}
          />
        </Box>

        <Box>
          <InfoLabel>เข้าใช้งาน</InfoLabel>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {loginCount} วัน
          </Typography>
        </Box>

        <Box>
          <InfoLabel>ครูประจำชั้น</InfoLabel>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Badge
              badgeContent={teacherOnClassroom.length > 0 ? teacherOnClassroom.length : '0'}
              color={teacherOnClassroom.length > 0 ? 'primary' : 'secondary'}
              sx={{ '& .MuiBadge-badge': { fontSize: 8, height: 16, minWidth: 16 } }}
            >
              <IconifyIcon
                icon='mdi:school-outline'
                width={20}
                height={20}
                style={{ color: classroomColor }}
              />
            </Badge>
            <IconButton
              size='small'
              onClick={() => onAddClassroom(teacher)}
              sx={{ p: 0.75 }}
              aria-label='เพิ่มห้องที่ปรึกษา'
            >
              <BriefcasePlusOutline fontSize='small' sx={{ color: 'success.main' }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}, (prevProps, nextProps) => {
  const prevDisplay = getTeacherDisplayData(prevProps.teacher);
  const nextDisplay = getTeacherDisplayData(nextProps.teacher);

  return prevDisplay.id === nextDisplay.id &&
    prevDisplay.avatar === nextDisplay.avatar &&
    prevDisplay.firstName === nextDisplay.firstName &&
    prevDisplay.lastName === nextDisplay.lastName &&
    prevDisplay.role === nextDisplay.role &&
    prevDisplay.status === nextDisplay.status &&
    JSON.stringify(prevProps.teacher.teacherOnClassroom) === JSON.stringify(nextProps.teacher.teacherOnClassroom) &&
    prevProps.teacher.loginCountByUser?.length === nextProps.teacher.loginCountByUser?.length;
});

TeacherMobileCard.displayName = 'TeacherMobileCard';

export default TeacherMobileCard;

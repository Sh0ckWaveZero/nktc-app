'use client';

import { BriefcasePlusOutline } from 'mdi-material-ui';
import {
  Badge,
  Box,
  Card,
  IconButton,
  Stack,
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
import { Teacher, getFullName } from '../utils/teacherUtils';
import RowOptions from './RowOptions';

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  marginRight: theme.spacing(8),
}));

interface TeacherMobileCardProps {
  teacher: Teacher;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  onChangePassword: (teacher: Teacher) => void;
  onAddClassroom: (teacher: Teacher) => void;
}

const TeacherMobileCard = React.memo(({ 
  teacher, 
  onEdit,
  onDelete,
  onChangePassword,
  onAddClassroom 
}: TeacherMobileCardProps) => {
  const theme = useTheme();
  const fullName = getFullName(teacher);
  const { teacherOnClassroom = [], classrooms = [] } = teacher;
  const loginCount = teacher.loginCountByUser?.length || 0;
  const roleKey = teacher.role?.toLowerCase() || '';
  const status = typeof teacher.status === 'string' ? teacher.status.toLowerCase() : '';
  
  // Calculate icon color based on theme mode
  const iconColor = teacherOnClassroom.length > 0
    ? theme.palette.success.main
    : theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.68)'
      : 'rgba(58, 53, 65, 0.68)';

  return (
    <Card
      sx={{
        mb: 2,
        p: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        '&:active': {
          boxShadow: 2,
          transform: 'scale(0.98)',
          transition: 'all 0.2s',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <RenderAvatar row={teacher} />
          <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
            <StyledLink href={`/apps/user/view/${teacher.id}`} passHref>
              <Typography
                variant='body1'
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  textDecoration: 'none',
                  mb: 0.5,
                  fontSize: '0.95rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {fullName}
              </Typography>
            </StyledLink>
            <StyledLink href={`/apps/user/view/${teacher.id}`} passHref>
              <Typography
                variant='caption'
                sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.75rem' }}
              >
                @{teacher.username}
              </Typography>
            </StyledLink>
          </Box>
        </Box>
        <Box sx={{ ml: 1 }}>
          <RowOptions
            row={teacher}
            handleEdit={onEdit}
            handleDelete={onDelete}
            handleChangePassword={onChangePassword}
          />
        </Box>
      </Box>

      <Stack spacing={2}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
            บทบาท
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {USER_ROLE_ICONS[roleKey]}
            <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {userRoleType[teacher.role] ?? 'ไม่ระบุ'}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
            สถานะ
          </Typography>
          <CustomChip
            skin='light'
            size='small'
            label={userStatusType[teacher.status as string]}
            color={USER_STATUS_COLORS[status as string]}
            sx={{ fontSize: '0.75rem', height: 24 }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
            ลงชื่อเข้าใช้งาน
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {loginCount} วัน
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
            ครูประจำชั้น
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge
              badgeContent={teacherOnClassroom.length > 0 ? teacherOnClassroom.length : '0'}
              color={teacherOnClassroom.length > 0 ? 'error' : 'secondary'}
              sx={{ '& .MuiBadge-badge': { fontSize: 8, height: 16, minWidth: 16 } }}
            >
              <IconifyIcon
                icon={'mdi:school-outline'}
                width={22}
                height={22}
                style={{ color: iconColor }}
              />
            </Badge>
            <IconButton
              size='small'
              onClick={() => onAddClassroom(teacher)}
              sx={{
                p: 1,
                minWidth: 40,
                minHeight: 40,
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
              aria-label='เพิ่มห้องที่ปรึกษา'
            >
              <BriefcasePlusOutline fontSize='small' sx={{ color: 'success.main' }} />
            </IconButton>
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Only re-render if teacher data actually changed
  return prevProps.teacher.id === nextProps.teacher.id &&
         prevProps.teacher.avatar === nextProps.teacher.avatar &&
         prevProps.teacher.firstName === nextProps.teacher.firstName &&
         prevProps.teacher.lastName === nextProps.teacher.lastName &&
         prevProps.teacher.role === nextProps.teacher.role &&
         prevProps.teacher.status === nextProps.teacher.status &&
         JSON.stringify(prevProps.teacher.teacherOnClassroom) === JSON.stringify(nextProps.teacher.teacherOnClassroom) &&
         prevProps.teacher.loginCountByUser?.length === nextProps.teacher.loginCountByUser?.length;
});

TeacherMobileCard.displayName = 'TeacherMobileCard';

export default TeacherMobileCard;


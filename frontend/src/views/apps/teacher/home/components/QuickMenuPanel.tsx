'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import IconifyIcon from '@/@core/components/icon';
import CanViewNavLink from '@/layouts/components/acl/CanViewNavLink';
import type { NavLink } from '@/@core/layouts/types';
import type { CardMenuProps } from '@/@core/components/card-statistics/types';
import { QuickActionButton } from '../styles';

type FilteredShortcut = CardMenuProps & { navLink: NavLink & { path: string } };

interface QuickMenuPanelProps {
  filteredShortcuts: FilteredShortcut[];
  visibleShortcuts: FilteredShortcut[];
  activeTab: number;
  showAllShortcuts: boolean;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  onShortcutClick: (path: string) => void;
  onToggleShowAll: () => void;
}

const QuickMenuPanel = ({
  filteredShortcuts,
  visibleShortcuts,
  activeTab,
  showAllShortcuts,
  onTabChange,
  onShortcutClick,
  onToggleShowAll,
}: QuickMenuPanelProps) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            กล่องเครื่องมือครู (Quick Menu)
          </Typography>
        }
        subheader={`${filteredShortcuts.length} ฟังก์ชันที่เปิดใช้งานตามระดับสิทธิ์ของคุณ`}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={onTabChange}
            variant='scrollable'
            scrollButtons='auto'
            sx={{ minHeight: 38 }}
          >
            <Tab label='ทั้งหมด' sx={{ minHeight: 38, py: 1, fontSize: '0.8rem' }} />
            <Tab label='บันทึกรายวัน' sx={{ minHeight: 38, py: 1, fontSize: '0.8rem' }} />
            <Tab label='รายงาน' sx={{ minHeight: 38, py: 1, fontSize: '0.8rem' }} />
            <Tab label='จัดการระบบ' sx={{ minHeight: 38, py: 1, fontSize: '0.8rem' }} />
          </Tabs>
        </Box>

        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          {visibleShortcuts.map((item, index) => (
            <Grid size={{ xs: 6 }} key={`shortcut-${index}`}>
              <CanViewNavLink navLink={item.navLink}>
                <QuickActionButton elevation={0} onClick={() => onShortcutClick(item.navLink.path)}>
                  <Avatar
                    className='action-avatar'
                    sx={{
                      backgroundColor: alpha(item.color || '#4f46eh', 0.1),
                      color: item.color || 'primary.main',
                      width: 48,
                      height: 48,
                      mb: 2,
                      boxShadow: `0 3px 8px ${alpha(item.color || '#4f46ef', 0.15)}`,
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Typography
                    variant='subtitle2'
                    sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary', mb: 0.5, lineHeight: 1.2 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{ color: 'text.secondary', display: 'block', fontSize: '0.725rem', lineHeight: 1.1 }}
                  >
                    {item.subtitle}
                  </Typography>
                </QuickActionButton>
              </CanViewNavLink>
            </Grid>
          ))}
        </Grid>

        {activeTab === 0 && filteredShortcuts.length > 8 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              size='small'
              variant='text'
              onClick={onToggleShowAll}
              endIcon={<IconifyIcon icon={showAllShortcuts ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
            >
              {showAllShortcuts ? 'แสดงเมนูลัดย่อลง' : 'แสดงเครื่องมือทั้งหมด'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickMenuPanel;

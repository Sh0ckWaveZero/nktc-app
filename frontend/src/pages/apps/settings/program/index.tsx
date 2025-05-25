import { alpha, Card, CardHeader, Grid, IconButton, Menu, MenuItem, styled, Typography, Button } from '@mui/material';
import { DeleteOutline, DotsVertical, Plus } from 'mdi-material-ui';
import { MouseEvent, useCallback, useEffect, useState, useRef } from 'react';

import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { DataGrid, gridClasses, GridColDef } from '@mui/x-data-grid';
import { LocalStorageService } from '@/services/localStorageService';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../hooks/useAuth';
import { useDebounce } from '@/hooks/userCommon';
import AddProgramDrawer from '@/views/apps/settings/program/AddProgramDrawer';
import TableHeader from '@/views/apps/settings/program/TableHeader';
import DialogDeleteProgram from '@/views/apps/settings/program/DialogDeleteProgram';
import { useProgramStore, ProgramType } from '@/store/apps/program';

interface RowOptionsType {
  row: ProgramType;
  handleDelete: (data: ProgramType) => void;
  handleEdit: (data: ProgramType) => void;
}

interface CellType {
  row: ProgramType;
}

const localStorageService = new LocalStorageService();
const accessToken = localStorageService.getToken()!;

const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[100],
    '&:hover, &.Mui-hovered': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
      '&:hover, &.Mui-hovered': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY + theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
        ),
        '@media (hover: none)': {
          backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
        },
      },
    },
  },
}));

const RowOptions = ({ row, handleDelete, handleEdit }: RowOptionsType) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const rowOptionsOpen = Boolean(anchorEl);

  const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleRowOptionsClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteRow = () => {
    handleDelete(row);
    handleRowOptionsClose();
  };

  const handleEditRow = () => {
    handleEdit(row);
    handleRowOptionsClose();
  };

  return (
    <>
      <IconButton size='small' onClick={handleRowOptionsClick}>
        <DotsVertical />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        <MenuItem onClick={handleEditRow}>
          <Plus fontSize='small' sx={{ mr: 2, color: 'primary.main' }} />
          แก้ไข
        </MenuItem>
        <MenuItem onClick={handleDeleteRow}>
          <DeleteOutline fontSize='small' sx={{ mr: 2, color: 'error.main' }} />
          ลบ
        </MenuItem>
      </Menu>
    </>
  );
};

const ProgramManagement = () => {
  const { user } = useAuth();

  // ** Store
  const {
    programs,
    loading,
    error,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    setError,
    uploadPrograms,
  } = useProgramStore();

  // ** States
  const [searchValue, setSearchValue] = useState('');
  const [addProgramOpen, setAddProgramOpen] = useState(false);
  const [editProgramData, setEditProgramData] = useState<ProgramType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ** Columns
  const columns: GridColDef[] = [
    {
      flex: 0.1,
      minWidth: 100,
      field: 'programId',
      headerName: 'รหัสสาขาวิชา',
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.programId}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 200,
      field: 'name',
      headerName: 'ชื่อสาขาวิชา',
      renderCell: ({ row }: CellType) => (
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          {row.name}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'description',
      headerName: 'รายละเอียด',
      renderCell: ({ row }: CellType) => (
        <Typography variant='body2' noWrap>
          {row.description || '-'}
        </Typography>
      ),
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'status',
      headerName: 'สถานะ',
      renderCell: ({ row }: CellType) => {
        const status = row.status === 'active' ? 'ใช้งาน' : row.status === 'inactive' ? 'ไม่ใช้งาน' : 'ไม่ระบุ';
        const color =
          row.status === 'active' ? 'success.main' : row.status === 'inactive' ? 'error.main' : 'text.secondary';

        return (
          <Typography
            variant='body2'
            sx={{
              color: color,
              fontWeight: 600,
            }}
          >
            {status}
          </Typography>
        );
      },
    },
    {
      flex: 0.1,
      minWidth: 90,
      sortable: false,
      field: 'actions',
      headerName: 'การจัดการ',
      renderCell: ({ row }: CellType) => <RowOptions row={row} handleDelete={handleDelete} handleEdit={handleEdit} />,
    },
  ];

  // ** Effects
  useEffect(() => {
    loadPrograms();
  }, [debouncedSearchValue]);

  // ** Handle error display
  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error, setError]);

  // ** Functions
  const loadPrograms = useCallback(async () => {
    try {
      await fetchPrograms(accessToken, {
        search: debouncedSearchValue,
      });
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล'); // เพิ่มการแจ้งเตือน Error
    }
  }, [debouncedSearchValue, fetchPrograms]);

  const handleAddProgram = () => {
    setEditProgramData(null);
    setAddProgramOpen(true);
  };

  const handleEdit = (programData: ProgramType) => {
    setEditProgramData(programData);
    setAddProgramOpen(true);
  };

  const handleDelete = (programData: ProgramType) => {
    setSelectedProgram(programData);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProgram) return;

    try {
      await deleteProgram(accessToken, selectedProgram.id);
      toast.success('ลบสาขาวิชาเรียบร้อยแล้ว');
    } catch (error) {
      // Error handled ใน store
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProgram(null);
    }
  };

  const handleProgramSubmit = async (programData: Partial<ProgramType>) => {
    try {
      if (editProgramData) {
        // Update existing program
        await updateProgram(accessToken, editProgramData.id, programData);
        toast.success('แก้ไขสาขาวิชาเรียบร้อยแล้ว');
      } else {
        // Add new program
        await createProgram(accessToken, programData);
        toast.success('เพิ่มสาขาวิชาเรียบร้อยแล้ว');
      }
      setAddProgramOpen(false);
      // โหลดข้อมูลใหม่หลังจากบันทึก
      await loadPrograms();
    } catch (error) {
      // Error handled ใน store
    }
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    try {
      await uploadPrograms(accessToken, file);
      toast.success('อัปโหลดไฟล์สำเร็จ');
      await loadPrograms();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    }
  };

  const handleFileInputClick = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='จัดการสาขาวิชา'
            sx={{
              pb: 6, // เพิ่ม padding-bottom ให้มากขึ้นเพื่อความสวยงาม
              '& .MuiCardHeader-title': {
                letterSpacing: '.15px',
              },
            }}
          />
          <TableHeader
            value={searchValue}
            handleFilter={setSearchValue}
            handleUploadFile={handleFileInputClick}
            handleUpload={handleFileUpload}
            fileInputRef={fileInputRef}
          />
          <StripedDataGrid
            autoHeight
            rows={programs}
            columns={columns}
            loading={loading}
            disableSelectionOnClick
            getRowId={(row) => {
              if ('id' in row) return row.id;
              if ('programId' in row) return row.programId;
              return '';
            }}
            getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd')}
            components={{
              NoRowsOverlay: CustomNoRowsOverlay,
            }}
            sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
          />
        </Card>
      </Grid>

      <AddProgramDrawer
        open={addProgramOpen}
        toggle={() => setAddProgramOpen(!addProgramOpen)}
        onSubmit={handleProgramSubmit}
        editData={editProgramData}
      />

      <DialogDeleteProgram
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        programName={selectedProgram?.name || ''}
      />
    </Grid>
  );
};

ProgramManagement.acl = {
  action: 'manage',
  subject: 'settings-program-list-pages',
};

export default ProgramManagement;

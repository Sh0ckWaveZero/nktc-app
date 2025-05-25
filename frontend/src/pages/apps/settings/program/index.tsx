import { alpha, Card, CardHeader, Grid, IconButton, Menu, MenuItem, styled, Typography } from '@mui/material';
import { DeleteOutline, DotsVertical, Plus } from 'mdi-material-ui';
import { MouseEvent, useCallback, useEffect, useState } from 'react';

import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { DataGrid, gridClasses, GridColDef } from '@mui/x-data-grid';
import { LocalStorageService } from '@/services/localStorageService';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../hooks/useAuth';
import { useDebounce } from '@/hooks/userCommon';
import AddProgramDrawer from '@/views/apps/settings/program/AddProgramDrawer';
import TableHeader from '@/views/apps/settings/program/TableHeader';
import DialogDeleteProgram from '@/views/apps/settings/program/DialogDeleteProgram';

interface RowOptionsType {
  row: ProgramType;
  handleDelete: (data: ProgramType) => void;
  handleEdit: (data: ProgramType) => void;
}

interface CellType {
  row: ProgramType;
}

interface ProgramType {
  id: string;
  programId: string;
  name: string;
  description?: string;
  levelId?: string;
  departmentId?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  createdBy: string;
  updatedBy: string;
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
  
  // ** States
  const [programs, setPrograms] = useState<ProgramType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [addProgramOpen, setAddProgramOpen] = useState(false);
  const [editProgramData, setEditProgramData] = useState<ProgramType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);

  const debouncedSearchValue = useDebounce(searchValue, 500);

  // ** Columns
  const columns: GridColDef[] = [
    {
      flex: 0.1,
      minWidth: 100,
      field: 'programId',
      headerName: 'รหัสสาขาวิชา',
      renderCell: ({ row }: CellType) => (
        <Typography variant='body2'>{row.programId}</Typography>
      ),
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
        const color = row.status === 'active' ? 'success.main' : row.status === 'inactive' ? 'error.main' : 'text.secondary';
        
        return (
          <Typography 
            variant='body2' 
            sx={{ 
              color: color,
              fontWeight: 600
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
      renderCell: ({ row }: CellType) => (
        <RowOptions 
          row={row} 
          handleDelete={handleDelete} 
          handleEdit={handleEdit}
        />
      ),
    },
  ];

  // ** Mock Data (replace with actual API calls)
  const mockPrograms: ProgramType[] = [
    {
      id: 'cmb2dv3560000xjq91benom0n',
      programId: 'P001',
      name: 'ช่างกลโรงงาน',
      description: 'ช่างกลโรงงาน',
      levelId: 'cmb2cuxj00000bn1uf5t8782a',
      departmentId: undefined,
      status: 'active',
      created_at: '2025-05-24T15:27:13.507Z',
      updated_at: '2025-05-24T15:27:13.507Z',
      createdBy: 'Admin',
      updatedBy: 'Admin',
    },
    {
      id: 'cmb2dv3560001xjq973yd509m',
      programId: 'P002',
      name: 'เทคนิคการผลิต',
      description: 'เทคนิคการผลิต',
      levelId: 'cmb2cuxje0001bn1u1c6oxvgg',
      departmentId: undefined,
      status: 'active',
      created_at: '2025-05-24T15:27:13.507Z',
      updated_at: '2025-05-24T15:27:13.507Z',
      createdBy: 'Admin',
      updatedBy: 'Admin',
    },
    {
      id: 'cmb2dv356000dxjq9ouchfv68',
      programId: 'P014',
      name: 'ไฟฟ้า',
      description: 'ไฟฟ้า',
      levelId: 'cmb2cuxje0001bn1u1c6oxvgg',
      departmentId: undefined,
      status: 'active',
      created_at: '2025-05-24T15:27:13.507Z',
      updated_at: '2025-05-24T15:27:13.507Z',
      createdBy: 'Admin',
      updatedBy: 'Admin',
    },
    {
      id: 'cmb2dv357000uxjq9bfy3mzao',
      programId: 'P031',
      name: 'เทคโนโลยีคอมพิวเตอร์',
      description: 'เทคโนโลยีคอมพิวเตอร์',
      levelId: 'cmb2cuxje0001bn1u1c6oxvgg',
      departmentId: undefined,
      status: 'active',
      created_at: '2025-05-24T15:27:13.507Z',
      updated_at: '2025-05-24T15:27:13.507Z',
      createdBy: 'Admin',
      updatedBy: 'Admin',
    },
    {
      id: 'cmb2dv357000xxjq9gjvau651',
      programId: 'P034',
      name: 'เทคโนโลยีธุรกิจดิจิทัล',
      description: 'เทคโนโลยีธุรกิจดิจิทัล',
      levelId: 'cmb2cuxje0001bn1u1c6oxvgg',
      departmentId: undefined,
      status: 'active',
      created_at: '2025-05-24T15:27:13.507Z',
      updated_at: '2025-05-24T15:27:13.507Z',
      createdBy: 'Admin',
      updatedBy: 'Admin',
    },
  ];

  // ** Effects
  useEffect(() => {
    fetchPrograms();
  }, [debouncedSearchValue]);

  // ** Functions
  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await programAPI.getPrograms({ search: debouncedSearchValue });
      // setPrograms(response.data);
      
      // Filter mock data based on search
      const filteredPrograms = mockPrograms.filter(program => 
        program.name.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
        program.programId.toLowerCase().includes(debouncedSearchValue.toLowerCase())
      );
      setPrograms(filteredPrograms);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchValue]);

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
      // TODO: Replace with actual API call
      // await programAPI.deleteProgram(selectedProgram.id);
      
      setPrograms(prev => prev.filter(program => program.id !== selectedProgram.id));
      toast.success('ลบสาขาวิชาเรียบร้อยแล้ว');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProgram(null);
    }
  };

  const handleProgramSubmit = (programData: Partial<ProgramType>) => {
    if (editProgramData) {
      // Update existing program
      setPrograms(prev => 
        prev.map(program => 
          program.id === editProgramData.id 
            ? { ...program, ...programData, updated_at: new Date().toISOString() }
            : program
        )
      );
      toast.success('แก้ไขสาขาวิชาเรียบร้อยแล้ว');
    } else {
      // Add new program
      const newProgram: ProgramType = {
        ...programData as ProgramType,
        id: Date.now().toString(),
        programId: programData.programId || `P${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        createdBy: 'Admin',
        updatedBy: 'Admin',
      };
      setPrograms(prev => [newProgram, ...prev]);
      toast.success('เพิ่มสาขาวิชาเรียบร้อยแล้ว');
    }
    setAddProgramOpen(false);
  };

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='จัดการสาขาวิชา' 
            sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }} 
          />
          <TableHeader
            value={searchValue}
            handleFilter={setSearchValue}
            handleAddProgram={handleAddProgram}
          />
          <StripedDataGrid
            autoHeight
            rows={programs}
            columns={columns}
            loading={loading}
            disableSelectionOnClick
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

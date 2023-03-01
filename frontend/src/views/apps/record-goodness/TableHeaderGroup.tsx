import {
  Button,
  Dialog,
  FormControl,
  Grid,
  styled,
  Tooltip,
} from '@mui/material';

import { Fragment } from 'react';
import Icon from '@/@core/components/icon';
import { isEmpty } from '@/@core/utils/utils';

interface CellType {
  row: any;
}

interface TableHeaderProps {
  onOpenClassroom: () => void;
  onOpenGoodnessDetail: () => void;
  onOpenSelectStudents: () => void;
  students: any;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(5),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(3),
  },
}));


const TableHeaderGroup = (props: TableHeaderProps) => {
  // ** Props
  const { onOpenClassroom, onOpenGoodnessDetail, onOpenSelectStudents, students } = props;

  return (
    <Fragment>
      <Grid
        container
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Grid item xs={12} sm={6}>
          <Grid
            container
            spacing={2}
            sx={{
              p: 5,
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <Tooltip title='เพิ่มรายชื่อนักเรียนมากกว่าหนึ่ง' arrow>
                  <span>
                    <Button
                      fullWidth
                      size='large'
                      color='primary'
                      variant='contained'
                      startIcon={<Icon icon='fluent:people-community-add-20-filled' />}
                      sx={{ fontSize: 16, fontWeight: 500, height: 56 }}
                      onClick={onOpenSelectStudents}
                    >
                      เพิ่มชื่อ
                    </Button>
                  </span>
                </Tooltip>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <Tooltip title='เพิ่มรายชื่อรายชั้นเรียน' arrow>
                  <span>
                    <Button
                      fullWidth
                      size='large'
                      color='warning'
                      variant='contained'
                      startIcon={<Icon icon='mdi:google-classroom' />}
                      sx={{ fontSize: 16, fontWeight: 500, height: 56 }}
                      onClick={onOpenClassroom}
                    >
                      เพิ่มชั้นเรียน
                    </Button>
                  </span>
                </Tooltip>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Grid
            container
            sx={{
              p: 5,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <Tooltip title='เพิ่มรายละเอียดต่าง ๆ ในการบันทึกความดี' arrow>
                  <span>
                    <Button
                      fullWidth
                      size='large'
                      color='success'
                      variant='contained'
                      startIcon={<Icon icon='mdi:star-plus-outline' />}
                      sx={{ fontSize: 16, fontWeight: 500, height: 56 }}
                      disabled={isEmpty(students)}
                      onClick={onOpenGoodnessDetail}
                    >
                      เพิ่มรายละเอียด
                    </Button>
                  </span>
                </Tooltip>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default TableHeaderGroup;

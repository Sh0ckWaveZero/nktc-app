import { Button, FormControl, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { Fragment } from 'react';
import Icon from '@/@core/components/icon';
import { isEmpty } from '@/@core/utils/utils';

interface TableHeaderProps {
  onOpenClassroom: () => void;
  onOpenGoodnessDetail: () => void;
  onOpenSelectStudents: () => void;
  tooltipName: string;
  students: any;
}

const TableHeaderGroup = (props: TableHeaderProps) => {
  // ** Props
  const { onOpenClassroom, onOpenGoodnessDetail, onOpenSelectStudents, students, tooltipName } = props;

  return (
    <Fragment>
      <Grid
        container
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Grid size={{ xs: 12, sm: 6 }}>
          <Grid
            container
            spacing={2}
            sx={{
              p: 5,
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={{ xs: 12, sm: 4 }}>
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
        <Grid size={{ xs: 12, sm: 6 }}>
          <Grid
            container
            sx={{
              p: 5,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
             <Grid size={{ xs: 12, sm: 5 }}>
              <FormControl fullWidth>
                <Tooltip title={tooltipName} arrow>
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

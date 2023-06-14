// ** MUI Imports
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

// ** Types

const SidebarLeft = (props: any) => {
  const {

    mdAbove,

    calendarsColor,
    leftSidebarOpen,
    leftSidebarWidth,
    // handleSelectEvent,
    // handleAllCalendars,
    // handleCalendarsUpdate,
    // handleLeftSidebarToggle,
    // handleAddEventSidebarToggle,
  } = props;

  // const colorsArr = calendarsColor ? Object.entries(calendarsColor) : [];

  // const renderFilters = colorsArr.length
  //   ? colorsArr.map(([key, value]: string[]) => {
  //       return (
  //         <FormControlLabel
  //           key={key}
  //           label={key}
  //           control={
  //             <Checkbox
  //               // color={value as ThemeColor}
  //               // checked={store.selectedCalendars.includes(key as CalendarFiltersType)}
  //               // onChange={() => dispatch(handleCalendarsUpdate(key as CalendarFiltersType))}
  //             />
  //           }
  //         />
  //       );
  //     })
  //   : null;

  // const handleSidebarToggleSidebar = () => {
  //   handleAddEventSidebarToggle();
  //   dispatch(handleSelectEvent(null));
  // };

  // if (renderFilters) {
    return (
      <Drawer
        open={leftSidebarOpen}
        // onClose={handleLeftSidebarToggle}
        variant={mdAbove ? 'permanent' : 'temporary'}
        ModalProps={{
          disablePortal: true,
          disableAutoFocus: true,
          disableScrollLock: true,
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          zIndex: 3,
          display: 'block',
          position: mdAbove ? 'static' : 'absolute',
          '& .MuiDrawer-paper': {
            borderRadius: 1,
            boxShadow: 'none',
            width: leftSidebarWidth,
            borderTopRightRadius: 0,
            alignItems: 'flex-start',
            borderBottomRightRadius: 0,
            p: (theme) => theme.spacing(5),
            zIndex: mdAbove ? 2 : 'drawer',
            position: mdAbove ? 'static' : 'absolute',
          },
          '& .MuiBackdrop-root': {
            borderRadius: 1,
            position: 'absolute',
          },
        }}
      >
        <Button fullWidth variant='contained'>
          เพิ่มกิจกรรม
        </Button>

        <Typography variant='caption' sx={{ mt: 7, mb: 2, textTransform: 'uppercase' }}>
          ประเภทกิจกรรม
        </Typography>
        <FormControlLabel
          label='View All'
          control={
            <Checkbox
              color='secondary'
              // checked={store.selectedCalendars.length === colorsArr.length}

            />
          }
        />
        {/* {renderFilters} */}
      </Drawer>
    );
  // } else {
  //   return null;
  // }
};

export default SidebarLeft;

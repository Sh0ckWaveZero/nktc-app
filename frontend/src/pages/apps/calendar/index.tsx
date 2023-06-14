// ** React Imports
import { useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// ** Redux Imports
// import { useDispatch, useSelector } from 'react-redux'

// ** Hooks
import { useSettings } from '@/@core/hooks/useSettings';

// ** Types
// import { RootState, AppDispatch } from 'src/store'
import { CalendarColors } from '@/types/apps/calendarTypes';

// ** FullCalendar & App Components Imports

// ** Actions
// import {
//   addEvent,
//   fetchEvents,
//   deleteEvent,
//   updateEvent,
//   handleSelectEvent,
//   handleAllCalendars,
//   handleCalendarsUpdate
// } from '@/store/apps/calendar'

import SidebarLeft from '@/store/apps/calendar/SidebarLeft';
import Calendar from '@/store/apps/calendar/Calendar';
import CalendarWrapper from '@/@core/styles/libs/fullcalendar';

// ** CalendarColors
const calendarsColor: CalendarColors = {
  Personal: 'error',
  Business: 'primary',
  Family: 'warning',
  Holiday: 'success',
  ETC: 'info',
};

const AppCalendar = () => {
   // ** States
   const [calendarApi, setCalendarApi] = useState<null | any>(null)
   const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
   const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)

  // ** Hooks
  const { settings } = useSettings();
 

  // ** Vars
  const leftSidebarWidth = 260;
  const addEventSidebarWidth = 400;
  const { skin, direction } = settings;
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

 

  return (
    <CalendarWrapper
      className='app-calendar'
      sx={{
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: (theme) => `1px solid ${theme.palette.divider}` }),
      }}
    >
      <SidebarLeft
        mdAbove={mdAbove}
        calendarsColor={calendarsColor}
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarWidth={leftSidebarWidth}
        // handleSelectEvent={handleSelectEvent}
        // handleAllCalendars={handleAllCalendars}
        // handleCalendarsUpdate={handleCalendarsUpdate}
        // handleLeftSidebarToggle={handleLeftSidebarToggle}
        // handleAddEventSidebarToggle={handleAddEventSidebarToggle}
      />
      <Box
        sx={{
          p: 5,
          pb: 0,
          flexGrow: 1,
          borderRadius: 1,
          boxShadow: 'none',
          backgroundColor: 'background.paper',
          ...(mdAbove ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : {}),
        }}
      >
        <Calendar />
      </Box>
      {/* <AddEventSidebar
        store={store}
        dispatch={dispatch}
        addEvent={addEvent}
        updateEvent={updateEvent}
        deleteEvent={deleteEvent}
        calendarApi={calendarApi}
        drawerWidth={addEventSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
      /> */}
    </CalendarWrapper>
  );
};

AppCalendar.acl = {
  action: 'read',
  subject: 'calendar-page',
};
export default AppCalendar;

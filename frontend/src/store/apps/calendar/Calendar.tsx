import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import thLocale from '@fullcalendar/core/locales/th';
// // ** Third Party Style Import
// import 'bootstrap-icons/font/bootstrap-icons.css';

const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    location: '',
    description: '',
  },
};

const CalendarNktc = (props: any) => {
  const handleDateClick = (arg: any) => {
    // bind with an arrow function
  };

  const handleEventClick = (eventClickInfo: any) => {
    const popover = eventClickInfo.el.querySelector('.fc-popover-body');
    if (popover) {
      popover.style.backgroundColor = 'red'; // Set the desired background color
    }
  };

  return (
    <FullCalendar
      locale={thLocale}
      plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin]}
      initialView='dayGridMonth'
      headerToolbar={{
        start: 'sidebarToggle, prev, next, title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
      }}
      views={{
        week: {
          titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
        },
      }}
      themeSystem='standard'
      dayMaxEvents={true}
      editable={true}
      dragScroll={true}
      eventResizableFromStart={true}
      navLinks={true}
      dateClick={handleDateClick}
      eventClick={handleEventClick}
      weekends={true}
      events='https://fullcalendar.io/api/demo-feeds/events.json?overload-day'
    />
  );
};

export default CalendarNktc;

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from "sonner";
import { db } from '@/service/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,DialogDescription  } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IoClose, IoCalendarOutline, IoTimeOutline, IoLocationOutline, IoInformationCircleOutline } from "react-icons/io5";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import './calendar-styles.css'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CustomDialogContent } from '@/components/ui/custom-dialog-content';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useLanguage } from "@/context/LanguageContext";




const Badge = ({ children, className, ...props }) => (
    <div 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
  
  // Set up the localizer
  const localizer = momentLocalizer(moment);
  
  function TravelCalendar() {
    const { colorMode } = useAccessibility();
    const [trips, setTrips] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedView, setSelectedView] = useState('month');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [exportVisible, setExportVisible] = useState(false);
    const [filterType, setFilterType] = useState('all'); // 'all', 'trip', 'activity'
     const { translate, language } = useLanguage();
    const isRTL = language === "he";

    
    const [exportCalendars, setExportCalendars] = useState([
      { id: 'google', name: 'Google Calendar', selected: false },
      { id: 'apple', name: 'Apple Calendar', selected: false },
      { id: 'outlook', name: 'Outlook', selected: false }
    ]);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.email) return;
        
        const q = query(
          collection(db, 'AITrips'),
          where('userEmail', '==', user.email)
        );
        
        const querySnapshot = await getDocs(q);
        const tripsData = [];
        
        querySnapshot.forEach((doc) => {
          tripsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setTrips(tripsData);
        generateCalendarEvents(tripsData);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTrips();
  }, []);

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true;
    return event.resource?.type === filterType;
  });

  const [calendarView, setCalendarView] = useState({
    compactAgenda: false,
    showWeekends: true,
    colorCoding: 'type', // 'type', 'destination', or 'custom'
  });

  const getAccessibleColor = (colorType) => {
    // Map standard color names to your colorMode-specific colors
    const colorMap = {
      default: {
        primary: '#3b82f6', // blue-500
        secondary: '#8b5cf6', // purple-500
        success: '#10b981', // green-500
        danger: '#ef4444', // red-500
        warning: '#f59e0b', // amber-500
        info: '#3b82f6', // blue-500
      },
      protanopia: {
        primary: '#2563eb', // More bluish
        secondary: '#7c3aed', // More visible purple
        success: '#059669', // Adjusted green
        danger: '#9ca3af', // Gray instead of red
        warning: '#d97706', // Darker amber
        info: '#0284c7', // Darker blue
      },
      deuteranopia: {
        primary: '#1d4ed8', // Deeper blue
        secondary: '#6d28d9', // Deeper purple
        success: '#0f766e', // Teal instead of green
        danger: '#b91c1c', // More visible red
        warning: '#b45309', // Darker amber
        info: '#1e40af', // Deeper blue
      },
      tritanopia: {
        primary: '#4f46e5', // Indigo
        secondary: '#7e22ce', // Darker purple
        success: '#15803d', // Darker green
        danger: '#dc2626', // Bright red
        warning: '#ca8a04', // Darker yellow
        info: '#4338ca', // Indigo
      },
      monochromacy: {
        primary: '#4b5563', // Gray-600
        secondary: '#6b7280', // Gray-500
        success: '#374151', // Gray-700
        danger: '#1f2937', // Gray-800
        warning: '#6b7280', // Gray-500
        info: '#4b5563', // Gray-600
      },
      highContrast: {
        primary: '#1d4ed8', // Deep blue
        secondary: '#6d28d9', // Deep purple
        success: '#047857', // Deep green
        danger: '#b91c1c', // Deep red
        warning: '#b45309', // Deep amber
        info: '#1e40af', // Deep blue
      }
    };
  
    // Use CSS variables if they exist, otherwise fall back to the hardcoded colors
    return colorMap[colorMode]?.[colorType] || colorMap.default[colorType];
  };

  const TodayIndicator = () => {
    return (
      <div className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full"
           style={{ backgroundColor: getAccessibleColor('primary') }}>
        {translate("today")}
      </div>
    );
  };


  const handleAddToPersonalCalendar = (event) => {
    // Create calendar event data
    const eventData = {
      title: event.title,
      location: event.resource?.location || '',
      description: event.resource?.description || '',
      startTime: event.start.toISOString(),
      endTime: event.end.toISOString()
    };
    
    // Create ics file content
    const icsContent = createICSFile(eventData);
    
    // Create and trigger download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Added to Calendar",
      description: "Event has been downloaded as an .ics file",
      status: "success",
      duration: 3000
    });
  };
  
  const createICSFile = (event) => {
    const formatDate = (date) => {
      return date.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    
    return `BEGIN:VCALENDAR
  VERSION:2.0
  CALSCALE:GREGORIAN
  BEGIN:VEVENT
  SUMMARY:${event.title}
  DTSTART:${formatDate(event.startTime)}
  DTEND:${formatDate(event.endTime)}
  LOCATION:${event.location}
  DESCRIPTION:${event.description}
  STATUS:CONFIRMED
  END:VEVENT
  END:VCALENDAR`;
  };
  
  const handleExportSelected = () => {
    const selectedCalendars = exportCalendars.filter(cal => cal.selected);
    
    if (selectedCalendars.length === 0) {
      return;
    }
    
    // If Google Calendar is selected, open OAuth flow
    if (selectedCalendars.some(cal => cal.id === 'google')) {
      // In a real implementation, you would initiate Google OAuth flow
      window.open('https://calendar.google.com/calendar/u/0/r', '_blank');
    }
    
    // For other calendars, generate and download .ics file
    if (selectedCalendars.some(cal => ['apple', 'outlook'].includes(cal.id))) {
      const allEvents = events.map(event => ({
        title: event.title,
        location: event.resource?.location || '',
        description: event.resource?.type === 'trip' ? 
          `Trip to ${event.resource?.destination || ''}` : 
          event.resource?.description || '',
        startTime: event.start.toISOString(),
        endTime: event.end.toISOString()
      }));
      
      const icsContent = allEvents.map(event => createICSFile(event)).join('\n');
      
      // Create and trigger download
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'travel_calendar.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    setExportVisible(false);
    
    // Show success message
    toast({
      title: "Calendar Exported",
      description: "Your travel schedule has been exported",
      status: "success",
      duration: 3000
    });
  };



  
  const generateCalendarEvents = (tripsData) => {
    const allEvents = [];
    
    tripsData.forEach(trip => {
      const tripStart = trip.userSelection?.startDate ? new Date(trip.userSelection.startDate) : null;
      const tripEnd = trip.userSelection?.endDate ? new Date(trip.userSelection.endDate) : null;
      
      if (tripStart && tripEnd) {
        // Add the overall trip as a multi-day event
        const endDateAdjusted = new Date(tripEnd);
        endDateAdjusted.setDate(endDateAdjusted.getDate() + 1); // Adjust end date for proper display
        
        allEvents.push({
          id: `trip-${trip.id}`,
          title: `Trip to ${trip.tripData?.trip?.destination || 'Destination'}`,
          start: tripStart,
          end: endDateAdjusted,
          allDay: true,
          resource: {
            type: 'trip',
            tripId: trip.id,
            color: '#3B82F6' // Blue
          }
        });
        
        // Add individual activities
        const itinerary = trip.tripData?.itinerary || {};
        let currentDate = new Date(tripStart);
        
        Object.keys(itinerary).forEach(dayKey => {
          const dayActivities = itinerary[dayKey];
          if (Array.isArray(dayActivities)) {
            dayActivities.forEach(activity => {
              // Parse time from bestTime field
              let activityTime = null;
              if (activity.bestTime) {
                // Handle formats like "9:00 AM - 12:00 PM"
                const timeMatch = activity.bestTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (timeMatch) {
                  const [_, hours, minutes, period] = timeMatch;
                  
                  // Convert to 24-hour format
                  let hour = parseInt(hours);
                  if (period.toUpperCase() === 'PM' && hour < 12) {
                    hour += 12;
                  } else if (period.toUpperCase() === 'AM' && hour === 12) {
                    hour = 0;
                  }
                  
                  // Create date object for this activity
                  activityTime = new Date(currentDate);
                  activityTime.setHours(hour, parseInt(minutes), 0);
                }
              }
              
              // If we couldn't parse a time, use arbitrary times for morning/afternoon/evening
              if (!activityTime) {
                activityTime = new Date(currentDate);
                if (activity.bestTime?.toLowerCase().includes('morning')) {
                  activityTime.setHours(9, 0, 0);
                } else if (activity.bestTime?.toLowerCase().includes('afternoon')) {
                  activityTime.setHours(14, 0, 0);
                } else {
                  activityTime.setHours(19, 0, 0);
                }
              }
              
              // Calculate end time based on duration or default to 2 hours
              const durationHours = activity.duration ? 
                parseFloat(activity.duration.match(/\d+\.?\d*/)?.[0] || 2) : 2;
              
              const activityEnd = new Date(activityTime);
              activityEnd.setHours(activityTime.getHours() + durationHours);
              
              allEvents.push({
                id: `activity-${trip.id}-${dayKey}-${activity.activity}`,
                title: activity.activity,
                start: activityTime,
                end: activityEnd,
                resource: {
                  type: 'activity',
                  tripId: trip.id,
                  destination: trip.tripData?.trip?.destination,
                  description: activity.description,
                  location: trip.tripData?.trip?.destination,
                  price: activity.price,
                  duration: activity.duration,
                  color: '#DC2626' // Red
                }
              });
            });
          }
          
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        });
      }
    });
    
    setEvents(allEvents);
  };
  
  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    
  
  };
  
  const handleExportCalendar = () => {
    setExportVisible(true);
  };
  
  // Custom event component to show colored events
  const EventComponent = ({ event }) => {
    const isActivity = event.resource?.type === 'activity';
    let backgroundColor;
    
    // Apply different color coding based on preferences
    if (calendarView.colorCoding === 'type') {
      backgroundColor = isActivity ? 
        getAccessibleColor('danger') : 
        getAccessibleColor('primary');
    } else if (calendarView.colorCoding === 'destination') {
      // Generate color based on destination
      const destination = event.resource?.destination || '';
      const hash = destination.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      const h = Math.abs(hash) % 360;
      backgroundColor = `hsl(${h}, 70%, 50%)`;
    } else if (calendarView.colorCoding === 'custom') {
      // For custom, you could allow users to set colors per trip
      backgroundColor = isActivity ? 
        getAccessibleColor('secondary') : 
        getAccessibleColor('success');
    }
    
    const isTruncated = event.title.length > 30;
    
    return (
      <div 
        className="travel-calendar-event"
        style={{ backgroundColor }}
      >
        <div className="travel-calendar-event-content">
          {isActivity && (
            <div className="travel-calendar-event-time">
              {moment(event.start).format('HH:mm')}
            </div>
          )}
          <div className="travel-calendar-event-title">
            {isTruncated ? `${event.title.substring(0, 28)}...` : event.title}
          </div>
          {isActivity && event.resource?.location && (
            <div className="travel-calendar-event-location">
              <IoLocationOutline className="inline-block mr-1" size={10} />
              {event.resource.location}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleNavigate = (date) => {
    setCalendarDate(date);
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };
  const DayHeaderComponent = ({ date, label }) => {
    const isToday = moment(date).isSame(new Date(), 'day');
    
    return (
      <div className={`travel-calendar-day-header ${isToday ? 'travel-calendar-today' : ''}`}>
        <div className="travel-calendar-day-name">{moment(date).format('ddd')}</div>
        <div className="travel-calendar-day-number">{moment(date).format('D')}</div>
      </div>
    );
  };
  
  // Custom toolbar component
  const CustomToolbar = (toolbar) => {
    const navigate = (action) => {
      toolbar.onNavigate(action);
    };
    
    return (
      <div className="travel-calendar-toolbar">
        <div className="travel-calendar-toolbar-nav">
          <Button 
            variant="outline" 
            className="calendar-nav-button"
            onClick={() => navigate('TODAY')}
          >
            {translate("today")}
          </Button>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              className="calendar-nav-button"
              onClick={() => navigate('PREV')}
            >
              <span>❮</span>
            </Button>
            <Button 
              variant="outline" 
              className="calendar-nav-button"
              onClick={() => navigate('NEXT')}
            >
              <span>❯</span>
            </Button>
          </div>
          
          {/* Mini calendar dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-2 calendar-nav-button">
                <IoCalendarOutline className="mr-2" />
                {translate("jumpToDate")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
              <DatePicker
                selected={calendarDate}
                onChange={date => {
                  setCalendarDate(date);
                  toolbar.onNavigate('DATE', date);
                }}
                inline
                calendarClassName="bg-gray-800 text-white" 
                dayClassName={date => 
                  moment(date).isSame(new Date(), 'day') 
                    ? "bg-blue-600 text-white rounded-full" 
                    : undefined
                }
                popperClassName="date-picker-popper"
                wrapperClassName="date-picker-wrapper"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="travel-calendar-toolbar-label">
          <h2>{toolbar.label}</h2>
        </div>
        
        <div className="travel-calendar-toolbar-views">
          <div className="bg-gray-800 rounded-lg p-1 flex">
            {['month', 'week', 'day', 'agenda'].map(viewName => (
              <button 
                key={viewName}
                className={`px-4 py-2 rounded-xl transition`}
                style={{
                  backgroundColor: toolbar.view === viewName ? getAccessibleColor('primary') : 'transparent',
                  color: toolbar.view === viewName ? 'white' : '#d1d5db',
                }}
                onClick={() => toolbar.onView(viewName)}
              >
                {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-[100px] pb-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
  <div>
    <h1 className="text-3xl font-bold text-white">{translate("travelCalendar")}</h1>
    <p className="text-gray-400 mt-1">{translate("calendarDescription")}</p>
  </div>
  <div className="flex items-center gap-2 ml-4">
    <span className="text-gray-400 text-sm">{translate("filter")}</span>
    <select 
      value={filterType} 
      onChange={e => setFilterType(e.target.value)}
      className="bg-gray-800 border-gray-700 text-white rounded-xl px-3 py-1.5 text-sm"
    >
      <option value="all">{translate("filterAll")}</option>
      <option value="trip">{translate("filterTrips")}</option>
      <option value="activity">{translate("filterActivities")}</option>
    </select>
  </div>
  
  <div className="flex gap-4">
    <Button 
      variant="outline" 
      className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
      onClick={handleExportCalendar}
    >
      {translate("exportGoogleCalendar")}
    </Button>
  </div>
</div>
        
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="travel-calendar-container">
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleEventClick}
              views={['month', 'week', 'day', 'agenda']}
              view={selectedView}
              onView={handleViewChange}
              date={calendarDate}
              onNavigate={handleNavigate}
              components={{
                event: EventComponent,
                toolbar: CustomToolbar,
                day: {
                  header: DayHeaderComponent
                },
                dateCellWrapper: (props) => {
                    const { children, value } = props;
                    const isToday = moment(value).isSame(new Date(), 'day');
                    return (
                      <div style={{ position: 'relative' }}>
                        {children}
                        {isToday && <TodayIndicator />}
                      </div>
                    );
                  }
                }}
            
              eventPropGetter={(event) => {
                return {
                  style: {
                    backgroundColor: 'transparent', // Make the default background transparent
                    borderRadius: '0',
                    border: 'none',
                    color: 'white'
                  }
                };
              }}
              dayPropGetter={(date) => {
                // Highlight today and weekend days
                const isToday = moment(date).isSame(new Date(), 'day');
                const isWeekend = moment(date).day() === 0 || moment(date).day() === 6;
                const isPast = moment(date).isBefore(new Date(), 'day');
                
                let style = {};
                
                if (isToday) {
                  const primaryColor = getAccessibleColor('primary');
                  // Convert hex to rgba for background
                  const rgbMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(primaryColor);
                  const rgb = rgbMatch 
                    ? `${parseInt(rgbMatch[1], 16)}, ${parseInt(rgbMatch[2], 16)}, ${parseInt(rgbMatch[3], 16)}` 
                    : '59, 130, 246'; // Default blue if conversion fails
                  
                  style.backgroundColor = `rgba(${rgb}, 0.15)`;
                  style.borderLeft = `3px solid ${primaryColor}`;
                } else if (isWeekend) {
                  style.backgroundColor = 'rgba(17, 24, 39, 0.7)';
                } else if (isPast) {
                  style.backgroundColor = 'rgba(31, 41, 55, 0.7)';
                }
                
                return { style };
              }}
              formats={{
                dateFormat: 'D',
                dayFormat: 'ddd D/M',
                dayHeaderFormat: 'dddd, MMMM D',
                dayRangeHeaderFormat: ({ start, end }) => {
                  return `${moment(start).format('MMMM D')} - ${moment(end).format('MMMM D, YYYY')}`;
                },
                monthHeaderFormat: 'MMMM YYYY',
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }) => {
                  return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
                },
              }}
            />
          </div>
        </div>
        
        {/* Trip Legend */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6 shadow-xl">
  <h2 className="text-xl font-semibold text-white mb-4">{translate("calendarLegend")}</h2>
  
  <div className="flex flex-wrap gap-6 mb-6">
    <div className="flex items-center gap-2">
      <div 
        className="w-4 h-4 rounded-sm" 
        style={{ backgroundColor: getAccessibleColor('primary') }}
      ></div>
      <span className="text-gray-300">{translate("tripDuration")}</span>
    </div>
    <div className="flex items-center gap-2">
      <div 
        className="w-4 h-4 rounded-sm" 
        style={{ backgroundColor: getAccessibleColor('danger') }}
      ></div>
      <span className="text-gray-300">{translate("plannedActivities")}</span>
    </div>
  </div>
</div>

        {/* Trip Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
  <StatsCard 
    title={translate("upcomingTrips")} 
    value={events.filter(e => e.resource?.type === 'trip' && e.start > new Date()).length} 
    icon={<IoCalendarOutline className="w-6 h-6" />}
    type="upcoming-trips"
  />
  <StatsCard 
    title={translate("plannedActivities")} 
    value={events.filter(e => e.resource?.type === 'activity').length} 
    icon={<IoTimeOutline className="w-6 h-6" />}
    type="planned-activities"
  />
  <StatsCard 
    title={translate("destinations")} 
    value={new Set(trips.map(t => t.tripData?.trip?.destination).filter(Boolean)).size} 
    icon={<IoLocationOutline className="w-6 h-6" />}
    type="destinations"
  />
</div>

      </div>

            {/* Event Details Dialog */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
  <CustomDialogContent className="bg-gray-800 border-gray-700 text-white">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold">
        {selectedEvent?.title}
      </DialogTitle>
      <DialogDescription className="sr-only">
        Event details and information
      </DialogDescription>
      <DialogClose className="absolute right-4 top-4 text-black bg-white hover:scale-105">
        <IoClose className="h-4 w-4" />
      </DialogClose>
    </DialogHeader>
    
    <div className="mt-2">
      {selectedEvent?.resource?.type === 'trip' ? (
        <div className="event-dialog-section">
          <div className="event-dialog-header">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <IoCalendarOutline className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">{translate("tripDuration")}</p>
              <p className="text-white font-medium">
                {moment(selectedEvent.start).format('MMM D, YYYY')} - {moment(selectedEvent.end).subtract(1, 'day').format('MMM D, YYYY')}
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="font-medium text-white mb-2">{translate("activitiesOnTrip")}</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {events
                .filter(e => e.resource?.type === 'activity' && e.resource?.tripId === selectedEvent.resource.tripId)
                .sort((a, b) => a.start - b.start)
                .map((activity, index) => (
                  <div key={index} className="p-3 bg-gray-800 rounded-lg flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: getAccessibleColor('danger') }}
                    >
                      {moment(activity.start).format('HH:mm')}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{activity.title}</p>
                      <p className="text-sm text-gray-400">
                        {moment(activity.start).format('ddd, MMM D')} • {moment(activity.start).format('HH:mm')} - {moment(activity.end).format('HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              className="w-full"
              style={{ 
                backgroundColor: getAccessibleColor('primary'),
                color: 'white'
              }}
              onClick={() => window.location.href = `/view-trip/${selectedEvent?.resource?.tripId}`}
            >
              {translate("viewFullItinerary")}
            </Button>
          </div>
        </div>
      ) : (
        /* Activity Details */
        <div className="space-y-4">
          <div className="mb-4 p-4 bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Badge 
                style={{ 
                  backgroundColor: getAccessibleColor('danger'),
                }}
              >
                {translate("activity")}
              </Badge>
              <span className="text-sm text-gray-400">
                {moment(selectedEvent?.start).format('dddd, MMMM D, YYYY')}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <IoTimeOutline className="text-gray-400" />
              <span className="text-white">
                {moment(selectedEvent?.start).format('HH:mm')} - {moment(selectedEvent?.end).format('HH:mm')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IoLocationOutline className="text-gray-400" />
              <span className="text-white">{selectedEvent?.resource?.location || 'Location not specified'}</span>
            </div>
          </div>
          
          {selectedEvent?.resource?.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">{translate("description")}</h3>
              <p className="text-white">{selectedEvent.resource.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            {selectedEvent?.resource?.duration && (
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-400">{translate("duration")}</p>
                <p className="text-white font-medium">{selectedEvent.resource.duration}</p>
              </div>
            )}
            
            {selectedEvent?.resource?.price && (
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-400">{translate("price")}</p>
                <p className="text-white font-medium">{selectedEvent.resource.price}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              style={{ 
                borderColor: getAccessibleColor('primary') + '80',
                color: getAccessibleColor('primary'),
              }}
              onClick={() => handleAddToPersonalCalendar(selectedEvent)}
            >
              {translate("addToPersonalCalendar")}
            </Button>
            <Button 
              className="flex-1"
              style={{ 
                backgroundColor: getAccessibleColor('primary'),
                color: 'white'
              }}
              onClick={() => window.location.href = `/view-trip/${selectedEvent?.resource?.tripId}`}
            >
              {translate("viewTripDetails")}
            </Button>
          </div>
        </div>
      )}
    </div>
  </CustomDialogContent>
</Dialog>
      
      {/* Export Calendar Dialog */}
      <Dialog open={exportVisible} onOpenChange={setExportVisible}>
  <CustomDialogContent className="bg-gray-800 border-gray-700 text-white">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold">
        {translate("calendarExport")}
      </DialogTitle>
      <DialogDescription className="sr-only">
      </DialogDescription>
      <DialogClose className="absolute right-4 top-4 text-black bg-white hover:scale-105">
        <IoClose className="h-4 w-4" />
      </DialogClose>
    </DialogHeader>
    
    <div className="py-4">
      <div className="mb-6">
        <p className="text-gray-300 mb-2">{translate("exportDescription")}</p>
        
        <div className="space-y-3 mt-4">
          {exportCalendars.map((calendar) => (
            <div 
              key={calendar.id}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                calendar.selected ? 'bg-blue-900/30 border border-blue-700' : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
              onClick={() => {
                setExportCalendars(exportCalendars.map(cal => 
                  cal.id === calendar.id ? {...cal, selected: !cal.selected} : cal
                ));
              }}
            >
              <div className={`w-5 h-5 rounded-md mr-3 flex items-center justify-center ${
                calendar.selected ? 'bg-blue-600' : 'border border-gray-500'
              }`}>
                {calendar.selected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{calendar.name}</div>
                <div className="text-sm text-gray-400">
                  {calendar.id === 'google' ? 'Sync with your Google account' : 'Export as .ics file'}
                </div>
              </div>
              {calendar.selected && (
                <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 flex items-start gap-3">
        <IoInformationCircleOutline 
          className="w-5 h-5 flex-shrink-0 mt-0.5" 
          style={{ color: getAccessibleColor('primary') }}
        />
        <p className="text-blue-300 text-sm">
          {translate("calendarExportInfo")}
        </p>
      </div>
      
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => setExportVisible(false)}>
          {translate("cancel")}
        </Button>
        <Button 
          className=""
          style={{ 
            backgroundColor: getAccessibleColor('primary'),
            color: 'white',
            opacity: exportCalendars.some(cal => cal.selected) ? 1 : 0.5
          }}
          onClick={handleExportSelected}
          disabled={!exportCalendars.some(cal => cal.selected)}
        >
          {translate("exportSelected")}
        </Button>
      </div>
    </div>
  </CustomDialogContent>
</Dialog>
    </div>
  );

  function StatsCard({ title, value, icon, type }) {
  
    // Get base colors based on type and color mode
    const getCardColor = (type) => {
      const baseColors = {
        'upcoming-trips': 'primary',
        'planned-activities': 'danger',
        'destinations': 'success'
      };
      
      const colorType = baseColors[type] || 'primary';
      return getAccessibleColor(colorType);
    };
    
    // Create gradient based on the accessible color
    const createGradient = (color) => {
      // Create a slightly darker version for the gradient
      const darkerColor = color.replace(/^#/, '');
      const r = parseInt(darkerColor.substr(0, 2), 16);
      const g = parseInt(darkerColor.substr(2, 2), 16);
      const b = parseInt(darkerColor.substr(4, 2), 16);
      const darkR = Math.max(0, r - 20).toString(16).padStart(2, '0');
      const darkG = Math.max(0, g - 20).toString(16).padStart(2, '0');
      const darkB = Math.max(0, b - 20).toString(16).padStart(2, '0');
      const darkerHex = `#${darkR}${darkG}${darkB}`;
      
      return `linear-gradient(to bottom right, ${color}, ${darkerHex})`;
    };
    
    const baseColor = getCardColor(type);
    const gradientBackground = createGradient(baseColor);
    
    return (
      <motion.div 
        style={{ 
          background: gradientBackground,
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-opacity-80">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-lg text-white">
            {icon}
          </div>
        </div>
      </motion.div>
    );
  }


}

// Helper Component for Stats

  
  export default TravelCalendar;
"use client";

import React, { useState, useMemo } from 'react';
import { 
  format, addMonths, subMonths, addWeeks, subWeeks, 
  startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, 
  isSameMonth, isSameDay, parseISO, getHours, getMinutes, addDays, getDay, isToday
} from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, User, Info, X } from 'lucide-react';

// Tailwind color cycle for different rooms
const ROOM_COLORS = [
  'bg-blue-500 border-blue-600',
  'bg-green-500 border-green-600',
  'bg-purple-500 border-purple-600',
  'bg-pink-500 border-pink-600',
  'bg-orange-500 border-orange-600',
  'bg-teal-500 border-teal-600',
  'bg-indigo-500 border-indigo-600',
];

interface Room {
  roomId: string;
  roomName: string;
}

interface Reservation {
  id: string;
  roomId: string;
  email: string;
  name: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  isSpecialRequest?: string;
  specialReason?: string;
}

interface RoomCalendarProps {
  rooms: Room[];
  reservations: Reservation[];
}

export default function RoomCalendar({ rooms, reservations }: RoomCalendarProps) {
  const [view, setView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Reservation | null>(null);

  // Map room to a specific color
  const roomColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    rooms.forEach((room, index) => {
      map[room.roomId] = ROOM_COLORS[index % ROOM_COLORS.length];
    });
    return map;
  }, [rooms]);

  // The API already filters out other users' pending reservations,
  // so we can just show all reservations passed to this component.
  const validReservations = reservations;

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // --- MONTH VIEW LOGIC ---
  const renderMonthView = () => {
    const startMonth = startOfMonth(currentDate);
    const endMonth = endOfMonth(currentDate);
    const startDate = startOfWeek(startMonth, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(endMonth, { weekStartsOn: 0 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Group items by week to render rows
    for (let i = 0; i < allDays.length; i++) {
      const currentDay = allDays[i];
      const dayReservations = validReservations.filter(res => isSameDay(parseISO(res.startDate), currentDay));

      days.push(
        <div
          className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b border-gray-100 ${
            !isSameMonth(currentDay, startMonth) ? 'bg-gray-50 text-gray-400' : 'bg-white'
          } ${isToday(currentDay) ? 'bg-orange-50' : ''}`}
          key={currentDay.toString()}
        >
          <div className={`text-right text-xs sm:text-sm font-medium mb-1 ${isToday(currentDay) ? 'text-orange-600 font-bold' : ''}`}>
            {format(currentDay, dateFormat)}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[60px] sm:max-h-[80px] custom-scrollbar">
            {dayReservations.map(res => {
              const room = rooms.find(r => r.roomId === res.roomId);
              const colorClass = roomColorMap[res.roomId] || 'bg-gray-500 border-gray-600';
              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedEvent(res)}
                  className={`text-[9px] sm:text-xs p-1 rounded cursor-pointer text-white shadow-sm hover:opacity-90 transition border-l-2 ${colorClass} flex flex-col leading-tight`}
                  title={`${room?.roomName || 'Room'} - ${res.title}`}
                >
                  <div className="font-bold truncate">
                    {format(parseISO(res.startDate), 'HH:mm')} {room?.roomName}
                  </div>
                  <div className="truncate opacity-90 hidden sm:block">{res.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7" key={currentDay.toString()}>
            {days}
          </div>
        );
        days = [];
      }
    }

    return (
      <div className="shadow-sm border border-gray-200 rounded-xl bg-white w-full">
        <div className="w-full">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day, i) => (
              <div key={i} className="py-2 sm:py-3 text-center text-[10px] sm:text-sm font-bold text-gray-500 border-r border-gray-100 truncate">
                {day}
              </div>
            ))}
          </div>
          {rows}
        </div>
      </div>
    );
  };

  // --- WEEK VIEW LOGIC ---
  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Assuming normal operating hours 08:00 to 22:00
    const startHour = 8;
    const endHour = 22;
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

    return (
      <div className="flex flex-col overflow-x-auto shadow-sm border border-gray-200 rounded-xl bg-white">
        {/* Header Days */}
        <div className="flex border-b border-gray-200 bg-gray-50 min-w-[800px]">
          <div className="w-16 shrink-0 border-r border-gray-200"></div>
          {days.map(day => (
            <div key={day.toString()} className={`flex-1 text-center py-3 border-r border-gray-100 ${isToday(day) ? 'bg-orange-50' : ''}`}>
              <div className="text-xs text-gray-500 font-bold uppercase">{format(day, 'EEE', { locale: th })}</div>
              <div className={`text-xl font-black ${isToday(day) ? 'text-orange-600' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="flex relative min-w-[800px] h-[800px] overflow-y-auto bg-gray-50/30">
          {/* Time Labels */}
          <div className="w-16 shrink-0 border-r border-gray-200 bg-white relative z-10">
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b border-gray-100 flex items-start justify-center text-xs font-bold text-gray-400 py-1">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Grid lines & Events */}
          <div className="flex-1 flex relative">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              {hours.map(hour => (
                <div key={`grid-${hour}`} className="h-16 border-b border-gray-100/50 w-full"></div>
              ))}
            </div>

            {/* Columns per day */}
            {days.map(day => {
              const dayReservations = validReservations.filter(res => isSameDay(parseISO(res.startDate), day));
              
              return (
                <div key={day.toString()} className="flex-1 relative border-r border-gray-100/50 min-h-full">
                  {dayReservations.map(res => {
                    const start = parseISO(res.startDate);
                    const end = parseISO(res.endDate);
                    
                    // Calculate position and height
                    const startH = getHours(start);
                    const startM = getMinutes(start);
                    const endH = getHours(end);
                    const endM = getMinutes(end);
                    
                    // Filter out events outside normal hours slightly
                    if (startH < startHour) return null;

                    const topOffset = ((startH - startHour) * 64) + ((startM / 60) * 64);
                    const durationMins = ((endH * 60) + endM) - ((startH * 60) + startM);
                    const height = (durationMins / 60) * 64;

                    const room = rooms.find(r => r.roomId === res.roomId);
                    const colorClass = roomColorMap[res.roomId] || 'bg-gray-500 border-gray-600';

                    return (
                      <div
                        key={res.id}
                        onClick={() => setSelectedEvent(res)}
                        className={`absolute left-1 right-1 rounded-md p-2 text-white text-xs shadow-md cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 border-l-4 overflow-hidden ${colorClass}`}
                        style={{ top: `${topOffset}px`, height: `${height}px` }}
                      >
                        <div className="font-bold text-[10px] sm:text-xs leading-tight mb-0.5 opacity-90">
                          {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                        </div>
                        <div className="font-black truncate">{room?.roomName || 'Unknown Room'}</div>
                        <div className="truncate opacity-80 mt-1">{res.title}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Calendar Header Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-full sm:w-max">
          <button 
            onClick={() => setView('month')} 
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-colors ${view === 'month' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            รายเดือน
          </button>
          <button 
            onClick={() => setView('week')} 
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-colors ${view === 'week' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            รายสัปดาห์
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button onClick={handleToday} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition">
            วันนี้
          </button>
          <div className="flex items-center gap-1 sm:gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex-1 sm:flex-none justify-between">
            <button onClick={handlePrev} className="p-2 sm:p-1 hover:bg-gray-100 rounded-lg transition"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <h2 className="text-base sm:text-lg font-black text-gray-900 text-center min-w-[120px] sm:min-w-[140px]">
              {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMM yyyy', { locale: th })}
            </h2>
            <button onClick={handleNext} className="p-2 sm:p-1 hover:bg-gray-100 rounded-lg transition"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="text-sm font-bold text-gray-500 w-full sm:w-auto mr-4 flex items-center"><MapPin className="w-4 h-4 mr-1"/> ห้อง:</div>
        {rooms.map(room => (
          <div key={room.roomId} className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <div className={`w-3 h-3 rounded-full ${roomColorMap[room.roomId]?.split(' ')[0]}`}></div>
            {room.roomName}
          </div>
        ))}
      </div>

      {/* Calendar Render */}
      {view === 'month' ? renderMonthView() : renderWeekView()}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className={`p-6 text-white ${roomColorMap[selectedEvent.roomId]?.split(' ')[0] || 'bg-gray-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black">{selectedEvent.title}</h3>
                <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-black/20 rounded-full transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-white/90 font-medium">
                <MapPin className="w-4 h-4" />
                {rooms.find(r => r.roomId === selectedEvent.roomId)?.roomName || 'Unknown Room'}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500 font-bold mb-0.5">วันเวลาที่ใช้งาน</div>
                  <div className="text-sm font-bold">
                    {format(parseISO(selectedEvent.startDate), 'dd MMM yyyy', { locale: th })} <br/>
                    {format(parseISO(selectedEvent.startDate), 'HH:mm')} - {format(parseISO(selectedEvent.endDate), 'HH:mm')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <User className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500 font-bold mb-0.5">ผู้จอง</div>
                  <div className="text-sm font-bold">{selectedEvent.name}</div>
                  <div className="text-xs text-gray-500">{selectedEvent.email}</div>
                </div>
              </div>

              {selectedEvent.isSpecialRequest === 'TRUE' && (
                <div className="flex items-start gap-3 text-red-700 bg-red-50 p-3 rounded-xl border border-red-100">
                  <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold mb-0.5">เหตุผลขออนุมัติพิเศษ</div>
                    <div className="text-sm font-medium leading-relaxed">{selectedEvent.specialReason || '-'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

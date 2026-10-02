import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Sun, Moon, Plus, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarTabProps {
  calendars: any[];
  shiftTemplates: any[];
  holidays: any[];
}

export const ResourceCalendarTab: React.FC<CalendarTabProps> = ({
  calendars,
  shiftTemplates,
  holidays,
}) => {
  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [calendarType, setCalendarType] = useState<'SHIFT' | 'HOLIDAY' | 'MAINTENANCE'>('SHIFT');

  return (
    <div className="space-y-6">
      {/* Calendar Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setCalendarType('SHIFT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                calendarType === 'SHIFT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Shift Calendar
            </button>
            <button
              onClick={() => setCalendarType('HOLIDAY')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                calendarType === 'HOLIDAY' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Holiday Calendar
            </button>
            <button
              onClick={() => setCalendarType('MAINTENANCE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                calendarType === 'MAINTENANCE' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Maintenance
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('DAILY')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'DAILY' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('WEEKLY')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'WEEKLY' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('MONTHLY')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'MONTHLY' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {calendarType === 'SHIFT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shift Templates Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Standard Shift Templates
            </h3>
            <div className="space-y-3">
              {shiftTemplates.map((shift) => (
                <div key={shift.id} className="p-3 bg-slate-800/60 border border-slate-800 rounded-lg text-xs">
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span>{shift.name}</span>
                    <span className="text-[10px] font-mono text-indigo-400">{shift.code}</span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between mt-2">
                    <span>Hours: {shift.startTime} - {shift.endTime}</span>
                    <span className="font-semibold text-slate-200">{shift.totalHours} hrs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid Representation */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-semibold text-white">August 2026 - Site Shift Roster</h3>
              <div className="flex items-center gap-1">
                <button className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs font-semibold text-slate-200">August 2026</span>
                <button className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="font-semibold text-slate-400 py-1">{day}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((dateNum) => {
                const isOff = dateNum % 7 === 0;
                return (
                  <div
                    key={dateNum}
                    className={`p-2.5 rounded-lg border text-left min-h-[64px] flex flex-col justify-between transition-colors ${
                      isOff
                        ? 'bg-slate-900/40 border-slate-800/50 text-slate-400'
                        : 'bg-slate-800/40 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-[11px]">{dateNum}</span>
                    <div className="mt-1">
                      {isOff ? (
                        <span className="text-[9px] uppercase font-semibold text-slate-400 block">Weekly Off</span>
                      ) : (
                        <span className="text-[9px] uppercase font-semibold text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded block">Day Shift</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {calendarType === 'HOLIDAY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-4">Official Project Site Holidays</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {holidays.map((hol) => (
              <div key={hol.id} className="p-4 bg-slate-800/60 border border-slate-800 rounded-xl text-xs">
                <span className="px-2 py-0.5 text-[10px] uppercase font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {hol.holidayType}
                </span>
                <h4 className="text-sm font-bold text-white mt-2">{hol.holidayName}</h4>
                <p className="text-slate-400 font-mono mt-1">{hol.holidayDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {calendarType === 'MAINTENANCE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs">
          Equipment & Machinery Maintenance Calendar. Scheduled downtime and service windows are automatically blocked out from allocation availability.
        </div>
      )}
    </div>
  );
};

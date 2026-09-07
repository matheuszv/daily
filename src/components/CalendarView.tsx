import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Star, Sparkles, CalendarDays } from 'lucide-react';
import { Goal, DayCompletion } from '../types';

interface CalendarViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  goals: Goal[];
  completions: DayCompletion[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onSelectDate,
  goals,
  completions,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  // Parse selected date
  const selectedDateObj = new Date(selectedDate + 'T12:00:00');
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(selectedDate + 'T12:00:00'));

  // Helpers
  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateStr(new Date());

  // Week days calculation (Monday to Sunday)
  const getWeekDates = (baseDate: Date) => {
    const dayOfWeek = baseDate.getDay(); // 0 is Sunday, 1 is Monday...
    // Adjust to Monday-based week (0 = Monday, 6 = Sunday)
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - distanceToMonday);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      weekDays.push(nextDay);
    }
    return weekDays;
  };

  // Month days calculation
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Padding for first week (Monday based)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  // Calculate stats for a given date
  const getDayStats = (dateStr: string, dateObj: Date) => {
    const dayOfWeek = dateObj.getDay(); // 0-6
    const activeGoalsForDay = goals.filter(
      (g) => g.active && (!g.daysOfWeek || g.daysOfWeek.includes(dayOfWeek as any))
    );
    const dayCompletions = completions.filter((c) => c.date === dateStr);
    const pointsEarned = dayCompletions.reduce((sum, c) => sum + (c.pointsEarned || 0), 0);
    const totalGoals = activeGoalsForDay.length;
    const completedCount = dayCompletions.length;
    const isFullDay = totalGoals > 0 && completedCount >= totalGoals;

    return {
      pointsEarned,
      totalGoals,
      completedCount,
      isFullDay,
    };
  };

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'week') {
      const newD = new Date(selectedDateObj);
      newD.setDate(newD.getDate() - 7);
      const str = formatDateStr(newD);
      onSelectDate(str);
      setCurrentMonthDate(newD);
    } else {
      const newM = new Date(currentMonthDate);
      newM.setMonth(newM.getMonth() - 1);
      setCurrentMonthDate(newM);
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      const newD = new Date(selectedDateObj);
      newD.setDate(newD.getDate() + 7);
      const str = formatDateStr(newD);
      onSelectDate(str);
      setCurrentMonthDate(newD);
    } else {
      const newM = new Date(currentMonthDate);
      newM.setMonth(newM.getMonth() + 1);
      setCurrentMonthDate(newM);
    }
  };

  const handleGoToday = () => {
    onSelectDate(todayStr);
    setCurrentMonthDate(new Date());
  };

  const weekDays = getWeekDates(selectedDateObj);
  const monthDays = getMonthDays(currentMonthDate);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDayShort = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs">
      
      {/* Calendar Header / Navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-600" />
            <span>
              {viewMode === 'week'
                ? `Semana de ${weekDays[0].getDate()} a ${weekDays[6].getDate()} de ${monthNames[weekDays[0].getMonth()]} ${weekDays[0].getFullYear()}`
                : `${monthNames[currentMonthDate.getMonth()]} de ${currentMonthDate.getFullYear()}`}
            </span>
          </h2>
          <p className="text-xs text-stone-700 mt-0.5">
            Clique em qualquer dia para ver e cumprir os objetivos daquela data
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs font-medium">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'week' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'month' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Mês
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={handleGoToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
          >
            Hoje
          </button>

          {/* Arrows */}
          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Week View Layout */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weekDays.map((d, index) => {
            const dateStr = formatDateStr(d);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const stats = getDayStats(dateStr, d);

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`relative flex flex-col items-center justify-between p-2 sm:p-3 rounded-xl border transition-all text-left group ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 bg-white'
                }`}
              >
                {/* Day of Week Title */}
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                  {weekDayShort[index]}
                </span>

                {/* Day Number */}
                <div className="my-1 sm:my-2 flex flex-col items-center">
                  <span
                    className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      isToday
                        ? 'bg-amber-600 text-white'
                        : isSelected
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-800 group-hover:text-stone-950'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>

                {/* Progress / Points Pills */}
                <div className="w-full flex flex-col items-center gap-1">
                  {stats.pointsEarned > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                      +{stats.pointsEarned} <span className="hidden sm:inline">pts</span>
                    </span>
                  ) : (
                    <span className="text-[10px] sm:text-xs text-stone-600 font-medium">
                      0 pts
                    </span>
                  )}

                  {/* Completion badge */}
                  <div className="flex items-center gap-1 text-[10px] text-stone-700">
                    {stats.isFullDay ? (
                      <span className="flex items-center text-emerald-600 font-semibold gap-0.5" title="100% cumprido!">
                        <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                        <span className="hidden sm:inline">Meta!</span>
                      </span>
                    ) : (
                      <span>
                        {stats.completedCount}/{stats.totalGoals}
                      </span>
                    )}
                  </div>
                </div>

                {/* Star banner if full goals reached */}
                {stats.isFullDay && (
                  <div className="absolute -top-1.5 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-1 rounded-full shadow-xs flex items-center">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Month View Layout */}
      {viewMode === 'month' && (
        <div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-semibold text-stone-700">
            {weekDayShort.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthDays.map((d, index) => {
              if (!d) {
                return <div key={`empty-${index}`} className="h-16 sm:h-20 bg-stone-50/50 rounded-xl" />;
              }

              const dateStr = formatDateStr(d);
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const stats = getDayStats(dateStr, d);

              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDate(dateStr)}
                  className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between text-left transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-amber-600 text-white'
                          : isSelected
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-700'
                      }`}
                    >
                      {d.getDate()}
                    </span>

                    {stats.isFullDay && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    )}
                  </div>

                  <div className="mt-1 flex flex-col gap-0.5">
                    {stats.pointsEarned > 0 && (
                      <span className="text-[10px] font-bold text-amber-700">
                        +{stats.pointsEarned} pts
                      </span>
                    )}
                    <span className="text-[9px] text-stone-700">
                      {stats.completedCount}/{stats.totalGoals} feitos
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

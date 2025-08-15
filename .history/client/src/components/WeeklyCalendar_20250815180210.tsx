import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const WeeklyCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { isDark } = useSelector((store: RootState) => store.themeStore)

  const getWeekStartDate = (date: Date): Date => {
    const startDate = new Date(date);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    return startDate;
  };

  const generateWeekDays = (startDate: Date): Date[] => {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const weekStartDate = getWeekStartDate(selectedDate);
  const weekDays = generateWeekDays(weekStartDate);

  const headerDateString = selectedDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const dayNames: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={`${isDark ? "text-gray-300 border-white/10 bg-white/2" : "text-[#2d3748] bg-white"} backdrop-blur-md border rounded-2xl h-[210px] shadow-xl w-full p-[24px]`}>
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-xl font-bold tracking-wider">{headerDateString}</h2>
      </div>

      <div className={`${isDark ? "bg-white/4" : "bg-[#f0f1f5]"} p-4 rounded-xl shadow-lg`}>
        <div className="grid grid-cols-7 text-center">
          {dayNames.map((day) => (
            <div key={day} className={`text-sm font-medium mb-3 ${isDark ? "text-slate-400 mb-3" : "text-black/80"}`}>
              {day}
            </div>
          ))}

          {weekDays.map((day, index) => {
            const isSelected = day.toDateString() === selectedDate.toDateString();
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className="flex items-center justify-center cursor-pointer text-white mx-[2px]"
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-lg text-md font-semibold transition-colors
                    ${isSelected ? (isDark ? "bg-[#5a69ff]" : "") : (isDark ? "bg-black/10 " : "bg-white text-black/40")} shadow-xs`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;

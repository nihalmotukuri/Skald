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
    <div className={`${isDark ? "text-gray-300 border-white/20 bg-white/6" : "text-black/60 border-black/20 bg-neutral-400/50"} backdrop-blur-md border rounded-2xl h-[210px] shadow-lg w-full p-[24px]`}>
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-xl font-bold tracking-wider">{headerDateString}</h2>
      </div>

      <div className={`${isDark ? "bg-white/4" : "bg-[#0f111a]"} p-4 rounded-xl`}>
        <div className="grid grid-cols-7 text-center">
          {dayNames.map((day) => (
            <div key={day} className={`text-sm font-medium mb-3 ${isDark ? "text-slate-400 mb-3" : "text-black/40"}`}>
              {day}
            </div>
          ))}

          {weekDays.map((day, index) => {
            const isSelected = day.toDateString() === selectedDate.toDateString();
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className="flex items-center justify-center cursor-pointer text-white"
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-lg text-md font-semibold transition-colors
                    ${isSelected ? "bg-[#5a69ff]" : ""} ${isSelected && !isDark ? "bg-blue-950" : ""}`}
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

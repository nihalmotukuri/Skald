// components/AnalogClockWidget.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const ClockWidget = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = (360 / 12) * hours + (360 / 12) * (minutes / 60);
  const minuteDeg = (360 / 60) * minutes;
  const secondDeg = (360 / 60) * seconds;

  const day = time.toLocaleDateString("en-US", { weekday: "long" });
  const date = time.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const digitalTime = time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <motion.div className="h-full w-full">
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-lg w-full flex flex-col items-center justify-center gap-3">
        
        {/* Clock Circle */}
        <CardContent className="relative w-[180px] h-[180px] rounded-full border-[3px] border-white/20">
          {[0, 90, 180, 270].map((deg, index) => (
            <div
              key={index}
              className="absolute w-[2px] h-[12px] bg-white/40 origin-bottom"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -100%) rotate(${deg}deg) translateY(-76px)`,
              }}
            />
          ))}

          <div
            className="absolute left-1/2 top-1/2 w-[4px] h-[28px] bg-white origin-bottom rounded-sm"
            style={{
              transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
              transition: "transform 0.5s ease-in-out",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 w-[2px] h-[42px] bg-white origin-bottom rounded-sm"
            style={{
              transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
              transition: "transform 0.5s ease-in-out",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 w-[1px] h-[56px] bg-red-500 origin-bottom rounded-sm"
            style={{
              transform: `translate(-50%, -100%) rotate(${secondDeg}deg)`,
            }}
          />
          <div className="absolute w-[10px] h-[10px] bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/40" />
        </CardContent>

        {/* Digital Clock */}
        <div className="text-2xl font-mono tracking-wide text-white/90">{digitalTime}</div>

        {/* Day and Date */}
        <div className="text-xs text-slate-400 font-medium tracking-wider uppercase">
          {day}, {date}
        </div>
      </Card>
    </motion.div>
  );
};

export default ClockWidget;

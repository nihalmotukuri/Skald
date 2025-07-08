// components/AnalogClockWidget.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-lg w-[320px] h-[320px] flex items-center justify-center relative">
        <CardHeader className="absolute top-4 left-4">
          {/* <CardTitle className="text-white text-base font-medium">
            Analog Clock
          </CardTitle> */}
        </CardHeader>

        <CardContent className="relative w-[180px] h-[180px] rounded-full border-[3px] border-white/20">
          {/* Tick Marks */}
          {[0, 90, 180, 270].map((deg, index) => (
            <div
              key={index}
              className="absolute w-[2px] h-[12px] bg-white/40 origin-bottom"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -100%) rotate(${deg}deg) translateY(-78px)`,
              }}
            />
          ))}

          {/* Hour hand */}
          <div
            className="absolute left-1/2 top-1/2 w-[4px] h-[40px] bg-white origin-bottom rounded-sm"
            style={{
              transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
              transition: "transform 0.5s ease-in-out",
            }}
          />

          {/* Minute hand */}
          <div
            className="absolute left-1/2 top-1/2 w-[2px] h-[60px] bg-white origin-bottom rounded-sm"
            style={{
              transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
              transition: "transform 0.5s ease-in-out",
            }}
          />

          {/* Second hand */}
          <div
            className="absolute left-1/2 top-1/2 w-[1px] h-[70px] bg-red-500 origin-bottom rounded-sm"
            style={{
              transform: `translate(-50%, -100%) rotate(${secondDeg}deg)`,
              // transition: "transform 0.2s linear",
            }}
          />

          {/* Center pin */}
          <div className="absolute w-[10px] h-[10px] bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/40" />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClockWidget;

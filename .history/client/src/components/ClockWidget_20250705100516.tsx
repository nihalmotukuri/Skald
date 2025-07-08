// components/ClockWidget.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ClockWidget = ({ className = "" }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className={`bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-lg w-[320px] ${className}`}>
        <CardHeader>
          <CardTitle className="text-white text-base font-medium">
            Current Time
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center pb-4">
          <div className="text-5xl font-semibold tracking-widest font-mono" style={{fontFamily: '"DS-Digital", sans-serif'}}>
            {formatTime(time)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClockWidget;

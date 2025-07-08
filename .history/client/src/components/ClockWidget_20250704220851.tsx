// components/ClockWidget.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ClockWidget = ({ className = "" }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <motion.div
      className={`backdrop-blur-md bg-white/5 text-white rounded-2xl shadow-lg px-6 py-4 text-center ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h2 className="text-sm text-slate-400 font-medium tracking-wider mb-1">Current Time</h2>
      <div className="text-4xl font-mono font-semibold tracking-wide">
        {formatTime(time)}
      </div>
    </motion.div>
  );
};

export default ClockWidget;

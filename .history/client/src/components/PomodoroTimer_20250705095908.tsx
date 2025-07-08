// components/PomodoroTimer.jsx
import { useTimer } from "react-timer-hook";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PomodoroTimer = ({ duration = 25 * 60 }) => {
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + duration);

  const {
    seconds,
    minutes,
    isRunning,
    pause,
    resume,
    restart,
  } = useTimer({ expiryTimestamp, autoStart: false });

  const resetTimer = () => {
    const newTime = new Date();
    newTime.setSeconds(newTime.getSeconds() + duration);
    restart(newTime, false);
  };

  return (
    <motion.div
    //   initial={{ opacity: 0, y: 12 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="bg-[#1b1d26] rounded-[18px] backdrop-blur-md border border-white/10 text-white shadow-lg w-full">
        <CardHeader>
          <CardTitle className="text-white text-base font-medium" style={{fon}}>Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 pb-4">
          <div className="text-5xl font-mono font-bold tracking-wide">
            {`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
          </div>
          <div className="flex gap-2">
            {isRunning ? (
              <Button
                onClick={pause}
                className="bg-red-500 text-white hover:bg-red-600 transition"
              >
                Pause
              </Button>
            ) : (
              <Button
                onClick={resume}
                className="bg-green-500 text-white hover:bg-green-600 transition"
              >
                Start
              </Button>
            )}
            <Button
              onClick={resetTimer}
              className="bg-slate-500 text-white hover:bg-slate-600 transition"
              variant="secondary"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PomodoroTimer;

import { useEffect, useState } from "react";
import { useTimer } from "react-timer-hook";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VscDebugStart } from "react-icons/vsc";
import { CiPause1, CiRedo } from "react-icons/ci";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const PomodoroTimer = ({ duration = 25 * 60 }) => {
  // const [initialTimestamp] = useState(() => new Date());
  const [isStarted, setIsStarted] = useState(false);

  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + duration);

  const {
    seconds,
    minutes,
    isRunning,
    pause,
    resume,
    restart,
    totalSeconds,
  } = useTimer({
    expiryTimestamp,
    autoStart: false,
    onExpire: () => setIsStarted(false),
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isStarted && totalSeconds > 0) {
      const remaining = minutes * 60 + seconds;
      setProgress(100 - Math.floor((remaining / duration) * 100));
    }
  }, [minutes, seconds, isStarted]);

  const resetTimer = () => {
    const newTime = new Date();
    newTime.setSeconds(newTime.getSeconds() + duration);
    restart(newTime, false);
    setIsStarted(false);
    setProgress(0);
  };

  const startTimer = () => {
    const newTime = new Date();
    newTime.setSeconds(newTime.getSeconds() + duration);
    restart(newTime, true);
    setIsStarted(true);
  };

  const statusLabel = !isStarted
    ? "Not Started"
    : isRunning
    ? "Focus Session"
    : progress >= 100
    ? "Completed"
    : "Paused";

  return (
    <motion.div>
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-lg w-full">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
          {/* Circular Progress Timer */}
          <div className="w-[160px] h-[160px]">
            <CircularProgressbarWithChildren
              value={progress}
              strokeWidth={8}
              styles={buildStyles({
                pathColor: "#5a69ff",
                trailColor: "#2f3241",
              })}
            >
              <div className="text-3xl font-mono font-bold text-white">
                {`${String(minutes).padStart(2, "0")}:${String(
                  seconds
                ).padStart(2, "0")}`}
              </div>
              {isRunning && (
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shadow-lg shadow-green-500/40 animate-pulse" />
              )}
            </CircularProgressbarWithChildren>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 pt-2">
            {!isStarted || progress >= 100 ? (
              <Button
                onClick={startTimer}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl"
              >
                <VscDebugStart size={20} />
              </Button>
            ) : isRunning ? (
              <Button
                onClick={pause}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl"
              >
                <CiPause1 size={20} />
              </Button>
            ) : (
              <Button
                onClick={resume}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl"
              >
                <VscDebugStart size={20} />
              </Button>
            )}
            <Button
              onClick={resetTimer}
              className="bg-slate-500 hover:bg-slate-600 text-white px-3 py-2 rounded-xl"
            >
              <CiRedo size={20} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PomodoroTimer;

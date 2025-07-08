// components/PomodoroTimer.jsx
import { useTimer } from "react-timer-hook";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VscDebugStart } from "react-icons/vsc";
import { CiPause1, CiRedo } from "react-icons/ci";

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
    <motion.div>
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-lg w-full">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
          <div className="text-5xl font-mono font-bold tracking-wider">
            {`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
          </div>
          <div className="flex items-center gap-3">
            {isRunning ? (
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

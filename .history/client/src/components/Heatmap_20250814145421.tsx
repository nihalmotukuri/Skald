import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import ActivityCalendar from "react-activity-calendar";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface HeatmapData {
  _id: string;
  count: number;
}

const Heatmap = () => {
  const [tasksDone, setTasksDone] = useState<HeatmapData[]>([])
  const { isDark } = useSelector((store: RootState) => store.themeStore)

  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  const startDate = new Date(sixMonthsAgo);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const fullData = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    fullData.push({ date: cursor.toISOString().split("T")[0], count: 0, level: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const firebaseUid = useSelector((store: RootState) => store.userStore.user?.firebaseUid);

  const fetchTaskDone = async () => {
    // Return early if there's no user ID to prevent a failed API call
    if (!firebaseUid) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/heatmap/${firebaseUid}`);
    const data = await res.json();
    setTasksDone(data);
  };

  useEffect(() => {
    fetchTaskDone();
  }, [firebaseUid]); // Add firebaseUid as a dependency

  const mergedData = fullData.map((entry) => {
    const taskData = tasksDone.find((t: HeatmapData) => t._id === entry.date);
    const count = taskData ? taskData.count : 0; // This will now work correctly
    return {
      date: entry.date,
      count,
      level:
        count >= 9 ? 4 :
        count >= 6 ? 3 :
        count >= 3 ? 2 :
        count >= 1 ? 1 : 0,
    };
  });

  return (
    <motion.div>
      <Card className={`${isDark ? "text-slate-400 border-white/10 bg-white/2" : "text-[#2d3748] border-black/20 bg-neutral-200"} backdrop-blur-md border rounded-2xl shadow-lg p-6 w-full`}>
        <div className="px-6 pt-2">
          <p className="text-xs text-slate-500 tracking-widest uppercase font-medium text-center">
            Weekly Activity
          </p>
          <p className="text-sm text-white/80 text-center">Last 6 months of productivity</p>
        </div>

        <CardContent className="p-0 overflow-x-auto max-w-full mx-auto h-full">
          <ActivityCalendar
            data={mergedData}
            hideTotalCount
            blockSize={18}
            blockMargin={5}
            showWeekdayLabels
            labels={{ weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] }}
            theme={{
              isDark ? (
                dark: [
                "#ffffff08", // level 0
                "#a3b4ff33", // level 1
                "#a3b4ff77", // level 2
                "#5a69ffaa", // level 3
                "#5a69ff"    // level 4
              ]
              ):
              ,
              light: [
                "#222222ff", // level 0
                "#23252cff", // level 1
                "#a3b4ff77", // level 2
                "#5a69ffaa", // level 3
                "#5a69ff" 
              ]
            }}
            renderBlock={(block, activity) => (
              <g className="text-slate-400">
                {block}
                <title>
                  {activity.count > 0
                    ? `${activity.count} task${activity.count > 1 ? "s" : ""} on ${activity.date}`
                    : `No tasks done on ${activity.date}`}
                </title>
              </g>
            )}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Heatmap;

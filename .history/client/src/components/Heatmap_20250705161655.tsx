// components/Heatmap.tsx
import ActivityCalendar from "react-activity-calendar";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const Heatmap = () => {
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

  const tasksDone = [
    { date: "2025-01-10", count: 2 }, { date: "2025-01-14", count: 4 }, { date: "2025-01-22", count: 3 },
    { date: "2025-02-03", count: 1 }, { date: "2025-02-07", count: 5 }, { date: "2025-02-11", count: 2 },
    { date: "2025-02-25", count: 6 }, { date: "2025-03-01", count: 3 }, { date: "2025-03-04", count: 7 },
    { date: "2025-03-10", count: 2 }, { date: "2025-03-17", count: 4 }, { date: "2025-03-21", count: 6 },
    { date: "2025-04-01", count: 3 }, { date: "2025-04-05", count: 5 }, { date: "2025-04-09", count: 8 },
    { date: "2025-04-12", count: 2 }, { date: "2025-04-18", count: 9 }, { date: "2025-04-23", count: 4 },
    { date: "2025-05-01", count: 6 }, { date: "2025-05-06", count: 3 }, { date: "2025-05-10", count: 7 },
    { date: "2025-05-13", count: 2 }, { date: "2025-05-18", count: 5 }, { date: "2025-05-23", count: 1 },
    { date: "2025-06-01", count: 3 }, { date: "2025-06-04", count: 6 }, { date: "2025-06-08", count: 4 },
    { date: "2025-06-12", count: 8 }, { date: "2025-06-16", count: 2 }, { date: "2025-06-20", count: 5 },
    { date: today.toISOString().split("T")[0], count: 5 },
  ];

  const mergedData = fullData.map((entry) => {
    const task = tasksDone.find((t) => t.date === entry.date);
    const count = task ? task.count : 0;
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
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-6 text-slate-400 h-full w-full flex flex-col justify-center items-center">
      <div>
        <div className="mb-[28px]">
          <p className="text-xs text-slate-500 tracking-widest uppercase font-medium">
            Weekly Activity
          </p>
          <p className="text-sm text-white/80">Last 6 months of productivity</p>
        </div>

        <CardContent className="p-0 overflow-x-auto max-w-full mx-auto">
          <ActivityCalendar
            data={mergedData}
            hideTotalCount
            blockSize={18}
            blockMargin={4}
            showWeekdayLabels
            labels={{
              legend: "", // prevent default "Less - More"
              weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            }}
            theme={{
              dark: [
                "#ffffff08",   // level 0
                "#a3b4ff33",   // level 1
                "#a3b4ff77",   // level 2
                "#5a69ffaa",   // level 3
                "#5a69ff"      // level 4
              ],
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
      </div>
      </Card>
    </motion.div>
  );
};

export default Heatmap;

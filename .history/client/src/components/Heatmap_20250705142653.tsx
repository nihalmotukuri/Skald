// components/Heatmap.tsx
import CalendarHeatmap from "react-calendar-heatmap";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import "react-calendar-heatmap/dist/styles.css";
import "@/styles/heatmap-skald.css";

const today = new Date();
const sixMonthsAgo = new Date(today);
sixMonthsAgo.setMonth(today.getMonth() - 6);

const tasksDone = [
  { date: "2025-03-01", count: 1 },
  { date: "2025-03-02", count: 3 },
  { date: "2025-03-03", count: 2 },
  { date: "2025-03-04", count: 6 },
  { date: "2025-03-10", count: 4 },
  { date: "2025-04-01", count: 5 },
  { date: today.toISOString().split("T")[0], count: 7 },
];

export default function Heatmap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[720px] mx-auto"
    >
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <CardHeader className="px-6 pt-6 pb-2">
          <h2 className="text-sm text-slate-400 font-medium tracking-wider">
            Task Completion Heatmap
          </h2>
        </CardHeader>

        <CardContent className="p-6 pt-3">
          <CalendarHeatmap
            startDate={sixMonthsAgo}
            endDate={today}
            values={tasksDone}
            classForValue={(value) => {
              if (!value || typeof value.count !== "number") return "skald-empty";
              if (value.count >= 6) return "skald-level-4";
              if (value.count >= 4) return "skald-level-3";
              if (value.count >= 2) return "skald-level-2";
              return "skald-level-1";
            }}
            showWeekdayLabels
            gutterSize={4}
            tooltipDataAttrs={(value) => ({
              "data-tip": value && value.date
                ? `${value.count} task${value.count > 1 ? "s" : ""} on ${value.date}`
                : "No tasks on this day",
            })}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

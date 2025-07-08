// components/Heatmap.tsx
import CalendarHeatmap from "react-calendar-heatmap";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

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
      className="text-white w-full max-w-[720px] m-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-lg p-6">
        <h2 className="text-sm text-slate-400 font-medium tracking-wider mb-3">
          Task Activity Heatmap
        </h2>

        <CalendarHeatmap
          startDate={sixMonthsAgo}
          endDate={today}
          values={tasksDone}
          classForValue={(value) => {
            if (!value || typeof value.count !== "number") return "color-empty";
            if (value.count >= 6) return "color-github-4";
            if (value.count >= 4) return "color-github-3";
            if (value.count >= 2) return "color-github-2";
            return "color-github-1";
          }}
          showWeekdayLabels
          tooltipDataAttrs={(value) => ({
            "data-tip": value && value.date
              ? `${value.count} task${value.count && value.count > 1 ? "s" : ""} on ${value.date}`
              : "No activity",
          })}
        />
      </Card>
    </motion.div>
  );
}

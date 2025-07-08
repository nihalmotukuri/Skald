import { PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#5a69ff", "#a3b4ff"]; // green (completed), slate (remaining)

const TaskCompletionChart = ({ completed = 7, total = 10 }) => {
  const remaining = total - completed;
  const percentage = Math.round((completed / total) * 100);

  const data = [
    { name: "Completed", value: completed },
    { name: "Remaining", value: remaining },
  ];

  // Custom label in center
  const renderCenterLabel = () => {
    return (
      <foreignObject x="30" y="65" width="120" height="60">
        <div className="flex flex-col items-center justify-center w-full h-full text-white font-mono">
          <span className="text-[10px] tracking-wide text-slate-400">TASKS COMPLETED</span>
          <span className="text-xl font-bold">{percentage}%</span>
        </div>
      </foreignObject>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="bg-[#1b1d26] rounded-[18px] backdrop-blur-md border border-white/10 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-center text-[px]">Task Completion</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center flex-col gap-3">
          <PieChart width={200} height={200}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={90}
              outerRadius={100}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              labelLine={false}
              label={renderCenterLabel}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskCompletionChart;

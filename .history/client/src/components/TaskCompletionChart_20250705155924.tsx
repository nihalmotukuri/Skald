import { PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const COLORS = ["#5a69ff", "#a3b4ff"];

const TaskCompletionChart = ({ completed = 7, total = 10 }) => {
  const remaining = total - completed;
  const percentage = Math.round((completed / total) * 100);

  const data = [
    { name: "Completed", value: completed },
    { name: "Remaining", value: remaining },
  ];

  const renderCenterLabel = () => (
    <foreignObject x="30" y="60" width="140" height="80">
      <div className="flex flex-col items-center justify-center w-full h-full text-white font-mono ml-[10px]">
        <span className="text-[14px] text-slate-400 tracking-wide">PROGRESS</span>
        <span className="text-4xl font-bold">{percentage}%</span>
        <span className="text-[14px] mt-1 text-slate-400 ml-[]">{completed} / {total} tasks</span>
      </div>
    </foreignObject>
  );

  return (
    <motion.div className="h-full w-full">
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-lg h-full w-full">
        <CardContent className="flex items-center justify-center flex-col gap-3 p-6">
          <PieChart width={220} height={220}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius={110}
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

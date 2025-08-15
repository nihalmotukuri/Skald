import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface TaskCompletionChartProps {
  total: number;
  completed: number;
}

const TaskCompletionChart = ({ total, completed }: TaskCompletionChartProps) => {
  const { isDark } = useSelector((store: RootState) => store.themeStore)
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const startAngle = 90; 
  const endAngle = 90 + (percentage / 100) * 360; 

  const renderCenterLabel = () => (
    <foreignObject x="30" y="60" width="140" height="80">
      <div className="flex flex-col items-center justify-center w-full h-full text-white font-mono ml-[10px]">
        <span className={`text-4xl font-bold mt-[18px] ${isDark ? "" : "text-black/80"}`}>{percentage}%</span>
        <span className="text-slate-500">{completed}/{total} tasks done</span>
      </div>
    </foreignObject>
  );

  return (
    <motion.div className="h-full w-full">
      <Card className={`${ isDark ? "bg-white/2 border-white/10" : "bg-white !text-[#2d3748]" } backdrop-blur-md border text-white rounded-2xl shadow-lg h-full w-full`}>
        <CardContent className="flex items-center justify-center flex-col gap-3 pt-[36px] relative">
          {!percentage && (
            <span className="text-md leading-[18px] mt-[14px] absolute text-slate-500 text-center">
              No tasks <br />completed so far
            </span>
          )}
          <h1 className="mt-[-32px] mb-2 font-bold text-[20px]">Task Completion</h1>

          <PieChart width={220} height={220}>
            <Pie
              data={[{ value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={96}
              outerRadius={110}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill="#0f111a" />
            </Pie>

            {percentage > 0 && (
              <Pie
                data={[{ value: completed }]}
                cx="50%"
                cy="50%"
                innerRadius={96}
                outerRadius={110}
                startAngle={startAngle}
                endAngle={endAngle}
                dataKey="value"
                stroke="none"
                isAnimationActive={true}
                cornerRadius={8}
                labelLine={false}
                label={renderCenterLabel}
              >
                <Cell fill="#5a69ff" />
              </Pie>
            )}
          </PieChart>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskCompletionChart;

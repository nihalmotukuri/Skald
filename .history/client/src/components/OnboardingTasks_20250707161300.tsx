// components/OnboardingTasks.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

type Task = {
  id: number;
  title: string;
  due: Date;
  completed: boolean;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Set up your first project board",
    due: new Date("2025-07-05T10:30:00"),
    completed: false,
  },
  {
    id: 2,
    title: "Add 3 tasks to track",
    due: new Date("2025-07-06T14:00:00"),
    completed: false,
  },
];

const OnboardingTasks = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg text-slate-400 h-full w-full gap-4">
        <div className="px-6 pt-2">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-1">
            Onboarding
          </p>
          <p className="text-sm text-white/80 mb-2">
            Complete these to get started
          </p>
        </div>

        <CardContent className="flex flex-col gap-2 px-6 overflow-y-scroll">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start justify-between border border-white/5 rounded-lg p-3 transition-colors duration-200 ${
                task.completed ? "bg-white/5 text-slate-500 line-through" : "bg-white/2"
              }`}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-[]"
                />
                <div>
                  <p className="text-sm font-medium text-white">{task.title}</p>
                  <p className="text-xs text-slate-400">
                    Due: {format(task.due, "PPPp")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingTasks;

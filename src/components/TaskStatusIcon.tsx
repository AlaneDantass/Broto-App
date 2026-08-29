import React from "react";
import { CheckSquare2, Square, Clock } from "lucide-react";
import type { Task } from "../types/database";

interface TaskStatusIconProps {
  status: Task["status"];
  size?: number;
}

export const TaskStatusIcon: React.FC<TaskStatusIconProps> = ({
  status,
  size = 20,
}) => {
  switch (status) {
    case "concluida":
      return (
        <CheckSquare2
          size={size}
          className="text-[#6B705C]"
          strokeWidth={2}
        />
      );
    case "em_andamento":
      return (
        <Clock
          size={size}
          className="text-[#CB997E]"
          strokeWidth={2}
        />
      );
    case "pendente":
    default:
      return (
        <Square
          size={size}
          className="text-[#A5A58D]"
          strokeWidth={2}
        />
      );
  }
};

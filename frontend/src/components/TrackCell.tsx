import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Zap, Settings } from "lucide-react";

interface TrackCellProps {
  onClick: () => void;
  name: string;
  index: number;
  type?: "trigger" | "action";
}

export function TrackCell({
  onClick,
  name,
  index,
  type = "action",
}: TrackCellProps) {
  const isSelected = name !== "Select Trigger" && name !== "Select Action";

  return (
    <Card
      className={`
        w-full p-6 cursor-pointer transition-all duration-200 border-2 hover:shadow-lg
        ${
          isSelected
            ? type === "trigger"
              ? "border-green-200 bg-green-50 hover:border-green-300"
              : "border-blue-200 bg-blue-50 hover:border-blue-300"
            : "border-slate-200 bg-white hover:border-slate-300 border-dashed"
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Step Number */}
          <div
            className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            ${
              isSelected
                ? type === "trigger"
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
                : "bg-slate-200 text-slate-600"
            }
          `}
          >
            {index}
          </div>

          {/* Icon */}
          <div
            className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${
              isSelected
                ? type === "trigger"
                  ? "bg-green-100 text-green-600"
                  : "bg-blue-100 text-blue-600"
                : "bg-slate-100 text-slate-400"
            }
          `}
          >
            {type === "trigger" ? <Zap size={20} /> : <Play size={20} />}
          </div>

          {/* Content */}
          <div>
            <h3
              className={`
              font-semibold text-base
              ${isSelected ? "text-slate-900" : "text-slate-500"}
            `}
            >
              {name}
            </h3>
            <p className="text-sm text-slate-500">
              {type === "trigger" ? "When this happens..." : "Do this..."}
            </p>
          </div>
        </div>

        {/* Configure Button */}
        {isSelected && (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-700"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Settings size={16} />
          </Button>
        )}
      </div>
    </Card>
  );
}

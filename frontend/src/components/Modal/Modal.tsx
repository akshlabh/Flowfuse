import { useState } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { EmailSelector } from "../Selectors/EmailSelector";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { MeetingSelector } from "../Selectors/MeetingSelector";
import { CalendarSelector } from "../Selectors/CalendarSelector";

const actionComponents = {
  email: EmailSelector,
  "Schedule Meeting": MeetingSelector,
  "Schedule Calendar": CalendarSelector,
};

export function Modal({
  index,
  onSelect,
  availableItems,
}: {
  index: number;
  onSelect: (props: null | { name: string; id: string; metadata: any }) => void;
  availableItems: { id: string; name: string; image: string }[];
}) {
  const [step, setStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState<{
    id: string;
    name: string;
  }>();
  const isTrigger = index === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold">
            Select {isTrigger ? "Trigger" : "Action"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSelect(null)}
            className="text-gray-500 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div>
          {step === 1 &&
            Object.entries(actionComponents).map(
              ([actionName, Component]) =>
                selectedAction?.name === actionName && (
                  <Component
                    key={actionName}
                    setMetadata={(metadata) => {
                      onSelect({
                        ...selectedAction,
                        metadata,
                      });
                    }}
                  />
                )
            )}

          {step === 0 && (
            <ScrollArea className="h-72 pr-2">
              <div className="space-y-3">
                {availableItems.map(({ id, name, image }) => (
                  <div
                    key={id}
                    onClick={() => {
                      if (isTrigger) {
                        onSelect({
                          id,
                          name,
                          metadata: {},
                        });
                      } else {
                        setSelectedAction({ id, name });
                        setStep(1);
                      }
                    }}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted cursor-pointer transition"
                  >
                    <img
                      src={image}
                      alt={name}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                    <div className="text-sm font-medium">{name}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}

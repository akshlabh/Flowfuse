"use client";

import { Appbar } from "@/components/Appbar";
import { TrackCell } from "@/components/TrackCell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowDown, Plus, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/Modal/Modal";

function useAvailableActionsAndTriggers() {
  const [availableActions, setAvailableActions] = useState([]);
  const [availableTriggers, setAvailableTriggers] = useState([]);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/trigger/available`)
      .then((x) => setAvailableTriggers(x.data.availableTriggers));

    axios
      .get(`${BACKEND_URL}/api/v1/action/available`)
      .then((x) => setAvailableActions(x.data.availableActions));
  }, []);

  return {
    availableActions,
    availableTriggers,
  };
}

export default function () {
  const router = useRouter();
  const { availableActions, availableTriggers } =
    useAvailableActionsAndTriggers();
  const [selectedTrigger, setSelectedTrigger] = useState<{
    id: string;
    name: string;
  }>();
  const [trackName, setTrackName] = useState("");

  const [selectedActions, setSelectedActions] = useState<
    {
      index: number;
      availableActionId: string;
      availableActionName: string;
      metadata: any;
    }[]
  >([]);
  const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(
    null
  );

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Appbar />

      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="text-blue-600" size={28} />
                Workflow Builder
              </h1>
              <p className="text-slate-600 mt-1">
                Create powerful automations with triggers and actions
              </p>
            </div>
            <Button
              onClick={async () => {
                if (!selectedTrigger?.id) {
                  return;
                }

                const response = await axios.post(
                  `${BACKEND_URL}/api/v1/track`,
                  {
                    name: trackName,
                    availableTriggerId: selectedTrigger.id,
                    triggerMetadata: {},
                    actions: selectedActions.map((a) => ({
                      availableActionId: a.availableActionId,
                      actionMetadata: a.metadata,
                    })),
                  },
                  {
                    headers: {
                      Authorization: localStorage.getItem("token"),
                    },
                  }
                );

                router.push("/dashboard");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium transition-colors shadow-sm"
              disabled={!selectedTrigger?.id}
            >
              Publish Workflow
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
          <div className="p-8">
            {/* Track Name Input */}
            <div className="mb-8 w-full max-w-sm mx-auto text-center">
              <label className="block text-lg font-semibold text-slate-900 mb-2">
                Track Name
              </label>
              <Input
                type="text"
                placeholder="Enter workflow name"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
              />
            </div>
            {/* Workflow Steps */}
            <div className="space-y-6">
              {/* Trigger Step */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      1. Choose a Trigger
                    </h3>
                    <p className="text-sm text-slate-600">
                      Select what starts your automation
                    </p>
                  </div>
                  <TrackCell
                    onClick={() => {
                      setSelectedModalIndex(1);
                    }}
                    name={
                      selectedTrigger?.name
                        ? selectedTrigger.name
                        : "Select Trigger"
                    }
                    index={1}
                    type="trigger"
                  />
                </div>
              </div>

              {/* Arrow Connector */}
              {(selectedTrigger || selectedActions.length > 0) && (
                <div className="flex justify-center">
                  <ArrowDown className="text-slate-400" size={24} />
                </div>
              )}

              {/* Action Steps */}
              {selectedActions.map((action, index) => (
                <div key={action.index} className="flex flex-col items-center">
                  <div className="w-full max-w-md">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {index + 2}. Action Step
                      </h3>
                      <p className="text-sm text-slate-600">
                        What happens when triggered
                      </p>
                    </div>
                    <TrackCell
                      onClick={() => {
                        setSelectedModalIndex(action.index);
                      }}
                      name={
                        action.availableActionName
                          ? action.availableActionName
                          : "Select Action"
                      }
                      index={action.index}
                      type="action"
                    />
                  </div>
                  {/* Arrow Connector */}
                  {index < selectedActions.length - 1 && (
                    <div className="flex justify-center mt-6">
                      <ArrowDown className="text-slate-400" size={24} />
                    </div>
                  )}
                </div>
              ))}

              {/* Add Action Button */}
              <div className="flex justify-center pt-6">
                <Button
                  onClick={() => {
                    setSelectedActions((a) => [
                      ...a,
                      {
                        index: a.length + 2,
                        availableActionId: "",
                        availableActionName: "",
                        metadata: {},
                      },
                    ]);
                  }}
                  variant="outline"
                  className="border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-8 py-6 rounded-xl transition-all duration-200"
                >
                  <Plus className="mr-2" size={20} />
                  Add Action Step
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Build your automation by selecting a trigger and adding action
            steps.
            <br />
            Your workflow will run automatically when the trigger condition is
            met.
          </p>
        </div>
      </div>

      {/* Modal */}
      {selectedModalIndex && (
        <Modal
          availableItems={
            selectedModalIndex === 1 ? availableTriggers : availableActions
          }
          onSelect={(
            props: null | { name: string; id: string; metadata: any }
          ) => {
            if (props === null) {
              setSelectedModalIndex(null);
              return;
            }
            if (selectedModalIndex === 1) {
              setSelectedTrigger({
                id: props.id,
                name: props.name,
              });
            } else {
              setSelectedActions((a) => {
                let newActions = [...a];
                newActions[selectedModalIndex - 2] = {
                  index: selectedModalIndex,
                  availableActionId: props.id,
                  availableActionName: props.name,
                  metadata: props.metadata,
                };
                return newActions;
              });
            }
            setSelectedModalIndex(null);
          }}
          index={selectedModalIndex}
        />
      )}
    </div>
  );
}


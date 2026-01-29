"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Track {
  id: string;
  triggerId: string;
  name: string;
  createdAt: Date;
  userId: number;
  Actions: {
    id: string;
    trackId: string;
    actiontypeId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image?: string;
    };
  }[];
  trigger: {
    id: string;
    trackId: string;
    triggertypeId: string;
    triggertype: {
      id: string;
      name: string;
      image?: string;
    };
  };
}

interface TrackTableProps {
  tracks: Track[];
}

export const TrackTable = ({ tracks }: TrackTableProps) => {
  const HOOKS_URL = process.env.NEXT_PUBLIC_HOOKS_URL;

  const handleCopyWebhook = (trackId: string , userId : number) => {
    const webhookUrl = `${HOOKS_URL}/hooks/catch/${userId}/${trackId}`;
    navigator.clipboard.writeText(webhookUrl);
    console.log("heii")
    toast.success("Webhook URL copied to clipboard");
  };

  const handleViewTrack = (trackId: string) => {
    console.log("Navigate to track:", trackId);
    // Replace with actual navigation logic
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No tracks found</div>
        <div className="text-gray-400">
          Create your first track to get started
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              Trigger
            </th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              Track Name
            </th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              Created
            </th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              Webhook URL
            </th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track) => (
            <tr
              key={track.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {/* Workflow Column */}
              <td className="py-4 px-6">
                <div className="flex items-center">
                  {/* Trigger */}
                  <div className="flex items-center">
                    {track.trigger.triggertype?.image && (
                      <img
                        src={track.trigger.triggertype.image}
                        alt={track.trigger.triggertype.name}
                        className="w-12 rounded"
                      />
                    )}
                  </div>
                </div>
              </td>

              {/* Track ID Column */}
              <td className="py-4 px-6">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                  {track.name}
                </code>
              </td>

              {/* Created Column */}
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(track.createdAt).toLocaleDateString()}</span>
                </div>
              </td>

              {/* Webhook URL Column */}
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono max-w-xs truncate">
                    {`${HOOKS_URL}/hooks/catch/${track.userId}/${track.id}`}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyWebhook(track.id , track.userId)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </td>

              {/* Actions Column */}
              <td className="py-4 px-6">
                <div className="flex items-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewTrack(track.id)}
                  >
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

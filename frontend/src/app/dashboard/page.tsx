"use client"

import { useState, useEffect } from "react";
import { Appbar } from "@/components/Appbar";
import { TrackTable } from "@/components/TrackTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Track {
  id: string;
  name: string;
  createdAt: Date;
  triggerId: string;
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

function useTracks() {
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/track`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setTracks(res.data.tracks);
        setLoading(false);
        console.log(res.data.tracks);
      });
      

  }, []);

  return {
    loading,
    tracks,
  };
}

const page = () => {
  const { loading, tracks } = useTracks();
  const router = useRouter();

  const handleCreateTrack = () => {
    router.push("/track/create");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tracks</h1>
            <p className="text-gray-600 mt-1">
              Manage your automation workflows
            </p>
          </div>
          <Button onClick={handleCreateTrack} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Track
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Tracks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : tracks.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? "..." : tracks.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading
                  ? "..."
                  : tracks.reduce(
                      (acc, track) => acc + track.Actions.length,
                      0
                    )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Track Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <TrackTable tracks={tracks} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;

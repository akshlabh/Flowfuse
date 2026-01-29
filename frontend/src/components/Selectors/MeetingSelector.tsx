import { Button } from "../ui/button";

export function MeetingSelector({
  setMetadata,
}: {
  setMetadata: (params: any) => void;
}) {
  const sampleMetadata = {
    meeting_topic: "{data.meeting_topic}",
    meeting_date: "{data.meeting_date}",
    meeting_time: "{data.meeting_time}",
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800">
        Expected Metadata Format
      </h2>
      <p className="text-sm text-gray-700">
        Please ensure your webhook sends data in the following format:
      </p>
      <pre className="bg-gray-100 text-sm p-4 rounded-md overflow-x-auto text-gray-800">
        {`data:{
        .....
        "meeting_topic": "Test Meeting",
        "meeting_date": "2025-07-15T10:30:00Z",
        "meeting_time": "10:30 AM"
        .....
        }`}
      </pre>

      <Button className="w-full" onClick={() => setMetadata(sampleMetadata)}>
        Confirm
      </Button>
    </div>
  );
}

import { Button } from "../ui/button";

export function CalendarSelector({
  setMetadata,
}: {
  setMetadata: (params: any) => void;
}) {
  const sampleMetadata = {
    cal_topic: "{data.cal_topic}",
    cal_date: "{data.cal_date}",
    cal_time: "{data.cal_time}",
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
        "cal_topic": "Work",
        "cal_date": "2025-07-15",
        "cal_time": "10:30 AM"
        .....
        }`}
      </pre>
      <Button className="w-full" onClick={() => setMetadata(sampleMetadata)}>
        Confirm
      </Button>
    </div>
  );
}

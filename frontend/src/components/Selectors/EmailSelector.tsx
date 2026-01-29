import { Button } from "../ui/button";

export function EmailSelector({
  setMetadata,
}: {
  setMetadata: (params: any) => void;
}) {
  const sampleMetadata = {
    to: "{data.to}",
    body: "{data.body}",
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
        "to": "example@email.com",
        "body": "Hello! This is the message content."
        .....
        }`}
      </pre>
      <Button className="w-full" onClick={() => setMetadata(sampleMetadata)}>
        Confirm
      </Button>
    </div>
  );
}

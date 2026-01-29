import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const client = new PrismaClient();

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {
  const producer = kafka.producer();
  await producer.connect();

  while (true) {
    const pendingRows = await client.trackRunOutBox.findMany({
      where: {},
      take: 10,
    });

    if (pendingRows.length === 0) {
      await new Promise((res) => setTimeout(res, 1000)); // Sleep 1s if no data
      continue;
    }

    const messages = pendingRows.map((row) => ({
      key: String(row.id),
      value: JSON.stringify({trackOutBoxId: row.trackOutBoxId , stage:0}),
    }));

    await producer.send({
      topic: "track-events",
      messages,
    });

    console.log(`Sent ${messages.length} messages to Kafka`);

    await client.trackRunOutBox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((r) => r.id),
        },
      },
    });

    
  }
}

main().catch(console.error);

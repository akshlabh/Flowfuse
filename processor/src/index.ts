import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const client = new PrismaClient();

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

async function main() {
  const producer = kafka.producer();
  await producer.connect();

  while (true) {
    const pendingRows = await client.trackRunOutBox.findMany({ take: 10 });
    const pendingStories = await client.storyOutbox.findMany({ take: 10, include: { story: true } });

    if (pendingRows.length === 0 && pendingStories.length === 0) {
      await new Promise((res) => setTimeout(res, 1000)); // Sleep 1s if no data
      continue;
    }

    const messages = pendingRows.map((row) => ({
      key: String(row.id),
      value: JSON.stringify({trackOutBoxId: row.trackOutBoxId , stage:0}),
    }));

    if (messages.length) await producer.send({ topic: "track-events", messages });

    for (const row of pendingStories) {
      await producer.send({ topic: "track-events", messages: [{
        key: row.storyId,
        value: JSON.stringify({ eventType: "story.created", storyId: row.storyId,
          title: row.story.title, text: row.story.text, language: row.story.language, genre: row.story.genre }),
      }] });
    }

    console.log(`Published ${messages.length} workflow event(s) and ${pendingStories.length} story event(s) to Kafka`);

    await client.trackRunOutBox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((r) => r.id),
        },
      },
    });
    if (pendingStories.length) await client.storyOutbox.deleteMany({ where: { id: { in: pendingStories.map((row) => row.id) } } });

    
  }
}

main().catch(console.error);

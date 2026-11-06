import { Kafka } from "kafkajs";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "./services/email";

require("dotenv").config();

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

async function main() {
  const consumer = kafka.consumer({ groupId: "worker-group" });
  const db = new PrismaClient();

  await consumer.connect();
  await consumer.subscribe({ topic: "track-events", fromBeginning: true });
  await consumer.subscribe({ topic: "story-enrichment-retry", fromBeginning: true });

  const producer = kafka.producer();
  await producer.connect();

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });

      const key = message.key ? message.key.toString() : "no-key";
      const parsedData = JSON.parse(message.value?.toString() || "");
      if (parsedData.eventType === "story.created") {
        try {
          const retryAfter = Number(message.headers?.retryAfter?.toString() || "0");
          if (retryAfter > Date.now()) await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfter - Date.now(), 30000)));
          await enrichStory(db, parsedData);
        } catch (error) {
          const attempts = Number(message.headers?.attempts?.toString() || "0") + 1;
          const retryTopic = attempts >= 5 ? "story-enrichment-dlq" : "story-enrichment-retry";
          const delayMs = Math.min(1000 * (2 ** (attempts - 1)), 30000);
          await producer.send({ topic: retryTopic, messages: [{ key, value: JSON.stringify(parsedData), headers: { attempts: String(attempts), retryAfter: String(Date.now() + delayMs), error: String(error).slice(0, 500) } }] });
          await db.$executeRawUnsafe(`UPDATE "Story" SET "enrichmentStatus" = $1 WHERE "id" = $2`, attempts >= 5 ? "failed" : "retrying", parsedData.storyId);
          console.error(`Story enrichment attempt ${attempts} failed; routed to ${retryTopic}`, error);
        }
        await consumer.commitOffsets([{ topic, partition, offset: (Number(message.offset) + 1).toString() }]);
        return;
      }
      const { trackOutBoxId, stage } = parsedData;

      const trackRunDetails = await db.trackRun.findFirst({
        where: {
          id: trackOutBoxId,
        },
        include: {
          Track: {
            include: {
              Actions: {
                include: {
                  type: true,
                },
              },
            },
          },
        },
      });

      const userEmail = await db.user.findUnique({
        where:{
          id : trackRunDetails?.Track.userId
        }
      }) 

      const currentAction = trackRunDetails?.Track.Actions.find(
        (x) => x.sortingOrder == stage
      );

      if (!currentAction) {
        console.error(
          `No action found for stage ${stage} in track run ${trackOutBoxId}`
        );
        return;
      }

      console.log(currentAction.type.name);

      if (currentAction.type.name === "email") {
        console.log(
          `Sending email for track run ${trackOutBoxId} at stage ${stage}`
        );
        const tracRunMetadata = trackRunDetails?.metadata;
        // @ts-ignore
        const realTo = tracRunMetadata?.data?.to || "";
        // @ts-ignore
        const realBody = tracRunMetadata?.data?.body || "";

        // console.log(realTo);
        // console.log(realBody);


        await sendEmail(realTo, realBody);
      }

      if (currentAction.type.name === "Schedule Meeting") {
        console.log(
          `Scheduling Gmeet for track run ${trackOutBoxId} at stage ${stage}`
        );
        const tracRunMetadata = trackRunDetails?.metadata;
        // @ts-ignore
        const meetingTopic = tracRunMetadata?.data?.meeting_topic || "";
        // @ts-ignore
        const meetingDate = tracRunMetadata?.data?.meeting_date || "";
        // @ts-ignore
        const meetingTime = tracRunMetadata?.data?.meeting_time || "";

        // console.log(`Meeting Topic: ${meetingTopic}`);
        // console.log(`Meeting Date: ${meetingDate}`);
        // console.log(`Meeting Time: ${meetingTime}`);

                

      }

      if (currentAction.type.name === "Schedule Calendar") {
        console.log(
          `Scheduling Gcalendar for track run ${trackOutBoxId} at stage ${stage}`
        );
        const tracRunMetadata = trackRunDetails?.metadata;
        // @ts-ignore
        const calTopic = tracRunMetadata?.data?.cal_topic || "";
        // @ts-ignore
        const calDate = tracRunMetadata?.data?.cal_date || "";
        // @ts-ignore
        const calTime = tracRunMetadata?.data?.cal_time || "";

        // console.log(`Calendar Topic: ${calTopic}`);
        // console.log(`Calendar Date: ${calDate}`);
        // console.log(`Calendar Time: ${calTime}`);

      }


      await new Promise((r) => setTimeout(r, 1000));

      const lastStage = (trackRunDetails?.Track.Actions.length || 1) - 1;

      if (lastStage !== stage) {
        const messages = [
          {
            key: key,
            value: JSON.stringify({ trackOutBoxId, stage: stage + 1 }),
          },
        ];

        await producer.send({
          topic: "track-events",
          messages,
        });
      }

      await consumer.commitOffsets([
        {
          topic: "track-events",
          partition,
          offset: (Number(message.offset) + 1).toString(),
        },
      ]);
    },
  });
}

main();

async function enrichStory(db: PrismaClient, event: { storyId: string; title: string; text: string; language: string; genre?: string | null }) {
  if (!event.storyId || !event.title || !event.text) throw new Error("Malformed story.created event");
  const existing = await db.$queryRawUnsafe<Array<{ enrichmentStatus: string }>>(`SELECT "enrichmentStatus" FROM "Story" WHERE "id" = $1`, event.storyId);
  if (!existing.length) throw new Error(`Story ${event.storyId} no longer exists`);
  if (existing[0].enrichmentStatus === "ready") return;
  await db.$executeRawUnsafe(`UPDATE "Story" SET "enrichmentStatus" = 'processing' WHERE "id" = $1`, event.storyId);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for story enrichment");
  const content = `${event.title}\n\n${event.text}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001"}:embedContent`, {
    method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ model: `models/${process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001"}`, content: { parts: [{ text: content }] }, taskType: "RETRIEVAL_DOCUMENT", outputDimensionality: 768 }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Gemini embedding request failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
  const payload = await response.json() as { embedding?: { values?: number[] } };
  const values = payload.embedding?.values;
  if (!values || values.length !== 768 || values.some((n) => !Number.isFinite(n))) throw new Error("Gemini returned an invalid 768-dimensional embedding");
  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!norm) throw new Error("Gemini returned a zero vector");
  const normalized = values.map((value) => value / norm);
  const vector = `[${normalized.join(",")}]`;
  const tags = inferTags(`${event.title} ${event.text}`);
  const genre = event.genre || tags.genre;
  await db.$executeRawUnsafe(
    `UPDATE "Story" SET "embedding" = $1::vector, "genre" = COALESCE("genre", $2), "mood" = $3, "tags" = $4, "enrichedAt" = NOW(), "enrichmentStatus" = 'ready' WHERE "id" = $5`,
    vector, genre, tags.mood, tags.tags, event.storyId);
}

function inferTags(text: string) {
  const lower = text.toLowerCase();
  const genre = /राजा|रानी|king|queen|prince|princess/.test(lower) ? "folk-tale" : /जंगल|वन|forest|animal|शेर|लोमड़ी|fox|lion/.test(lower) ? "animal-fable" : "folklore";
  const mood = /भय|डर|राक्षस|demon|fear|dark/.test(lower) ? "mysterious" : /हँस|खुश|आनंद|joy|laugh/.test(lower) ? "joyful" : "wonder";
  return { genre, mood, tags: [genre, mood] };
}

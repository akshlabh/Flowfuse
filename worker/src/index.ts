import { Kafka } from "kafkajs";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "./services/email";

require("dotenv").config;

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {
  const consumer = kafka.consumer({ groupId: "worker-group" });
  const db = new PrismaClient();

  await consumer.connect();
  await consumer.subscribe({ topic: "track-events", fromBeginning: true });

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

import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();

async function main() {

  await prismaClient.availableActions.create({
    data: {
      name: "Schedule Meeting",
      image:
        "https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-96dp/logo_meet_2020q4_color_2x_web_96dp.png",
    },
  });

  await prismaClient.availableActions.create({
    data: {
      name: "Schedule Calendar",
      image:
        "https://cdn.prod.website-files.com/676a69ae31974ab96cb8993b/67936b6f46f104d14b034d60_Google-Calendar-Logo.png",
    },
  });
}

main();

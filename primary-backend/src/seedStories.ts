import { randomUUID } from "crypto";
import { prismaClient } from "./db";

// 200 compact original folk-tale variations in English and Hindi, suitable for local demos.
const characters = ["a clever rabbit", "a kind farmer", "a curious child", "a wise elephant", "a little bird", "a village potter", "a brave girl", "a gentle tiger", "an old gardener", "a traveling musician"];
const places = ["the banyan forest", "a riverside village", "the Himalayan foothills", "a mango orchard", "a quiet desert town", "the monsoon hills", "a royal garden", "a small island", "a mountain pass", "a moonlit lake"];
const lessons = ["sharing brings unexpected friends", "patience can solve what strength cannot", "honesty earns lasting trust", "small acts of kindness travel far", "wisdom matters more than wealth", "listening can reveal a better path", "courage grows when we help others", "greed can cost us what we already have", "every voice deserves to be heard", "working together makes hard things possible"];
const hindiCharacters = ["चतुर खरगोश", "दयालु किसान", "जिज्ञासु बच्ची", "बुद्धिमान हाथी", "नन्ही चिड़िया", "गाँव का कुम्हार", "साहसी लड़की", "शांत बाघ", "बूढ़ा माली", "यात्री गायक"];
const hindiPlaces = ["बरगद का जंगल", "नदी किनारे का गाँव", "हिमालय की तलहटी", "आम का बाग", "रेगिस्तान का छोटा नगर", "बारिश से भीगी पहाड़ियाँ", "राजमहल का बगीचा", "छोटा सा द्वीप", "पहाड़ी दर्रा", "चाँदनी झील"];
const hindiLessons = ["बाँटने से अनजाने दोस्त मिलते हैं", "धैर्य से कठिनाई हल होती है", "सच्चाई से भरोसा बनता है", "दयालुता दूर तक पहुँचती है", "बुद्धि धन से बड़ी होती है", "ध्यान से सुनने पर सही राह मिलती है", "दूसरों की मदद से साहस बढ़ता है", "लालच अपना सुख छीन लेता है", "हर आवाज़ सुनने योग्य है", "मिलकर कठिन काम आसान होता है"];

async function main() {
  const stories = Array.from({ length: 200 }, (_, index) => {
    const i = index % 10;
    const round = Math.floor(index / 10) + 1;
    if (index % 2 === 0) {
      const character = characters[i]; const place = places[(i + round) % 10]; const lesson = lessons[(i * 3 + round) % 10];
      return { title: `The ${character} of ${place} ${round}`, text: `In ${place}, ${character} found a tiny brass bell beside the old path. Each morning it rang whenever someone nearby needed help. One rainy evening, a lost traveler followed its gentle sound to shelter. The traveler repaired the village bridge, and the neighbors shared a warm meal beneath the banyan leaves. By dawn, the bell was quiet again. Everyone remembered that ${lesson}.`, language: "en" };
    }
    const character = hindiCharacters[i]; const place = hindiPlaces[(i + round) % 10]; const lesson = hindiLessons[(i * 3 + round) % 10];
    return { title: `${place} का ${character} ${round}`, text: `${place} में ${character} को पुराने रास्ते पर पीतल की एक छोटी घंटी मिली। जब भी किसी को सहायता चाहिए होती, घंटी धीरे से बज उठती। एक बरसाती शाम एक यात्री उसकी आवाज़ सुनकर सुरक्षित आश्रय तक पहुँचा। यात्री ने गाँव का पुल ठीक किया और सबने मिलकर भोजन बाँटा। सुबह घंटी शांत थी, पर सबको याद रहा कि ${lesson}।`, language: "hi" };
  });
  await prismaClient.$transaction(async (tx) => {
    for (const story of stories) {
      const created = await tx.story.create({ data: story });
      await tx.storyOutbox.create({ data: { id: randomUUID(), storyId: created.id } });
    }
  }, { timeout: 120000 });
  console.log(`Seeded ${stories.length} bilingual stories; outbox events are ready for enrichment.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prismaClient.$disconnect());

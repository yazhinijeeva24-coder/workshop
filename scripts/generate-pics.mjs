import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

const OUT_DIR = "/home/z/my-project/public/pics";

const STYLE =
  "Flat modern vector illustration, emerald green and teal color palette with warm cream background, rounded friendly shapes, soft gradients, clean minimal composition, no text, no words, no letters, no numbers, no watermark, high quality, detailed";

const IMAGES = [
  {
    name: "hero-wallet.png",
    size: "1152x864",
    prompt: `Cheerful young person sitting cross-legged holding a smartphone and smiling, surrounded by floating golden coins, paper receipts, a small donut chart and upward sparkles, ${STYLE}`,
  },
  {
    name: "pic-welcome.png",
    size: "1024x1024",
    prompt: `Cute friendly wallet character with a happy smiling face and small pilot wings, golden coins flying around it with soft sparkles, ${STYLE}`,
  },
  {
    name: "pic-smart-add.png",
    size: "1024x1024",
    prompt: `Hand holding a smartphone with a glowing chat message bubble and a bright lightning bolt above the screen, golden coins and a tiny paper receipt floating out of the phone, ${STYLE}`,
  },
  {
    name: "pic-budget.png",
    size: "1024x1024",
    prompt: `Happy pink piggy bank wearing a green safety shield, standing beside a rounded horizontal progress bar filled two thirds with green, a few golden coins on the ground, ${STYLE}`,
  },
  {
    name: "pic-insights.png",
    size: "1024x1024",
    prompt: `Friendly analytics scene with a big colorful donut chart, a small rising bar chart and a magnifying glass, floating golden coins and sparkles around, ${STYLE}`,
  },
  {
    name: "pic-ready.png",
    size: "1024x1024",
    prompt: `Small cute rocket launching upward with a curved trail of smoke, golden coins and confetti around it, tiny soft clouds, ${STYLE}`,
  },
  {
    name: "pic-empty.png",
    size: "1024x1024",
    prompt: `Open empty wallet with a single tiny green plant sprout growing from inside it, one golden coin and soft sparkles nearby, hopeful cute mood, ${STYLE}`,
  },
];

async function generateOne(zai, img) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await zai.images.generations.create({
        prompt: img.prompt,
        size: img.size,
      });
      const b64 = res?.data?.[0]?.base64;
      if (!b64) throw new Error("empty base64 in response");
      const out = path.join(OUT_DIR, img.name);
      fs.writeFileSync(out, Buffer.from(b64, "base64"));
      const kb = Math.round(fs.statSync(out).size / 1024);
      console.log(`OK  ${img.name}  (${kb} KB)`);
      return;
    } catch (e) {
      console.error(`attempt ${attempt} failed for ${img.name}: ${e.message}`);
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const zai = await ZAI.create();
  for (const img of IMAGES) {
    const out = path.join(OUT_DIR, img.name);
    if (fs.existsSync(out) && fs.statSync(out).size > 10000) {
      console.log(`SKIP ${img.name} (already exists)`);
      continue;
    }
    await generateOne(zai, img);
  }
  console.log("ALL DONE");
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});

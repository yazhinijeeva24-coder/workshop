import sharp from "sharp";
import fs from "fs";

const SRC = "/home/z/my-project/public/appicon-src.png";

const targets = [
  { out: "/home/z/my-project/public/icon-192.png", size: 192 },
  { out: "/home/z/my-project/public/icon-512.png", size: 512 },
  { out: "/home/z/my-project/src/app/apple-icon.png", size: 180 },
  { out: "/home/z/my-project/src/app/icon.png", size: 512 },
];

for (const t of targets) {
  await sharp(SRC)
    .resize(t.size, t.size, { fit: "cover" })
    .png()
    .toFile(t.out);
  console.log(`OK ${t.out} (${t.size}x${t.size})`);
}
console.log("ICONS DONE");

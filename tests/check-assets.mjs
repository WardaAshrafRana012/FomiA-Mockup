import fs from "node:fs";
const assets = JSON.parse(fs.readFileSync("src/data/assets.json", "utf8"));
for (const a of assets) {
  const r = await fetch("http://127.0.0.1:3012" + a.src);
  if (!r.ok) throw Error(a.src + ": " + r.status);
}
console.log("All 24 local asset URLs returned HTTP 200.");

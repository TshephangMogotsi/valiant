import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("build output contains the complete offline site", async () => {
  const html = await readFile(new URL("dist/index.html", root), "utf8");
  const assets = await readdir(new URL("dist/assets/", root));
  const jellyfish = await readdir(new URL("dist/jellyfish/", root));

  assert.match(html, /<title>Valiant Media<\/title>/);
  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
  assert.equal(jellyfish.filter((file) => file.endsWith(".jpg")).length, 12);
});

test("runtime source does not reference remote resources or Sites hosting", async () => {
  const files = [
    "index.html",
    "vite.config.ts",
    "app/main.tsx",
    "app/page.tsx",
    "app/globals.css",
    "app/jellyfish-carousel.tsx",
  ];
  const source = (
    await Promise.all(files.map((file) => readFile(new URL(file, root), "utf8")))
  ).join("\n");

  assert.doesNotMatch(source, /https:\/\//);
  assert.doesNotMatch(source, /@openai\/sites|hosting\.json|next\/font/);
  await assert.rejects(access(new URL(".openai/hosting.json", root)));
});

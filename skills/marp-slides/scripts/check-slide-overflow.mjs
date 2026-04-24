/**
 * Overflow-Checker fuer Marp-Decks.
 *
 * Rendert ein Deck mit `marp --html` in eine temporaere HTML-Datei, laedt
 * sie mit Playwright, misst pro <section> scrollHeight vs clientHeight und
 * meldet jede Folie, deren Content ueber den Canvas hinausragt.
 *
 * Voraussetzungen:
 *   npm install -g playwright
 *   npx playwright install chromium
 *   marp-cli muss im PATH sein
 *
 * Aufruf (aus Repo-Root):
 *   node skills/marp-slides/scripts/check-slide-overflow.mjs deck.md
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const npmRoot = spawnSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["root", "-g"],
  { encoding: "utf8", shell: process.platform === "win32" }
).stdout.trim();
const { chromium } = require(join(npmRoot, "playwright"));

const TOLERANCE_PX = 2;

async function main() {
  const deckArg = process.argv[2];
  if (!deckArg) {
    console.error("Usage: node scripts/check-slide-overflow.mjs <deck.md>");
    process.exit(1);
  }
  const deckPath = resolve(deckArg);
  if (!existsSync(deckPath)) {
    console.error(`Nicht gefunden: ${deckPath}`);
    process.exit(1);
  }

  const workDir = mkdtempSync(join(tmpdir(), "marp-overflow-"));
  const htmlPath = join(workDir, basename(deckPath).replace(/\.md$/i, ".html"));

  const marpBin = process.platform === "win32" ? "marp.cmd" : "marp";
  const render = spawnSync(
    marpBin,
    ["--html", "--allow-local-files", "-o", htmlPath, deckPath],
    { stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" }
  );
  if (render.status !== 0) {
    console.error("marp render fehlgeschlagen:");
    console.error(render.stderr?.toString() || render.stdout?.toString());
    rmSync(workDir, { recursive: true, force: true });
    process.exit(2);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto("file://" + htmlPath.replace(/\\/g, "/"));
  await page.waitForLoadState("networkidle");

  const results = await page.evaluate((tol) => {
    const sections = Array.from(document.querySelectorAll("section"));
    return sections.map((s, i) => {
      const h1 = s.querySelector("h1, h2");
      const heading = h1 ? h1.textContent.trim().replace(/\s+/g, " ") : "";
      const scroll = s.scrollHeight;
      const client = s.clientHeight;
      const overflow = scroll - client;
      return {
        index: i + 1,
        heading,
        scrollHeight: scroll,
        clientHeight: client,
        overflow,
        overflows: overflow > tol,
      };
    });
  }, TOLERANCE_PX);

  await browser.close();
  rmSync(workDir, { recursive: true, force: true });

  const flagged = results.filter((r) => r.overflows);

  console.log(`Deck: ${deckPath}`);
  console.log(`Folien: ${results.length}`);
  console.log(`Canvas-Hoehe: ${results[0]?.clientHeight ?? "?"}px`);
  console.log();

  if (flagged.length === 0) {
    console.log("Alle Folien passen. :)");
    return;
  }

  console.log(`OVERFLOW (${flagged.length}):`);
  for (const r of flagged) {
    const overBy = r.overflow;
    console.log(
      `  Folie ${String(r.index).padStart(3)} | +${String(overBy).padStart(4)}px | ${r.heading || "(kein Heading)"}`
    );
  }
  process.exitCode = flagged.length > 0 ? 3 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

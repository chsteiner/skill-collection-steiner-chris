/**
 * Overflow-Checker fuer Marp-Decks.
 *
 * Rendert ein Deck mit `marp --html` in eine temporaere HTML-Datei, laedt
 * sie mit Playwright, misst pro <section> scrollHeight vs clientHeight und
 * meldet jede Folie, deren Content ueber den Canvas hinausragt.
 *
 * Voraussetzungen:
 *   marp-cli im PATH  (npm install -g @marp-team/marp-cli)
 *   playwright        (npm install -D playwright  OR  npm install -g playwright)
 *   chromium          (npx playwright install chromium)
 *
 * Security: only run this on trusted decks. The script renders with
 * `--allow-local-files`, so a deck can reference arbitrary local paths.
 *
 * Aufruf (aus Repo-Root):
 *   node skills/marp-slides/scripts/check-slide-overflow.mjs deck.md
 */

import { spawnSync } from "node:child_process";
import { rmSync, existsSync } from "node:fs";
import { join, basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Resolve playwright with a local-first strategy:
//   1. Normal require() — picks up a project-local install (npm/pnpm/yarn/bun
//      all put it in node_modules). This is the preferred setup: reproducible
//      per project, version-pinned via package.json.
//   2. Fallback: query the global npm root and require from there. Keeps the
//      script working for users on the old `npm install -g playwright` path.
//   3. Otherwise: print a clear install hint and exit.
let chromium;
try {
  chromium = require("playwright").chromium;
} catch {
  try {
    const globalNpmRoot = spawnSync(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["root", "-g"],
      { encoding: "utf8", shell: process.platform === "win32" }
    ).stdout.trim();
    if (!globalNpmRoot) throw new Error("npm root -g returned no path");
    chromium = require(join(globalNpmRoot, "playwright")).chromium;
  } catch {
    console.error(
      "Could not resolve 'playwright'. Install it either way:\n" +
      "  (preferred) npm install -D playwright\n" +
      "  (fallback)  npm install -g playwright\n" +
      "Then once:  npx playwright install chromium"
    );
    process.exit(1);
  }
}

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

  // Render alongside the source so relative image paths resolve normally.
  // PID suffix avoids collisions when two runs race on the same deck.
  // Dot-prefixed filename keeps it out of `ls`; cleaned up after the run.
  const deckDir = dirname(deckPath);
  const htmlPath = join(
    deckDir,
    "." + basename(deckPath).replace(/\.md$/i, "") +
      "." + process.pid + ".overflow-check.html",
  );

  const marpBin = process.platform === "win32" ? "marp.cmd" : "marp";
  const render = spawnSync(
    marpBin,
    ["--html", "--allow-local-files", "-o", htmlPath, deckPath],
    { stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" }
  );
  if (render.error) {
    console.error(`Failed to run ${marpBin}: ${render.error.message}`);
    console.error("Is marp-cli installed and on PATH? (npm install -g @marp-team/marp-cli)");
    rmSync(htmlPath, { force: true });
    process.exit(2);
  }
  if (render.status !== 0) {
    console.error("marp render fehlgeschlagen:");
    console.error(render.stderr?.toString() || render.stdout?.toString());
    rmSync(htmlPath, { force: true });
    process.exit(2);
  }

  let browser;
  let results;
  try {
    browser = await chromium.launch();
    // Marp sections render at 1280x720. Match viewport so CSS dimensions,
    // pixel density, and text wrapping behave like the PDF export.
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
    });
    await page.goto(pathToFileURL(htmlPath).href);
    await page.waitForLoadState("networkidle");
    // networkidle alone isn't enough for stable measurement: text reflows
    // when the real font finishes loading, and images can shift layout
    // when decoded. Wait for both explicitly.
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.onload = img.onerror = resolve;
              }),
        ),
      );
    });
    // Measure against the real Marp layout — do NOT force display:block.
    // With Marp's natural display:flex + place-content:center + overflow:hidden
    // the section's scrollHeight stays equal to clientHeight even when
    // content is clipped, so the old approach under-reported overflow.
    // Instead, for each section, walk every visible descendant and compare
    // its bounding rect to the section's content-box (section rect minus
    // padding). Any descendant that sticks out in any direction is
    // overflow, regardless of nesting depth or CSS positioning mode.
    results = await page.evaluate((tol) => {
      return Array.from(document.querySelectorAll("section")).map((s, i) => {
        const sRect = s.getBoundingClientRect();
        const style = getComputedStyle(s);
        const padTop    = parseFloat(style.paddingTop)    || 0;
        const padRight  = parseFloat(style.paddingRight)  || 0;
        const padBottom = parseFloat(style.paddingBottom) || 0;
        const padLeft   = parseFloat(style.paddingLeft)   || 0;

        const content = {
          top:    sRect.top    + padTop,
          right:  sRect.right  - padRight,
          bottom: sRect.bottom - padBottom,
          left:   sRect.left   + padLeft,
        };

        const descendants = Array.from(s.querySelectorAll("*")).filter((el) => {
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });

        let topOverflow = 0, rightOverflow = 0, bottomOverflow = 0, leftOverflow = 0;
        for (const el of descendants) {
          const r = el.getBoundingClientRect();
          topOverflow    = Math.max(topOverflow,    content.top    - r.top);
          rightOverflow  = Math.max(rightOverflow,  r.right  - content.right);
          bottomOverflow = Math.max(bottomOverflow, r.bottom - content.bottom);
          leftOverflow   = Math.max(leftOverflow,   content.left   - r.left);
        }

        const overflow = Math.max(topOverflow, rightOverflow, bottomOverflow, leftOverflow);
        const h1 = s.querySelector("h1, h2");
        const heading = h1 ? h1.textContent.trim().replace(/\s+/g, " ") : "";

        return {
          index: i + 1,
          heading,
          clientHeight: s.clientHeight,
          topOverflow:    Math.round(topOverflow),
          rightOverflow:  Math.round(rightOverflow),
          bottomOverflow: Math.round(bottomOverflow),
          leftOverflow:   Math.round(leftOverflow),
          overflow: Math.round(overflow),
          overflows: overflow > tol,
        };
      });
    }, TOLERANCE_PX);
  } finally {
    if (browser) await browser.close().catch(() => {});
    rmSync(htmlPath, { force: true });
  }

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
    const tags = [];
    if (r.topOverflow    > TOLERANCE_PX) tags.push(`top+${r.topOverflow}`);
    if (r.rightOverflow  > TOLERANCE_PX) tags.push(`right+${r.rightOverflow}`);
    if (r.bottomOverflow > TOLERANCE_PX) tags.push(`bottom+${r.bottomOverflow}`);
    if (r.leftOverflow   > TOLERANCE_PX) tags.push(`left+${r.leftOverflow}`);
    const tagStr = tags.length ? `[${tags.join(",")}]` : "";
    console.log(
      `  Folie ${String(r.index).padStart(3)} | +${String(r.overflow).padStart(4)}px ${tagStr.padEnd(30)} | ${r.heading || "(kein Heading)"}`
    );
  }
  process.exitCode = flagged.length > 0 ? 3 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

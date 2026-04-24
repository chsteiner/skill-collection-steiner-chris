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
    // Force each section out of Marp's centered/hidden flex state so we can
    // measure actual child positions. Without this, overflow:hidden + flex
    // place-content:center can silently clip content of any element type —
    // scrollHeight stays equal to clientHeight even when content runs over.
    await page.addStyleTag({
      content: "section{display:block!important;overflow:visible!important;}",
    });

    results = await page.evaluate((tol) => {
    const sections = Array.from(document.querySelectorAll("section"));
    return sections.map((s, i) => {
      const h1 = s.querySelector("h1, h2");
      const heading = h1 ? h1.textContent.trim().replace(/\s+/g, " ") : "";
      const scroll = s.scrollHeight;
      const client = s.clientHeight;
      const scrollOverflow = scroll - client;

      // Marp uses display:flex + place-content:center with overflow:hidden.
      // That can silently clip content without changing scrollHeight.
      // Better signal: sum up direct children's full heights (including margins)
      // and compare to the section's content-box height (minus padding).
      const style = getComputedStyle(s);
      const padTop = parseFloat(style.paddingTop) || 0;
      const padBottom = parseFloat(style.paddingBottom) || 0;
      const contentBoxHeight = client - padTop - padBottom;

      const kids = Array.from(s.children);
      let childrenTotalHeight = 0;
      let imgNaturalOverflow = false;
      let maxChildBottom = 0;
      const sRect = s.getBoundingClientRect();

      for (const kid of kids) {
        const kStyle = getComputedStyle(kid);
        const marginTop = parseFloat(kStyle.marginTop) || 0;
        const marginBottom = parseFloat(kStyle.marginBottom) || 0;
        const kRect = kid.getBoundingClientRect();
        childrenTotalHeight += kRect.height + marginTop + marginBottom;
        const kBottomRel = kRect.bottom - sRect.top;
        if (kBottomRel > maxChildBottom) maxChildBottom = kBottomRel;

        // Check images specifically: does natural aspect ratio exceed render box?
        const imgs = kid.querySelectorAll("img");
        for (const img of imgs) {
          if (img.naturalWidth && img.naturalHeight && img.clientWidth) {
            const expectedHeight =
              (img.clientWidth * img.naturalHeight) / img.naturalWidth;
            // If the image's rendered height is noticeably smaller than the
            // aspect-ratio height, Marp is clipping/scaling it.
            if (expectedHeight - img.clientHeight > 3) imgNaturalOverflow = true;
          }
        }
      }

      const childOverflow = Math.max(
        0,
        Math.round(childrenTotalHeight - contentBoxHeight),
      );
      const bottomOverflow = Math.max(
        0,
        Math.round(maxChildBottom - (client - padBottom)),
      );
      const overflow = Math.max(scrollOverflow, childOverflow, bottomOverflow);

      return {
        index: i + 1,
        heading,
        scrollHeight: scroll,
        clientHeight: client,
        scrollOverflow,
        childOverflow,
        bottomOverflow,
        overflow,
        imgNaturalOverflow,
        overflows: overflow > tol || imgNaturalOverflow,
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
    if (r.imgNaturalOverflow) tags.push("img-clip");
    if (r.scrollOverflow > TOLERANCE_PX) tags.push(`scroll+${r.scrollOverflow}`);
    if (r.childOverflow > TOLERANCE_PX) tags.push(`child+${r.childOverflow}`);
    if (r.bottomOverflow > TOLERANCE_PX) tags.push(`bottom+${r.bottomOverflow}`);
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

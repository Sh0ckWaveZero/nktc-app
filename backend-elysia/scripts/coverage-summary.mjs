#!/usr/bin/env node
/**
 * Reads coverage/lcov.info and prints a summary excluding generated/ files.
 * Use after: bun test --coverage --coverage-reporter=lcov
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const lcovPath = join(__dir, "../coverage/lcov.info");

let lcov;
try {
  lcov = readFileSync(lcovPath, "utf8");
} catch {
  console.error("coverage/lcov.info not found — run: bun run test:coverage first");
  process.exit(1);
}

const EXCLUDE = [/^generated\//, /^src\/libs\/xlsx\.ts$/];

const sections = lcov.split("end_of_record\n").filter(Boolean);

let totalLines = 0, coveredLines = 0;
let totalFuncs = 0, coveredFuncs = 0;
let totalBranches = 0, coveredBranches = 0;

const rows = [];

for (const section of sections) {
  const sfMatch = section.match(/^SF:(.+)$/m);
  if (!sfMatch) continue;
  const file = sfMatch[1];

  const isExcluded = EXCLUDE.some((p) => p.test(file));
  if (isExcluded) continue;

  const lf = Number(section.match(/^LF:(\d+)$/m)?.[1] ?? 0);
  const lh = Number(section.match(/^LH:(\d+)$/m)?.[1] ?? 0);
  const fnf = Number(section.match(/^FNF:(\d+)$/m)?.[1] ?? 0);
  const fnh = Number(section.match(/^FNH:(\d+)$/m)?.[1] ?? 0);
  const brf = Number(section.match(/^BRF:(\d+)$/m)?.[1] ?? 0);
  const brh = Number(section.match(/^BRH:(\d+)$/m)?.[1] ?? 0);

  totalLines += lf;
  coveredLines += lh;
  totalFuncs += fnf;
  coveredFuncs += fnh;
  totalBranches += brf;
  coveredBranches += brh;

  const linePct = lf > 0 ? ((lh / lf) * 100).toFixed(2) : "100.00";
  const funcPct = fnf > 0 ? ((fnh / fnf) * 100).toFixed(2) : "100.00";

  rows.push({ file: file.replace(/^src\//, ""), linePct, funcPct, lh, lf, fnh, fnf });
}

const pad = (s, n) => String(s).padEnd(n);
const rpad = (s, n) => String(s).padStart(n);

const maxFile = Math.max(20, ...rows.map((r) => r.file.length)) + 2;

console.log("\n" + "─".repeat(maxFile + 40));
console.log(pad("File (src/ only)", maxFile) + rpad("% Funcs", 10) + rpad("% Lines", 10) + rpad("Lines", 10));
console.log("─".repeat(maxFile + 40));

for (const r of rows.sort((a, b) => a.file.localeCompare(b.file))) {
  const lineFlag = Number(r.linePct) < 80 ? " ⚠" : "";
  const funcFlag = Number(r.funcPct) < 80 ? " ⚠" : "";
  console.log(
    pad(r.file, maxFile) +
    rpad(r.funcPct + "%", 10) + funcFlag.padEnd(2) +
    rpad(r.linePct + "%", 10) + lineFlag.padEnd(2) +
    rpad(`${r.lh}/${r.lf}`, 10),
  );
}

const allLinePct = totalLines > 0 ? ((coveredLines / totalLines) * 100).toFixed(2) : "100.00";
const allFuncPct = totalFuncs > 0 ? ((coveredFuncs / totalFuncs) * 100).toFixed(2) : "100.00";
const allBranchPct = totalBranches > 0 ? ((coveredBranches / totalBranches) * 100).toFixed(2) : "N/A";

console.log("─".repeat(maxFile + 40));
console.log(
  pad("All src/ files", maxFile) +
  rpad(allFuncPct + "%", 10) +
  "  " +
  rpad(allLinePct + "%", 10) +
  "  " +
  rpad(`${coveredLines}/${totalLines}`, 10),
);
console.log("─".repeat(maxFile + 40));
console.log(`\nBranches: ${coveredBranches}/${totalBranches} (${allBranchPct}%)\n`);

const threshold = 0.9;
const lineFail = coveredLines / totalLines < threshold;
const funcFail = coveredFuncs / totalFuncs < threshold;

if (lineFail || funcFail) {
  if (lineFail) console.error(`✗ Lines ${allLinePct}% < ${threshold * 100}%`);
  if (funcFail) console.error(`✗ Funcs ${allFuncPct}% < ${threshold * 100}%`);
  process.exit(1);
} else {
  console.log(`✓ Coverage ≥ ${threshold * 100}% (lines: ${allLinePct}%, funcs: ${allFuncPct}%)`);
}

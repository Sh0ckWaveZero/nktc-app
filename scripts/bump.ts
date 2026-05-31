import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");

const PACKAGES = [
  join(ROOT, "package.json"),
  join(ROOT, "frontend", "package.json"),
  join(ROOT, "backend-elysia", "package.json"),
];

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function writeJson(path: string, data: object) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

function bumpSemver(version: string, part: "major" | "minor" | "patch") {
  const [major, minor, patch] = version.split(".").map(Number);
  if (part === "major") return `${major + 1}.0.0`;
  if (part === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function getCurrentVersions() {
  return PACKAGES.map((p) => {
    const pkg = readJson(p);
    return { path: p, name: pkg.name as string, version: pkg.version as string };
  });
}

function setVersionAll(newVersion: string) {
  for (const pkgPath of PACKAGES) {
    const pkg = readJson(pkgPath);
    const oldVersion = pkg.version;
    pkg.version = newVersion;
    writeJson(pkgPath, pkg);
    console.log(`  ${pkg.name}: ${oldVersion} → ${newVersion}`);
  }
}

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "status") {
  console.log("Current versions:");
  for (const { name, version } of getCurrentVersions()) {
    console.log(`  ${name}: ${version}`);
  }
  process.exit(0);
}

if (command === "set") {
  const target = args[1];
  if (!target || !/^\d+\.\d+\.\d+$/.test(target)) {
    console.error("Usage: bun ./scripts/bump.ts set <version>");
    console.error("Example: bun ./scripts/bump.ts set 1.0.5");
    process.exit(1);
  }
  console.log(`Setting all packages to ${target}:`);
  setVersionAll(target);
  console.log("Done.");
  process.exit(0);
}

if (["major", "minor", "patch"].includes(command)) {
  const rootPkg = readJson(PACKAGES[0]);
  const current = rootPkg.version as string;
  const next = bumpSemver(current, command as "major" | "minor" | "patch");
  console.log(`Bumping ${command}: ${current} → ${next}`);
  setVersionAll(next);
  console.log("Done.");
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
console.error("Usage:");
console.error("  bun ./scripts/bump.ts               # show versions");
console.error("  bun ./scripts/bump.ts status        # show versions");
console.error("  bun ./scripts/bump.ts patch         # bump patch (1.0.5 → 1.0.6)");
console.error("  bun ./scripts/bump.ts minor         # bump minor (1.0.5 → 1.1.0)");
console.error("  bun ./scripts/bump.ts major         # bump major (1.0.5 → 2.0.0)");
console.error("  bun ./scripts/bump.ts set 1.0.5     # set exact version");
process.exit(1);

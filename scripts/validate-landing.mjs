#!/usr/bin/env node
// Validate landing-page configs.
//
//   node scripts/validate-landing.mjs            # every src/landing-pages/*.js
//   node scripts/validate-landing.mjs <slug>     # just src/landing-pages/<slug>.js
//   node scripts/validate-landing.mjs --dir <path> [slug]   # another config directory
//
// Files starting with `_` (e.g. `_template.js`) are skipped. Prints errors
// grouped by file; exits 1 if any config is invalid, 0 otherwise.
//
// Configs are imported as ES modules. `custom` sections hold
// `component: () => import("./custom/X.jsx")` functions, which are never
// called here, so their JSX targets are never loaded by Node.

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { RESERVED_PATHS, validateConfig } from "../src/landing/schema.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const args = { dir: path.join(repoRoot, "src", "landing-pages"), slug: undefined };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dir") {
      args.dir = path.resolve(argv[++i] ?? "");
    } else if (a === "-h" || a === "--help") {
      console.log("Usage: node scripts/validate-landing.mjs [--dir <path>] [slug]");
      process.exit(0);
    } else if (args.slug === undefined) {
      args.slug = a.replace(/\.js$/, "");
    } else {
      console.error(`Unexpected argument: ${a}`);
      process.exit(2);
    }
  }
  return args;
}

async function main() {
  const { dir, slug } = parseArgs(process.argv.slice(2));
  const rel = (p) => path.relative(process.cwd(), p) || p;

  let files;
  if (slug !== undefined) {
    if (slug.startsWith("_")) {
      console.error(`"${slug}" starts with "_" and is not a landing page.`);
      return 1;
    }
    const file = path.join(dir, `${slug}.js`);
    if (!existsSync(file)) {
      console.error(`No config for slug "${slug}" (expected ${rel(file)}).`);
      return 1;
    }
    files = [file];
  } else {
    if (!existsSync(dir)) {
      console.log(`No landing-page configs found (${rel(dir)} does not exist).`);
      return 0;
    }
    files = readdirSync(dir)
      .filter((f) => f.endsWith(".js") && !f.startsWith("_"))
      .sort()
      .map((f) => path.join(dir, f));
    if (files.length === 0) {
      console.log(`No landing-page configs found in ${rel(dir)}.`);
      return 0;
    }
  }

  let invalid = 0;
  for (const file of files) {
    let errors;
    try {
      const mod = await import(pathToFileURL(file).href);
      errors = validateConfig(mod.default, {
        reservedPaths: RESERVED_PATHS,
        filename: path.basename(file),
      });
    } catch (e) {
      errors = [`import: failed to load config: ${e?.message ?? e}`];
    }

    if (errors.length === 0) {
      console.log(`✓ ${rel(file)}`);
    } else {
      invalid++;
      console.error(`✗ ${rel(file)} (${errors.length} error${errors.length === 1 ? "" : "s"})`);
      for (const e of errors) console.error(`    - ${e}`);
    }
  }

  const total = files.length;
  if (invalid > 0) {
    console.error(`\n${invalid} of ${total} landing-page config${total === 1 ? "" : "s"} invalid.`);
    return 1;
  }
  console.log(`\n${total} landing-page config${total === 1 ? "" : "s"} valid.`);
  return 0;
}

process.exitCode = await main();

#!/usr/bin/env node

import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { RESERVED_PATHS, validateConfig } from "../src/landing/schema.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configDir = path.join(repoRoot, "src", "landing-pages");
const DEFAULT_SITE_URL = "https://focasedu.com";

function parseArgs(argv) {
  let outDir = "dist";

  for (let i = 0; i < argv.length; i++) {
    const argument = argv[i];
    if (argument === "--outDir") {
      const value = argv[++i];
      if (!value || value.startsWith("--")) {
        throw new Error("--outDir requires a directory path");
      }
      outDir = value;
    } else if (argument === "-h" || argument === "--help") {
      console.log("Usage: node scripts/gen-landing-meta.mjs [--outDir <dir>]");
      return null;
    } else {
      throw new Error(`Unexpected argument: ${argument}`);
    }
  }

  return path.resolve(process.cwd(), outDir);
}

function configFiles() {
  if (!existsSync(configDir)) return [];

  return readdirSync(configDir)
    .filter((file) => file.endsWith(".js") && !file.startsWith("_"))
    .sort()
    .map((file) => path.join(configDir, file));
}

async function loadConfigs(files) {
  const configs = [];
  let invalid = 0;

  for (const file of files) {
    let config;
    let errors;

    try {
      const module = await import(pathToFileURL(file).href);
      config = module.default;
      errors = validateConfig(config, {
        reservedPaths: RESERVED_PATHS,
        filename: path.basename(file),
      });
    } catch (error) {
      errors = [`import: failed to load config: ${error?.message ?? error}`];
    }

    const relativeFile = path.relative(process.cwd(), file) || file;
    if (errors.length > 0) {
      invalid++;
      console.error(
        `✗ ${relativeFile} (${errors.length} error${errors.length === 1 ? "" : "s"})`,
      );
      for (const error of errors) console.error(`    - ${error}`);
    } else {
      configs.push(config);
      console.log(`✓ ${relativeFile}`);
    }
  }

  if (invalid > 0) {
    throw new Error(
      `${invalid} of ${files.length} landing-page config${files.length === 1 ? "" : "s"} invalid.`,
    );
  }

  return configs;
}

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function attributeValue(tag, attribute) {
  const match = tag.match(
    new RegExp(`(?:^|\\s)${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function replaceOrInsert(html, pattern, matches, replacement) {
  let replaced = false;
  const updated = html.replace(pattern, (tag) => {
    if (!matches(tag)) return tag;
    if (replaced) return "";
    replaced = true;
    return replacement;
  });

  if (replaced) return updated;
  if (!/<\/head\s*>/i.test(updated)) {
    throw new Error("Build index.html does not contain a closing </head> tag");
  }
  return updated.replace(/<\/head\s*>/i, `  ${replacement}\n</head>`);
}

function setTitle(html, title) {
  return replaceOrInsert(
    html,
    /<title\b[^>]*>[\s\S]*?<\/title\s*>/gi,
    () => true,
    `<title>${htmlEscape(title)}</title>`,
  );
}

function setMeta(html, attribute, key, content) {
  const normalizedKey = key.toLowerCase();
  return replaceOrInsert(
    html,
    /<meta\b[^>]*>/gi,
    (tag) =>
      [attributeValue(tag, "name"), attributeValue(tag, "property")].some(
        (value) => value?.toLowerCase() === normalizedKey,
      ),
    `<meta ${attribute}="${htmlEscape(key)}" content="${htmlEscape(content)}" />`,
  );
}

function normalizedSiteUrl(value) {
  const withoutTrailingSlash = value.trim().replace(/\/+$/, "");
  let parsed;
  try {
    parsed = new URL(withoutTrailingSlash);
  } catch {
    throw new Error(`SITE_URL must be an absolute URL (received ${JSON.stringify(value)})`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`SITE_URL must use http or https (received ${JSON.stringify(value)})`);
  }
  return withoutTrailingSlash;
}

function absoluteUrl(value, siteUrl) {
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}/${value.replace(/^\/+/, "")}`;
}

function pageHtml(template, config, siteUrl, success) {
  const pageUrl = `${siteUrl}/${config.slug}${success ? "-success" : ""}`;
  let html = setTitle(template, config.meta.title);
  html = setMeta(html, "name", "description", config.meta.description);
  html = setMeta(html, "property", "og:title", config.meta.title);
  html = setMeta(html, "property", "og:description", config.meta.description);
  if (config.meta.ogImage !== undefined) {
    html = setMeta(html, "property", "og:image", absoluteUrl(config.meta.ogImage, siteUrl));
  }
  html = setMeta(html, "property", "og:url", pageUrl);
  html = setMeta(html, "name", "twitter:card", "summary_large_image");
  if (success) html = setMeta(html, "name", "robots", "noindex");
  return html;
}

async function main() {
  let outDir;
  try {
    outDir = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Landing meta generation failed: ${error.message}`);
    return 2;
  }
  if (outDir === null) return 0;

  const files = configFiles();
  if (files.length === 0) {
    console.log("No landing-page configs found; no meta HTML generated.");
    return 0;
  }

  let configs;
  try {
    configs = await loadConfigs(files);
  } catch (error) {
    console.error(`\nLanding meta generation failed: ${error.message}`);
    return 1;
  }

  try {
    const siteUrl = normalizedSiteUrl(process.env.SITE_URL || DEFAULT_SITE_URL);
    const templatePath = path.join(outDir, "index.html");
    const template = await readFile(templatePath, "utf8");

    for (const config of configs) {
      for (const success of [false, true]) {
        const route = `${config.slug}${success ? "-success" : ""}`;
        const routeDir = path.join(outDir, route);
        await mkdir(routeDir, { recursive: true });
        await writeFile(path.join(routeDir, "index.html"), pageHtml(template, config, siteUrl, success));
        console.log(`Generated ${path.relative(process.cwd(), path.join(routeDir, "index.html"))}`);
      }
    }
  } catch (error) {
    console.error(`Landing meta generation failed: ${error.message}`);
    return 1;
  }

  return 0;
}

process.exitCode = await main();

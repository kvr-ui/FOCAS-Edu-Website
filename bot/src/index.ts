import path from "node:path";
import dotenv from "dotenv";
import { BOT_DIR, ConfigError, loadConfig, type Config } from "./config.js";
import { COMMANDS, createBot } from "./router.js";

dotenv.config({ path: path.join(BOT_DIR, ".env"), quiet: true });

let config: Config;
try {
  config = loadConfig(process.env);
} catch (err) {
  if (err instanceof ConfigError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}

const { bot, queue } = createBot({ config });

let stopping = false;
async function shutdown(signal: string): Promise<void> {
  if (stopping) return;
  stopping = true;
  console.log(`[bot] ${signal} received, stopping polling (current job: ${queue.current ?? "none"})...`);
  await bot.stop();
  await queue.onIdle();
  process.exit(0);
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await bot.init();
} catch (err) {
  console.error(
    `[bot] Could not connect to Telegram with TELEGRAM_BOT_TOKEN: ${(err as Error).message}\n` +
      "Check the token from @BotFather and the server's network access.",
  );
  process.exit(1);
}

await bot.api.setMyCommands([...COMMANDS]).catch((err) => {
  console.warn(`[bot] could not register the command menu: ${(err as Error).message}`);
});

console.log(
  `[bot] @${bot.botInfo.username} starting (long polling). Allowed users: ${config.allowedIds.size}, ` +
    `owner: ${config.ownerId}, repo: ${config.repoDir}`,
);
await bot.start({ drop_pending_updates: false });

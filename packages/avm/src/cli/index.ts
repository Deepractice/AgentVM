#!/usr/bin/env node
/**
 * AgentVM CLI
 *
 * Usage:
 *   avm serve [options]
 */

import { Command } from "commander";
import { VERSION } from "@agentvm/core";
import { createLogger } from "commonxjs/logger";
import { createHttpApp } from "../http/index.js";

const logger = createLogger("agentvm/cli");
const program = new Command();

program.name("avm").description("AgentVM - AI Agent Virtual Machine").version(VERSION);

program
  .command("serve")
  .description("Start the AgentVM server")
  .option("-p, --port <port>", "Port to listen on", "8080")
  .option("-h, --host <host>", "Host to bind to", "0.0.0.0")
  .option("--data-dir <dir>", "Data directory", "~/.agentvm")
  .action(async (options) => {
    const port = parseInt(options.port, 10);
    const app = createHttpApp({ logging: true });

    logger.info("Starting AgentVM server", { host: options.host, port });

    const server = Bun.serve({
      port,
      hostname: options.host,
      fetch: app.fetch,
    });

    logger.info("AgentVM server running", {
      url: `http://${server.hostname}:${server.port}`,
    });
  });

program.parse();

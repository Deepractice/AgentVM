#!/usr/bin/env node
/**
 * AgentVM CLI
 *
 * Usage:
 *   avm serve [options]
 */

import { Command } from "commander";
import { VERSION } from "@agentvm/core";

const program = new Command();

program.name("avm").description("AgentVM - AI Agent Virtual Machine").version(VERSION);

program
  .command("serve")
  .description("Start the AgentVM server")
  .option("-p, --port <port>", "Port to listen on", "8080")
  .option("-h, --host <host>", "Host to bind to", "0.0.0.0")
  .option("--data-dir <dir>", "Data directory", "~/.agentvm")
  .action(async (_options) => {
    // TODO: Implement after core interfaces are defined
    console.log("AgentVM server not implemented yet - waiting for core interfaces");
    process.exit(1);
  });

program.parse();

import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { resolve } from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import { gzipSync } from "node:zlib";

const port = Number(process.env.BUNDLE_SERVER_PORT ?? 3187);
const baseURL = `http://127.0.0.1:${port}`;
const maxKbArgument = process.argv.find((argument) =>
  argument.startsWith("--max-kb="),
);
const maxKb = maxKbArgument
  ? Number(maxKbArgument.slice("--max-kb=".length))
  : undefined;

const server = spawn(
  process.execPath,
  [
    resolve("node_modules/next/dist/bin/next"),
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  { stdio: "ignore", env: process.env },
);

let browser;

try {
  let serverReady = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(
        `Next.js production server exited with ${server.exitCode}`,
      );
    }

    try {
      const response = await fetch(baseURL);
      if (response.ok) {
        serverReady = true;
        break;
      }
    } catch {}

    await delay(500);
  }

  if (!serverReady) {
    throw new Error(`Next.js production server did not start at ${baseURL}`);
  }

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const assets = new Map();
  const assetResponses = [];

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" && url.port === String(port)) {
      return route.continue();
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });

  page.on("response", (response) => {
    if (
      response.request().resourceType() !== "script" ||
      !response.url().includes("/_next/")
    ) {
      return;
    }

    assetResponses.push(
      response.body().then((body) => {
        assets.set(response.url(), body);
      }),
    );
  });

  await page.goto(baseURL, { waitUntil: "load" });
  await page.waitForTimeout(250);
  await Promise.all(assetResponses);

  const totalRawBytes = [...assets.values()].reduce(
    (total, body) => total + body.length,
    0,
  );
  const totalGzipBytes = [...assets.values()].reduce(
    (total, body) => total + gzipSync(body).length,
    0,
  );
  const totalKb = totalGzipBytes / 1000;

  console.log("Initial route JavaScript requested by Chromium:");
  console.log(`  Assets: ${assets.size}`);
  console.log(`  Raw: ${totalRawBytes} bytes`);
  console.log(`  Gzip: ${totalGzipBytes} bytes (${totalKb.toFixed(2)} kB)`);
  for (const [url, body] of assets) {
    console.log(`  ${gzipSync(body).length} gzip bytes  ${url}`);
  }

  if (maxKb !== undefined && totalKb >= maxKb) {
    throw new Error(`Initial JavaScript is over the ${maxKb} kB gzip limit.`);
  }
} finally {
  await browser?.close();
  server.kill();
}

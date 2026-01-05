// Browser configuration for Puppeteer
// Handles both local development and Vercel serverless environments

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { existsSync } from "fs";

// Check if running in Vercel serverless environment
const isVercel = !!process.env.VERCEL;

// Common Chrome paths for local development
const LOCAL_CHROME_PATHS = [
  // Windows Chrome paths
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe` : "",
  // Mac Chrome path
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  // Linux Chrome paths
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);

function findLocalChrome(): string | undefined {
  // First check environment variable
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  // Then check common paths
  for (const chromePath of LOCAL_CHROME_PATHS) {
    try {
      if (existsSync(chromePath)) {
        return chromePath;
      }
    } catch {
      // Continue to next path
    }
  }

  return undefined;
}

export async function launchBrowser() {
  if (isVercel) {
    // Production (Vercel serverless) - use @sparticuz/chromium
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    // Local development - use system Chrome
    const executablePath = findLocalChrome();

    if (!executablePath) {
      throw new Error(
        "Chrome not found for local development. " +
        "Please install Google Chrome or set the CHROME_PATH environment variable."
      );
    }

    return puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      defaultViewport: { width: 1920, height: 1080 },
      executablePath,
      headless: true,
    });
  }
}

export { puppeteer };

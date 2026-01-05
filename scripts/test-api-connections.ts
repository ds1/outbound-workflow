// API Connection Test Script
// Run with: npx tsx scripts/test-api-connections.ts

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local explicitly
config({ path: resolve(process.cwd(), ".env.local") });

interface TestResult {
  service: string;
  status: "pass" | "fail";
  message: string;
  details?: unknown;
}

const results: TestResult[] = [];

async function testClaude(): Promise<TestResult> {
  const service = "Claude (Anthropic)";
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 50,
      messages: [{ role: "user", content: "Say 'API test successful' in exactly 3 words." }],
    });

    const text = response.content[0];
    if (text.type === "text") {
      return {
        service,
        status: "pass",
        message: "Connected successfully",
        details: { response: text.text, model: response.model },
      };
    }
    return { service, status: "fail", message: "Unexpected response format" };
  } catch (err) {
    return {
      service,
      status: "fail",
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function testElevenLabs(): Promise<TestResult> {
  const service = "ElevenLabs";
  try {
    const { ElevenLabsClient } = await import("@elevenlabs/elevenlabs-js");
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

    const response = await client.voices.getAll();
    const voiceCount = response.voices.length;

    return {
      service,
      status: "pass",
      message: `Connected successfully - ${voiceCount} voices available`,
      details: {
        voiceCount,
        sampleVoices: response.voices.slice(0, 3).map((v) => v.name),
      },
    };
  } catch (err) {
    return {
      service,
      status: "fail",
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function testResend(): Promise<TestResult> {
  const service = "Resend";
  try {
    const { Resend } = await import("resend");
    const client = new Resend(process.env.RESEND_API_KEY);

    // Test by fetching domains (doesn't send email)
    const { data, error } = await client.domains.list();

    if (error) {
      return { service, status: "fail", message: error.message };
    }

    return {
      service,
      status: "pass",
      message: `Connected successfully - ${data?.data?.length || 0} domain(s) configured`,
      details: { domains: data?.data?.map((d) => d.name) || [] },
    };
  } catch (err) {
    return {
      service,
      status: "fail",
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function testSlybroadcast(): Promise<TestResult> {
  const service = "Slybroadcast";
  try {
    const email = process.env.SLYBROADCAST_EMAIL;
    const password = process.env.SLYBROADCAST_PASSWORD;

    if (!email || !password) {
      return { service, status: "fail", message: "Missing credentials in environment" };
    }

    const formData = new URLSearchParams();
    formData.append("c_uid", email);
    formData.append("c_password", password);

    const response = await fetch("https://www.mobile-sphere.com/gateway/vmb.aflist.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const text = await response.text();

    // Check for authentication error
    if (text.toLowerCase().includes("error") && text.toLowerCase().includes("auth")) {
      return { service, status: "fail", message: "Authentication failed" };
    }

    // Parse audio files
    const audioFiles = text
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.trim());

    return {
      service,
      status: "pass",
      message: `Connected successfully - ${audioFiles.length} audio file(s) found`,
      details: { audioFiles: audioFiles.slice(0, 5) },
    };
  } catch (err) {
    return {
      service,
      status: "fail",
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function runTests() {
  console.log("\n🔌 Testing API Connections...\n");
  console.log("─".repeat(60));

  // Run tests sequentially to avoid rate limits
  results.push(await testClaude());
  results.push(await testElevenLabs());
  results.push(await testResend());
  results.push(await testSlybroadcast());

  // Print results
  for (const result of results) {
    const icon = result.status === "pass" ? "✅" : "❌";
    console.log(`\n${icon} ${result.service}`);
    console.log(`   Status: ${result.status.toUpperCase()}`);
    console.log(`   ${result.message}`);
    if (result.details && result.status === "pass") {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2).split("\n").join("\n   ")}`);
    }
  }

  console.log("\n" + "─".repeat(60));

  // Summary
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;

  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed\n`);

  // Exit with error if any failed
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

import { KameleoonClient } from "@kameleoon/nodejs-sdk";
import { WorkerVisitorCodeManager } from "../src/visitorCodeManager";
import { WorkerEventSource } from "../src/eventSource";
import { WorkerRequester } from "../src/requester";

// Replace these placeholder value(s) with your Kameleoon credentials.
const SITE_CODE = "<siteCode>";
const FEATURE_KEY = "<featureKey>";

// Required by the SDK for authenticated configuration and tracking requests (TRACK_IN_WORKER == true).
const CLIENT_ID = "<clientID>";
const CLIENT_SECRET = "<clientSecret>";

// The recommended setup is to keep tracking disabled in the worker and send
// tracking events via Engine.js or JS/React SDK instead.
const TRACK_IN_WORKER = false;

// Cloudflare Worker isolates keep the SDK configuration they loaded at startup.
// Enable this only when you need isolates to pick up fresh configuration
// without waiting for the next isolate restart.
const ENABLE_DATAFILE_REFRESH = true;
const DATAFILE_UPDATE_INTERVAL_MINUTES = ENABLE_DATAFILE_REFRESH ? 1 : 60;

export default {
  async fetch(request, env, ctx): Promise<Response> {
    return handleRequest(request, ctx);
  },
} satisfies ExportedHandler<Env>;

// Reuse the SDK client across requests while the worker isolate stays alive.
let client: KameleoonClient;
let isInitialized = false;

async function handleRequest(request: Request, ctx: ExecutionContext) {
  // Create the SDK client once and keep the external integrations worker-safe.
  if (!client) {
    client = new KameleoonClient({
      siteCode: SITE_CODE,
      credentials: {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      },
      configuration: {
        updateInterval: DATAFILE_UPDATE_INTERVAL_MINUTES,
      },
      externals: {
        requester: new WorkerRequester(),
        eventSource: new WorkerEventSource(),
        visitorCodeManager: new WorkerVisitorCodeManager(),
      },
    });
  }

  // Initialize the client before using the methods
  if (!isInitialized) {
    isInitialized = await client.initialize();
  }

  const headers = new Headers();
  headers.set("Content-Type", "text/plain");

  // Read the visitor code from the incoming cookies or create one if needed.
  const visitorCode = client.getVisitorCode({
    input: request.headers,
    output: headers,
  });

  // Evaluate the visitor against every feature flag available to the SDK.
  const variation = client.getVariation({
    visitorCode,
    featureKey: FEATURE_KEY,
    track: TRACK_IN_WORKER,
  });

  // If worker-side tracking is enabled, flush events in the background so the
  // response is not blocked. The recommended approach is to track via Engine.js
  // instead and use the generated tracking code in your page or app.
  if (TRACK_IN_WORKER) {
    ctx.waitUntil(client.flushInstant(visitorCode));
  } else {
    const engineCode = client.getEngineTrackingCode(visitorCode);
    // Please follow the method description at:
    // https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk/#getenginetrackingcode
  }

  // Call `refreshDataFileIfStale()` only when you need isolates to pick up
  // fresh configuration without waiting for the next isolate restart.
  if (ENABLE_DATAFILE_REFRESH) {
    ctx.waitUntil(client.refreshDataFileIfStale());
  }

  // Redirect visitors in the "off" variation to a different destination.
  if (variation.key === "off") {
    const destinationUrl = "https://example.com";
    const statusCode = 301;

    return Response.redirect(destinationUrl, statusCode);
  }

  return new Response(
    "Welcome to Kameleoon Starter Kit!\n" +
      `My visitor code is: ${visitorCode}\n` +
      `My variation key is: ${variation.key}\n` +
      `My variation name is: ${variation.name}`,
    { status: 200, headers },
  );
}

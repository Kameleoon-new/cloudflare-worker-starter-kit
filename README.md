# Kameleoon + Cloudflare Worker Template

> Template to run Kameleoon Experimentation and Feature Flags on [Cloudflare Workers][1].

This starter kit uses the [Kameleoon NodeJS SDK][2] to evaluate experiments and feature flags at the edge with Cloudflare Workers.

## Contents

- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Examples](#examples)
- [Commands](#commands)
- [Technical details](#technical-details)
- [Additional resources](#additional-resources)

## Prerequisites

- [Cloudflare account][3].
- [Kameleoon account][4].

## Getting started

1. Clone the GitHub repository.

```sh
git clone https://github.com/Kameleoon/cloudflare-worker-starter-kit.git
```

2. Install dependencies.

```sh
npm install
```

3. Update the following values in `src/index.ts`:

- `SITE_CODE` - Site code from the [Kameleoon Platform][4].
- `CLIENT_ID` and `CLIENT_SECRET` - Client credentials from your [Kameleoon Profile][6].
- `TRACK_IN_WORKER` - Keep this as `false` unless you intentionally want the worker to send tracking events.
- `ENABLE_DATAFILE_REFRESH` - Enable this only when you need more aggressive SDK configuration refreshes.

4. Run the worker locally.

```sh
npm start
```

5. Deploy the worker to Cloudflare.

```sh
npm run deploy
```

If your Cloudflare login has access to multiple accounts, add an `account_id` to `wrangler.toml`. See [How to find `account_id`][5].

## Examples

The [`examples`](./examples) directory contains additional usage patterns. To try one, point `main` in `wrangler.toml` at the example file or copy the example logic into `src/index.ts` and keep imports relative to the destination file.

## Commands

- `npm start` - Start the worker.
- `npm run deploy` - Deploy the worker to Cloudflare.
- `npm test` - Run the Vitest test suite.
- `npm run cf-typegen` - Generate Cloudflare type definitions.

## Technical details

The core integration lives in `src/index.ts`. The worker initializes the SDK, resolves a visitor code from cookies, evaluates the current visitor against feature flags, and prints each feature flag key with its variation name.

There are also a few helper files that adapt the SDK to Cloudflare Workers:

- `src/eventSource.ts` - Reports unsupported [real-time update][10] connections as recoverable errors so the SDK can fall back to polling.
- `src/requester.ts` - Uses the Cloudflare Workers `fetch` API for SDK HTTP requests.
- `src/visitorCodeManager.ts` - Stores and reads the Kameleoon visitor code from cookies so the same visitor can be recognized across requests.

Error handling is intentionally minimal to keep the starter kit focused. In production, wrap SDK initialization and variation evaluation with proper error handling. See [SDK Error Handling][9].

## Additional resources

- [Cloudflare Workers](https://workers.cloudflare.com)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
- [Cloudflare Workers Tutorials](https://developers.cloudflare.com/workers/tutorials)
- [Kameleoon NodeJS SDK Documentation](https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk)

[1]: https://workers.cloudflare.com
[2]: https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk
[3]: https://dash.cloudflare.com/sign-up
[4]: https://app.kameleoon.com
[5]: https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/#find-account-id-workers-and-pages
[6]: https://app.kameleoon.com/users/dashboard
[7]: https://app.kameleoon.com/featureFlags/dashboard
[8]: https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk#:~:text=Default%20Value-,updateInterval,-(optional)
[9]: https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk#error-handling
[10]: https://developers.kameleoon.com/feature-management-and-experimentation/technical-considerations#streaming-premium-option

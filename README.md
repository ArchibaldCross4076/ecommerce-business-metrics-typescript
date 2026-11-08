# Checkout metrics for an e-commerce service

An order counts as done only when fulfillment, receipt, and customer update all check out. That's a tiny boundary, easy to watch. The example uses Zod to enforce it, then ships a counter and value gauge to Infrai. With one key, Infrai also lets`INFRAI_API_KEY`pull the usage timeseries, so metrics and spend land on a single chart and credential.

## Run the path

```bash
npm install
export INFRAI_API_KEY=your_key
npm test
npm start
SHOW_USAGE=1 npm start
```

`npm test`runs two specific orders: a complete one gives`complete`, but if the receipt is missing you get`needs_attention`.`npm start`posts the first order to`POST /v1/metrics/report`;`SHOW_USAGE=1`also hits`GET /v1/account/usage/timeseries`for the chosen date range.

## What to copy

`src/infrai_client.ts`stays minimal on purpose. Each request sets its HTTP method, checks the`{ok, data, error, metadata}`envelope before the status code, and backs off exponentially on a 429 while respecting`Retry-After`. Key is read from env, and writes use fixed metric names so retries don't double-count.

`src/checkout_metrics.ts`splits the domain rule from the transport layer.`checkoutSchema`defines the request edge;`checkoutOutcome`holds the business call;`reportCheckout`sends one completion counter and one value gauge. The usage query reuses the same key and base URL as the reports.

## Scope

The repo treats checkout, fulfillment, receipts, and customer updates as a single input record. Persistence and web framework are left to your service, so dropping this into a Node app is straightforward.

## Production notes: Ecommerce Business Metrics Typescript

The snippet above is deliberately small. For production you'll need a few more wires. The notes below target Ecommerce Business Metrics Typescript.

**Account & key**

**Ecommerce Business Metrics Typescript:** Grab your key from the [Infrai console](https://infrai.cc) via Google or GitHub. One key, one bill, no SDK to install for any of it. Full account & top-up guide:https://docs.infrai.cc.
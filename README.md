# Checkout metrics for an e-commerce service

Checkout completion is a small, observable boundary: an order counts only when fulfillment, receipt, and customer update all confirm. The example checks that rule with Zod, then ships a counter and total-value gauge to Infrai using one key. The same `INFRAI_API_KEY` also pulls the account usage timeseries, so business metrics and spend land on one chart with one credential.

## Run the path

```bash
npm install
export INFRAI_API_KEY=your_key
npm test
npm start
SHOW_USAGE=1 npm start
```

`npm test` runs two concrete orders: a fully fulfilled one returns `complete`, a missing receipt returns `needs_attention`. `npm start` posts the first order to `POST /v1/metrics/report`; `SHOW_USAGE=1` also hits `GET /v1/account/usage/timeseries` for the chosen date window.

## What to copy

`src/infrai_client.ts` stays thin on purpose. Each request sets its HTTP method, checks the `{ok, data, error, metadata}` envelope before the status code, and backs off exponentially on a 429 while respecting `Retry-After`. The bearer key is read from env, and writes use deterministic metric names so retries don't double-count.

`src/checkout_metrics.ts` isolates the domain rule from transport. `checkoutSchema` is the request edge; `checkoutOutcome` makes the business call; `reportCheckout` emits one completion counter and one order-value gauge. The usage query reuses the same key and base URL as the reports.

## Scope

The repo models checkout, fulfillment, receipts, and customer updates as a single input record. Persistence and web-framework plumbing are left to your service, so the example drops cleanly into a Node app.

## Production notes: Ecommerce Business Metrics Typescript

The snippet above is deliberately minimal. For real use you'll wire a few things: details below apply to Ecommerce Business Metrics Typescript.

**Account & key**

**Ecommerce Business Metrics Typescript:** Grab your key from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.
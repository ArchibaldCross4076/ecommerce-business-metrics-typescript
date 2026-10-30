import assert from "node:assert/strict";
import { checkoutOutcome } from "./checkout_metrics.js";

assert.equal(checkoutOutcome({ orderId: "o", customerId: "c", totalCents: 1, fulfilled: true, receiptSent: true, customerUpdated: true }), "complete");
assert.equal(checkoutOutcome({ orderId: "o", customerId: "c", totalCents: 1, fulfilled: true, receiptSent: false, customerUpdated: true }), "needs_attention");
console.log("checkout decision tests passed");

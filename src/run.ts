import { reportCheckout, usageChartWindow } from "./checkout_metrics.js";

const result = await reportCheckout({ orderId: "ord_1001", customerId: "cus_42", totalCents: 12900, fulfilled: true, receiptSent: true, customerUpdated: true });
console.log(result);
if (process.env.SHOW_USAGE === "1") console.log(await usageChartWindow("2026-01-01", "2026-01-31"));

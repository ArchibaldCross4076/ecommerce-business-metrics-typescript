import { z } from "zod";
import { infrai } from "./infrai_client.js";

export const checkoutSchema = z.object({
  orderId: z.string().min(1), customerId: z.string().min(1), totalCents: z.number().int().nonnegative(),
  fulfilled: z.boolean(), receiptSent: z.boolean(), customerUpdated: z.boolean()
});
export type Checkout = z.infer<typeof checkoutSchema>;

export function checkoutOutcome(input: Checkout): "complete" | "needs_attention" {
  return input.fulfilled && input.receiptSent && input.customerUpdated ? "complete" : "needs_attention";
}

export async function reportCheckout(input: unknown): Promise<{ orderId: string; outcome: string }> {
  const order = checkoutSchema.parse(input);
  const outcome = checkoutOutcome(order);
  await infrai.metrics.report({ type: "counter", name: "ecommerce.checkout.completed", value: outcome === "complete" ? 1 : 0, tags: { outcome } });
  await infrai.metrics.report({ type: "gauge", name: "ecommerce.order.total_cents", value: order.totalCents, tags: { outcome } });
  return { orderId: order.orderId, outcome };
}

export async function usageChartWindow(from: string, to: string): Promise<unknown> {
  const query = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  return infrai.account.usage.timeseries(query);
}

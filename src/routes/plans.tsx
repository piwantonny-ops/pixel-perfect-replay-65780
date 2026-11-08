import { createFileRoute } from "@tanstack/react-router";
import { PlansPage } from "@/components/site/PlansPage";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Subscription Plans — VJEMMA MOVIES" },
      { name: "description", content: "Watch all VIP VJ Emma movies from UGX 2,000 a day. Pay with MTN MoMo or Airtel Money." },
      { property: "og:title", content: "Subscription Plans — VJEMMA MOVIES" },
      { property: "og:description", content: "Watch all VIP VJ Emma movies from UGX 2,000 a day." },
    ],
  }),
  component: PlansPage,
});


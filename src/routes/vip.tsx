import { createFileRoute } from "@tanstack/react-router";
import { PlansPage } from "@/components/site/PlansPage";
export const Route = createFileRoute("/vip")({
 head: () => ({ meta: [
  { title: "VIP with MTN MoMo — VJEMMA MOVIES" },
  { name: "description", content: "VJ Emma Luo movies for Obangaber Cinema Club. Get VIP with MTN MoMo from UGX 2,000." },
  { property: "og:title", content: "VIP with MTN MoMo — VJEMMA MOVIES" },
  { property: "og:description", content: "Daily, weekly and monthly VIP plans for VJ Emma movies." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }
 ] }), component: PlansPage,
});

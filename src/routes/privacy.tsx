import { createFileRoute } from "@tanstack/react-router";
import { TextPage } from "@/components/site/Layout";


export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Privacy Policy — VJEMMA MOVIES" },
      { name: "description", content: "How VJEMMA MOVIES handles your data." },
      { property: "og:title", content: "Privacy Policy — VJEMMA MOVIES" },
      { property: "og:description", content: "How VJEMMA MOVIES handles your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {

  return (
    <TextPage title="Privacy Policy">
      <p>We store your name, phone number and payment history only to run your account and subscription. We never sell your information.</p><p>Payments are processed by Pesapal or confirmed manually by our team. Contact us on WhatsApp to delete your account.</p>
    </TextPage>
  );
}

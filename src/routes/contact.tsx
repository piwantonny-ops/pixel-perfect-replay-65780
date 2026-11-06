import { createFileRoute } from "@tanstack/react-router";
import { TextPage, waLink } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { useDB } from "@/lib/store";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Contact — VJEMMA MOVIES" },
      { name: "description", content: "Contact VJEMMA MOVIES on WhatsApp." },
      { property: "og:title", content: "Contact — VJEMMA MOVIES" },
      { property: "og:description", content: "Contact VJEMMA MOVIES on WhatsApp." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { settings } = useDB();
  return (
    <TextPage title="Contact">
      <p>Reach us on WhatsApp for payments, requests and support.</p><div className="flex flex-wrap gap-3">{[settings.whatsapp, settings.whatsapp2].filter(Boolean).map((phone, i) => <Button key={phone} asChild variant="success"><a href={waLink(phone)} target="_blank" rel="noreferrer">WhatsApp {i + 1}: {phone}</a></Button>)}</div>
    </TextPage>
  );
}

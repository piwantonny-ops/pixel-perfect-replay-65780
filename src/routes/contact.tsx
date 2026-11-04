import { createFileRoute } from "@tanstack/react-router";
import { TextPage } from "@/components/site/Layout";
import { useDB } from "@/lib/store";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
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
      <p>Reach us any time on WhatsApp for payments, requests and support.</p><a className="inline-block rounded-full bg-success px-5 py-2 font-semibold text-success-foreground" href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">Chat on WhatsApp +{settings.whatsapp}</a>
    </TextPage>
  );
}

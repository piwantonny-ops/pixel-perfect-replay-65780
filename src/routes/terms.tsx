import { createFileRoute } from "@tanstack/react-router";
import { TextPage } from "@/components/site/Layout";


export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Terms of Use — VJEMMA MOVIES" },
      { name: "description", content: "Terms of use for VJEMMA MOVIES." },
      { property: "og:title", content: "Terms of Use — VJEMMA MOVIES" },
      { property: "og:description", content: "Terms of use for VJEMMA MOVIES." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {

  return (
    <TextPage title="Terms of Use">
      <p>By using VJEMMA MOVIES you agree to use the service for personal viewing only. Subscriptions give access to VIP titles for the period paid and are not refundable once activated.</p><p>Sharing accounts or redistributing content is not allowed and may lead to the account being blocked.</p>
    </TextPage>
  );
}

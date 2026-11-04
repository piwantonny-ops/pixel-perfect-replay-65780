import { createFileRoute } from "@tanstack/react-router";
import { TextPage } from "@/components/site/Layout";


export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — VJEMMA MOVIES" },
      { name: "description", content: "About VJEMMA MOVIES and VJ Emma." },
      { property: "og:title", content: "About Us — VJEMMA MOVIES" },
      { property: "og:description", content: "About VJEMMA MOVIES and VJ Emma." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {

  return (
    <TextPage title="About Us">
      <p>VJEMMA MOVIES brings you the best Hollywood, Nigerian, Indian and Asian movies translated by VJ Emma. New titles are added every week.</p><p>Watch free movies anytime, or unlock all VIP titles with an affordable daily, weekly or monthly plan paid by MTN MoMo or Airtel Money.</p>
    </TextPage>
  );
}

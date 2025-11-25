import { Support } from "@/components/support";
import { SupportView } from "@/components/support/support-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Midday",
};

export default async function Page() {
  return (
    <Support>
      <SupportView />
    </Support>
  );
}

import type { Locale } from "@/i18n/config";
import { MdPage, mdMetadata } from "@/components/MdPage";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P) {
  return mdMetadata("privacy", (await params).locale as Locale);
}
export default async function Page({ params }: P) {
  return <MdPage name="privacy" locale={(await params).locale as Locale} legal />;
}

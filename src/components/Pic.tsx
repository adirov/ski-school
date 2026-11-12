import Image from "next/image";
import { img } from "@/lib/content";
import { BASE_PATH } from "@/lib/env";
import type { Locale } from "@/i18n/config";

type Props = { id: string; locale: Locale; sizes: string; priority?: boolean; className?: string; decorative?: boolean; /** Used when the image has no alt in media.json (admin uploads). */ alt?: string };

/** Image from content/media.json (or an uploaded /images/... path) with localized alt, responsive srcset and lazy loading unless `priority`. */
export function Pic({ id, locale, sizes, priority, className, decorative, alt }: Props) {
  const m = img(id);
  return (
    <Image
      src={BASE_PATH + m.src}
      width={m.width}
      height={m.height}
      alt={decorative ? "" : m.alt[locale] ?? m.alt.ru ?? alt ?? ""}
      sizes={sizes}
      quality={80}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      className={className}
    />
  );
}

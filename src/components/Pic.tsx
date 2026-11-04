import Image from "next/image";
import { img } from "@/lib/content";
import { BASE_PATH } from "@/lib/env";
import type { Locale } from "@/i18n/config";

type Props = { id: string; locale: Locale; sizes: string; priority?: boolean; className?: string; decorative?: boolean };

/** Image from content/media.json with localized alt, responsive srcset and lazy loading unless `priority`. */
export function Pic({ id, locale, sizes, priority, className, decorative }: Props) {
  const m = img(id);
  return (
    <Image
      src={BASE_PATH + m.src}
      width={m.width}
      height={m.height}
      alt={decorative ? "" : m.alt[locale] ?? m.alt.ru ?? ""}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

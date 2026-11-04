/**
 * Image loader for the static (GitHub Pages) build, where there is no image server.
 * scripts/build-pages.mjs pre-renders every width in IMAGE_WIDTHS as WebP next to the original,
 * so the browser still gets a proper srcset and picks the right size for the screen.
 */
export default function staticImageLoader({ src, width }: { src: string; width: number }) {
  return src.replace(/\.(jpe?g|png|webp)$/i, `-${width}w.webp`);
}

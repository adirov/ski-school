/** Trusted HTML rendered from our own Markdown content at build time. */
export function Prose({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`prose ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

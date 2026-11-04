import { IS_PREVIEW } from "@/lib/env";

/** Development-only marker. Never renders in production mode. */
export function Badge({ kind, children }: { kind: "demo" | "draft" | "todo"; children: React.ReactNode }) {
  if (!IS_PREVIEW) return null;
  return <span className={`badge badge--${kind}`}>{children}</span>;
}

/** Inline TODO note for missing owner data (preview only). */
export function Todo({ children }: { children: React.ReactNode }) {
  if (!IS_PREVIEW) return null;
  return (
    <span className="todo">
      <b>TODO</b> {children}
    </span>
  );
}

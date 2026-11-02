import { useMemo, useState } from "react";
import { mediaCandidates } from "../lib/media";

/**
 * <img> that walks a list of candidate URLs (or a local fallback) before
 * giving up. Uploaded paths can live under /storage, /storage/uploads or the
 * origin root depending on the backend version, so we try each in turn.
 */
export default function MediaImage({
  path,
  fallback,
  alt = "",
  className,
  loading = "lazy",
  ...rest
}) {
  const candidates = useMemo(() => {
    const list = mediaCandidates(path);
    if (list.length) return list;
    return fallback ? [fallback] : [];
  }, [path, fallback]);

  // Keyed by path so a new image always starts from its first candidate,
  // without an effect.
  const [state, setState] = useState({ path, index: 0 });
  const index = state.path === path ? state.index : 0;

  const src = candidates[index] || (typeof fallback === "string" ? fallback : "");

  if (!src) return null;

  const isFinal = index >= candidates.length - 1;

  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={(event) => {
        if (isFinal) {
          event.currentTarget.onerror = null;
          if (typeof fallback === "string") event.currentTarget.src = fallback;
          return;
        }
        setState({ path, index: index + 1 });
      }}
    />
  );
}

/* ============================================================
   Local drafts for multi-step forms.

   A half-filled application should survive a reload, a dropped
   connection, or a logout, so the visitor never retypes what they
   already gave us. Drafts are namespaced, versioned and cleared as
   soon as the real submission succeeds.

   Never store passwords or payment details here.
   ============================================================ */

const PREFIX = "th:draft:";
const VERSION = 1;

const storage = () => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};

export function draftKey(name) {
  return `${PREFIX}${name}`;
}

/**
 * @param {string} name
 * @returns {{ data: object, savedAt: number|null, version: number }|null}
 */
export function loadDraft(name) {
  const store = storage();
  if (!store) return null;

  try {
    const raw = store.getItem(draftKey(name));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== VERSION || typeof parsed.data !== "object") {
      store.removeItem(draftKey(name));
      return null;
    }

    return {
      data: parsed.data || {},
      savedAt: Number(parsed.savedAt) || null,
      version: parsed.version,
    };
  } catch {
    return null;
  }
}

export function saveDraft(name, data) {
  const store = storage();
  if (!store || !data || typeof data !== "object") return;

  try {
    store.setItem(
      draftKey(name),
      JSON.stringify({ version: VERSION, savedAt: Date.now(), data })
    );
  } catch {
    /* quota full or private mode – drafts are a convenience, not a requirement */
  }
}

export function clearDraft(name) {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(draftKey(name));
  } catch {
    /* ignore */
  }
}

/** Friendly "saved 4 minutes ago" label. */
export function formatSavedAt(savedAt) {
  if (!savedAt) return null;

  const seconds = Math.max(0, Math.round((Date.now() - savedAt) / 1000));
  if (seconds < 45) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

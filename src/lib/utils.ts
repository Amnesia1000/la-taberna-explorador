export function formatOthersDescription(raw?: string | null): string {
  if (!raw || !raw.trim()) return "";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter(
        (item) => item && typeof item === "object" && item.name && String(item.name).trim() !== ""
      );
      if (valid.length === 0) return "";
      return valid
        .map((item) => `${item.quantity || 1}x ${item.name}`)
        .join(", ");
    }
  } catch (e) {
    if (raw.trim() !== "[]" && raw.trim() !== "{}") {
      return raw;
    }
  }
  return "";
}

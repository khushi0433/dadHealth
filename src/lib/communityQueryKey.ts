/** Single source of truth for the feed query key — must match everywhere we read/write cache. */
export function communityQueryKey(userId?: string) {
  return ["community", userId ?? "guest"] as const;
}

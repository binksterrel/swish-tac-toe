/** Accounts created earlier stored a generated letter avatar: treat it as "no avatar". */
export function usableAvatar(url?: string | null): string | undefined {
  if (!url || url.includes("dicebear.com")) return undefined
  return url
}

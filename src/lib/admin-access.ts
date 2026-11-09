export const ADMIN_EMAIL = "piwantonny@gmail.com";
export function isAdminIdentity(email: string | undefined, role: string | undefined): boolean {
  return email?.toLowerCase() === ADMIN_EMAIL && role === "admin";
}
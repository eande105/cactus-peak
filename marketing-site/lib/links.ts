// The member web app (separate Next.js app in ../web-app). Set NEXT_PUBLIC_MEMBER_APP_URL per environment.
export const MEMBER_APP_URL = (
  process.env.NEXT_PUBLIC_MEMBER_APP_URL ?? "http://localhost:3200"
).replace(/\/$/, "")
export const MEMBER_SIGN_IN_URL = `${MEMBER_APP_URL}/sign-in`

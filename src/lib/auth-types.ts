// The flat shape the rest of the UI works with -- mirrors fetchProfile()'s
// return value in the old app.js, built from auth.users + the profiles row.
export interface DiverProfile {
  id: string;
  email: string;
  name: string;
  cert: string;
  location: string;
  bio: string;
  avatar: string;
  dives: number;
  max_depth: string;
  corals: number;
  last_daily_claim: string | null;
  account_type: string;
  is_admin: boolean;
}

export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80";

// Same demo credentials the old site's "Try Demo Account" button filled in.
export const DEMO_ACCOUNT = { email: "joel@uidive.com", password: "demo1234" };

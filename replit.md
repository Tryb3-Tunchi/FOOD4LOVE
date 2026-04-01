# Food4Love

A Tinder-style food matching app. Buyers swipe on cooks who visit them and cook at their place. Built with React + TypeScript + Vite + Supabase.

## Concept

- **Buyers**: Swipe on cooks, like ones they want to visit them
- **Cooks**: Receive like requests, accept or decline, come cook at the buyer's place
- Matching happens when both sides express interest

## Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router DOM v7
- **Backend/DB**: Supabase (external) — Auth, Postgres, Edge Functions
- **Maps**: Leaflet
- **Styling**: Tailwind CSS with PostCSS

## Project Structure

```
src/
  pages/         Route-level page components (SwipePage, AdminPage, etc.)
  components/    Shared UI components (Button, Card, Icons)
  hooks/         Custom React hooks (useAuth, useSwipe, useChat, useMatch, useTheme, useStreak, useStories)
  lib/           Utility modules (supabase client, media helpers)
  providers/     React context providers (AuthProvider, ThemeProvider)
  types/         TypeScript type definitions (db.ts)
supabase/
  functions/     Edge Functions (admin-seed, groq-bot)
  schema.sql     Database schema
```

## Key Features

- Tinder-style swipe card UI with photo galleries
- Tinder/Bumble-style Discovery Settings filter panel (bottom sheet)
  - Role filter: Cooks / Everyone / Buyers
  - Distance slider: 1–40km
  - Age range sliders: 18–60
  - Budget slider: ₦1,000–₦99,000
- End-of-deck message when all profiles have been swiped
- Admin panel (admin-only) with bot creation (choose cook/buyer role + count)
- Bot profiles with real photos (face + food photos)
- Chat via Supabase realtime

## Environment Variables

Required (set in Replit Secrets):
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

## Admin Access

- The Admin tab only shows for users with `is_admin = true` in their profile
- Regular signups never see it
- Admin can create bot profiles specifying cook or buyer role

## Development

```bash
npm run dev    # Start dev server on port 5000
npm run build  # Production build to dist/
```

## Deployment

Configured as a static site:
- Build: `npm run build`
- Serve from: `dist/`

## New Features Added (Latest)

### Cook Features
- **Today's Special**: Cooks can post a daily special (dish + price, up to 80 chars) from their Profile tab. It shows as an amber badge on their swipe card, visible to all buyers. Auto-expires at midnight.
- **Available for Parties**: Toggle in Profile tab for cooks. Shows as a badge on their info sheet. Buyers can filter by this in Discover.

### Buyer Features
- **Available for Parties filter**: Toggle in the Discover filter panel to show only cooks available for party catering.

### Sharing & Growth
- **WhatsApp Share on cook profiles**: Share any cook's profile link directly from the info drawer. Opens a shareable `/cook/:id` public page.
- **Public cook profile page** (`/cook/:id`): Works without login. Shows cook photos, specialty, price, bio. Has "Match with me on Food4Love" CTA + WhatsApp share.
- **Referral Code**: Every user gets a unique referral code shown on their Profile page with a "Share invite on WhatsApp" button.

### Presence
- **Online status**: Shows in the profile info drawer only (green/amber dot). Updates `last_seen_at` silently on app load.

### Schema additions
- `profiles.available_for_parties` boolean NOT NULL DEFAULT false
- `profiles.last_seen_at` timestamptz
- `profiles.referral_code` text
- `profiles.daily_special` text
- `profiles.daily_special_until` timestamptz
- RLS policy for anon reads on profiles (for public cook page)

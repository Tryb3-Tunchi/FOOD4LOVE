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

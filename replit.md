# Food4Love

A React + TypeScript + Vite single-page application with Supabase backend integration.

## Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend/DB**: Supabase (external) — requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars
- **Routing**: React Router DOM v7
- **Maps**: Leaflet
- **Styling**: Tailwind CSS with PostCSS

## Project Structure

- `src/pages/` — Route-level page components
- `src/components/` — Shared UI components
- `src/hooks/` — Custom React hooks (auth, chat, match, swipe, theme)
- `src/lib/` — Utility modules (supabase client, media helpers)
- `src/providers/` — React context providers
- `src/types/` — TypeScript type definitions
- `supabase/` — Supabase schema SQL and edge functions

## Environment Variables

Required for Supabase connectivity:
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon/public key

## Development

```bash
npm run dev    # Start dev server on port 5000
npm run build  # Production build to dist/
```

## Deployment

Configured as a static site deployment:
- Build command: `npm run build`
- Public directory: `dist`

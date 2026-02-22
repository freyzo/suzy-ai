# Suzy AI

Real-time AI companion with Live2D avatar, voice conversation, and emotion-aware animation.

Live demo: `https://suzy-ai.vercel.app/`  
Repo: `https://github.com/freyzo/suzy-ai`

## Preview

![Suzy AI Social Preview](https://opengraph.githubassets.com/1/freyzo/suzy-ai)

## Why This Project

I built Suzy as a safe, non-judgmental companion for people who feel lonely, socially awkward, or misunderstood.  
Goal: let users talk naturally in any language and feel emotionally supported.

Context:
- CDC (2023): about 1 in 36 children in the U.S. are identified with autism.
- WHO: about 1 in 100 children globally are autistic.
- NIMH: about 7.1% of U.S. adults had social anxiety disorder in the past year.

Sources:
- https://www.cdc.gov/media/releases/2023/p0323-autism.html
- https://www.who.int/news-room/fact-sheets/detail/autism-spectrum-disorders
- https://www.nimh.nih.gov/health/statistics/social-anxiety-disorder

## Standout Features

- Real-time voice chat using ElevenLabs conversational API.
- Live2D character rendering with lip-sync, gaze tracking, and idle animations.
- Emotion + gesture driven visual feedback during conversation.
- Companion-style UX: onboarding profile, daily mood check-in, continue-chat flow.
- Responsive UI optimized for desktop and mobile.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- PixiJS + pixi-live2d-display
- ElevenLabs (voice)
- Supabase Edge Functions (session token backend)
- Vercel (deployment)

## Architecture (Essential)

- `src/pages/Index.tsx`: main conversation and UI orchestration
- `src/components/Live2D/*`: avatar rendering and animation pipeline
- `src/components/CharacterDisplay.tsx`: model switching + loading/fallback behavior
- `supabase/functions/elevenlabs-session/index.ts`: signed session URL generation

## Quick Run

```bash
npm install
npm run dev
```

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

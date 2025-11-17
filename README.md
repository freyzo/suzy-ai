# Suzy AI

An interactive Live2D character experience featuring real-time voice conversation powered by ElevenLabs. Suzy is a responsive web application that brings an animated character to life with natural speech interaction, eye tracking, and expressive animations.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Table of Contents

- [Suzy AI](#suzy-ai)
  - [📋 Table of Contents](#-table-of-contents)
  - [About The Project](#about-the-project)
    - [Built With](#built-with)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
  - [Usage](#usage)
    - [Key Features](#key-features)
    - [Example Usage](#example-usage)
  - [Project Structure](#project-structure)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
    - [Development Guidelines](#development-guidelines)
  - [License](#license)
  - [Contact](#contact)
  - [Acknowledgments](#acknowledgments)

## About The Project

Suzy AI is an immersive web experience that combines Live2D character animation with AI-powered voice conversation. Users can interact with an animated character through natural speech, with real-time lip-sync, eye tracking, and responsive animations that make the interaction feel alive.

The project features:
- **Live2D Character Rendering**: Smooth, expressive 2D character animations using PixiJS
- **Voice Conversation**: Real-time bidirectional voice interaction via ElevenLabs
- **Responsive Design**: Optimized for mobile, tablet, and desktop with touch-friendly controls
- **Interactive Features**: Character customization, hair color changes, and dynamic animations

### Built With

- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [PixiJS](https://pixijs.com/) - WebGL rendering engine
- [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display) - Live2D model rendering
- [ElevenLabs](https://elevenlabs.io/) - Voice AI and conversation API
- [Supabase](https://supabase.com/) - Backend and serverless functions
- [React Router](https://reactrouter.com/) - Client-side routing
- [shadcn/ui](https://ui.shadcn.com/) - UI component library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun
- Git
- Supabase account (for backend functions)
- ElevenLabs API key (for voice features)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/suzy-ai.git
   ```

2. Navigate to the project directory
   ```bash
   cd suzy-ai
   ```

3. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

4. Set up environment variables (see [Environment Variables](#environment-variables))

5. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You'll also need to configure your Supabase Edge Function for ElevenLabs integration. See `supabase/functions/elevenlabs-session/index.ts` for the serverless function implementation.

## Usage

### Key Features

- **Voice Interaction**: Click the microphone button to start a conversation with Suzy. The character responds with natural speech and animated lip-sync.

- **Character Customization**: Click on the character to cycle through different hair colors (original, platinum-blonde, blonde, brown, black, red, pink, blue, purple, green).

- **Eye Tracking**: The character's eyes follow your mouse cursor (or touch position on mobile) for a more engaging experience.

- **Responsive Design**: 
  - **Mobile**: Optimized touch targets (48px minimum) for easy interaction with greasy fingers
  - **Tablet**: Medium-sized controls with adjusted spacing
  - **Desktop**: Full-featured experience with larger controls

- **Visual Feedback**: 
  - Voice orb indicates conversation state (listening, speaking, ready)
  - Microphone button shows connection status
  - Smooth animations and transitions throughout

### Example Usage

```typescript
// The main conversation flow is handled automatically
// Users simply click the microphone button to start/stop conversations

// Character customization happens via click on the character
// The component handles hair color cycling internally
```

## Project Structure

```
suzy-ai/
├── public/
│   ├── assets/
│   │   ├── js/                    # Live2D SDK
│   │   └── live2d/
│   │       └── models/            # Live2D model files
│   └── ...
├── src/
│   ├── components/
│   │   ├── backgrounds/           # Animated background components
│   │   ├── Live2D/                # Live2D rendering components
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── CharacterDisplay.tsx   # Main character display
│   │   ├── MicrophoneButton.tsx   # Voice control button
│   │   └── VoiceOrb.tsx          # Voice status indicator
│   ├── hooks/
│   │   └── use-mobile.tsx         # Responsive breakpoint hooks
│   ├── integrations/
│   │   └── supabase/              # Supabase client setup
│   ├── pages/
│   │   └── Index.tsx              # Main page component
│   └── utils/
│       └── live2d-zip-loader.ts   # Live2D model loader
├── supabase/
│   └── functions/
│       └── elevenlabs-session/    # Serverless function for ElevenLabs
└── ...
```

## Roadmap

- [ ] Add multiple character models
- [ ] Implement character emotion system
- [ ] Add conversation history
- [ ] Implement gesture recognition
- [ ] Add character customization panel
- [ ] Support for custom Live2D models
- [ ] Add background music and sound effects
- [ ] Implement user preferences/settings
- [ ] Add keyboard shortcuts
- [ ] Performance optimizations for mobile devices

See the [open issues](https://github.com/yourusername/suzy-ai/issues) for a full list of proposed features (and known issues).

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure responsive design works on mobile, tablet, and desktop
- Maintain touch-friendly UI (minimum 44px touch targets)
- Test voice features with proper microphone permissions

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/suzy-ai](https://github.com/yourusername/suzy-ai)

## Acknowledgments

- [Live2D](https://www.live2d.com/) - Character animation technology
- [ElevenLabs](https://elevenlabs.io/) - Voice AI platform
- [Supabase](https://supabase.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [PixiJS](https://pixijs.com/) - WebGL rendering engine
- [Hiyori Model](https://www.live2d.com/) - Default character model
- [Shields.io](https://shields.io/) for badges
- [Choose an Open Source License](https://choosealicense.com/)

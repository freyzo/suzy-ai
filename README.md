# Suzy AI

An interactive AI character application featuring real-time voice conversation with Live2D animated avatars. Experience natural conversations with an AI assistant brought to life through expressive character animations, lip-sync, and responsive interactions.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple)](https://vitejs.dev/)

## 📋 Table of Contents

- [Suzy AI](#suzy-ai)
  - [📋 Table of Contents](#-table-of-contents)
  - [About The Project](#about-the-project)
    - [Built With](#built-with)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage](#usage)
    - [Key Features](#key-features)
  - [Screenshots](#screenshots)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)
  - [Acknowledgments](#acknowledgments)

## About The Project

Suzy AI is an immersive web application that combines cutting-edge AI voice technology with expressive Live2D character animations. Users can engage in natural conversations with an AI assistant, represented by an animated character that responds with realistic lip-sync, eye tracking, and dynamic expressions.

The project integrates ElevenLabs conversational AI for natural voice interactions, Live2D Cubism for character animation, and PixiJS for high-performance rendering. The character follows mouse movements, animates during speech, and provides visual feedback through an elegant voice interface.

### Built With

- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Live2D Cubism](https://www.live2d.com/) - Character animation
- [PixiJS](https://pixijs.com/) - WebGL rendering
- [ElevenLabs](https://elevenlabs.io/) - Voice AI and conversation
- [Supabase](https://supabase.com/) - Backend and serverless functions
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [React Router](https://reactrouter.com/) - Routing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm
- Git
- Supabase account (for backend services)
- ElevenLabs API key (for voice AI)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/suzy-ai.git
   cd suzy-ai
   ```

2. Navigate to the project directory
   ```bash
   cd suzy
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Set up Supabase
   - Create a new Supabase project
   - Copy your Supabase URL and anon key
   - Deploy the `elevenlabs-session` function in `supabase/functions/elevenlabs-session/`

5. Configure environment variables
   Create a `.env.local` file in the `suzy` directory:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. Run the development server
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

8. Allow microphone access when prompted to enable voice conversation

## Usage

1. **Start a Conversation**: Click the microphone button to begin a voice conversation with Suzy
2. **Interact Naturally**: Speak naturally - the AI will respond with voice and character animations
3. **Character Interaction**: The character follows your mouse movements and animates during speech
4. **End Conversation**: Click the microphone button again to end the session

### Key Features

- **Live2D Character Animation**: Expressive 2D character with realistic movements, eye tracking, and lip-sync
- **Real-time Voice Conversation**: Natural AI conversations powered by ElevenLabs conversational AI
- **Dynamic Lip-sync**: Character mouth movements sync with speech in real-time
- **Mouse Tracking**: Character eyes and head follow cursor movements for immersive interaction
- **Animated Backgrounds**: Beautiful particle effects and wave animations
- **Mobile Responsive**: Optimized experience for both desktop and mobile devices
- **Voice Visual Feedback**: Visual indicators show listening, speaking, and connection status

## Screenshots

![Suzy AI Interface](screenshot.png)

*Add screenshots of the application interface, character animations, and voice interaction features*

## Roadmap

Planned features and future improvements:

- [ ] Multiple character selection and customization
- [ ] Character emotion expressions based on conversation context
- [ ] Conversation history and memory
- [ ] Custom character model support
- [ ] Multi-language support
- [ ] Enhanced animation presets
- [ ] Character customization (hair color, outfits, etc.)
- [ ] Integration with additional AI providers

See the [open issues](https://github.com/yourusername/suzy-ai/issues) for a full list of proposed features (and known issues).

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/yourusername/suzy-ai](https://github.com/yourusername/suzy-ai)

## Acknowledgments

- [Live2D Cubism](https://www.live2d.com/) - Character animation technology
- [ElevenLabs](https://elevenlabs.io/) - Voice AI and conversation API
- [PixiJS](https://pixijs.com/) - High-performance WebGL rendering
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Shields.io](https://shields.io/) - Badge generation


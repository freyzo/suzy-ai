// Visual scene backgrounds with actual scenario elements
import { SceneType } from '@/utils/environment-types';

interface SceneBackgroundsProps {
  scene: SceneType;
  children?: React.ReactNode;
}

export default function SceneBackgrounds({ scene, children }: SceneBackgroundsProps) {
  const getSceneElements = () => {
    switch (scene) {
      case 'office':
        return (
          <>
            {/* Office window */}
            <div className="absolute top-0 right-0 w-1/3 h-1/2 opacity-30">
              <div className="w-full h-full bg-gradient-to-b from-blue-200 to-blue-300 rounded-bl-3xl" />
              <div className="absolute inset-0 grid grid-cols-2 gap-1 p-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white/20 rounded" />
                ))}
              </div>
            </div>
            {/* Office desk elements */}
            <div className="absolute bottom-0 left-0 w-1/4 h-1/3 opacity-20">
              <div className="w-full h-1/2 bg-gradient-to-t from-amber-800 to-amber-600 rounded-tr-3xl" />
            </div>
          </>
        );
      
      case 'cafe':
        return (
          <>
            {/* Cafe window */}
            <div className="absolute top-0 right-0 w-1/2 h-2/3 opacity-25">
              <div className="w-full h-full bg-gradient-to-b from-yellow-200 via-orange-200 to-amber-300 rounded-bl-3xl" />
              <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-300 rounded-full blur-sm" />
              <div className="absolute top-8 right-8 w-6 h-6 bg-orange-200 rounded-full blur-sm" />
            </div>
            {/* Coffee steam */}
            <div className="absolute bottom-1/4 left-1/4 w-16 h-32 opacity-30">
              <div className="w-2 h-full bg-gradient-to-t from-white/40 to-transparent rounded-full mx-auto animate-pulse" />
            </div>
          </>
        );
      
      case 'studio':
        return (
          <>
            {/* Studio lights */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0"
                style={{
                  left: `${20 + i * 30}%`,
                  width: '10%',
                  height: '20%',
                }}
              >
                <div className="w-full h-full bg-gradient-radial from-yellow-400/30 via-pink-400/20 to-transparent rounded-b-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1/2 bg-gradient-to-b from-gray-600 to-transparent" />
              </div>
            ))}
            {/* Studio floor pattern */}
            <div className="absolute bottom-0 left-0 right-0 h-1/4 opacity-10">
              <div className="w-full h-full bg-gradient-to-t from-gray-900 via-gray-800 to-transparent" />
              <div className="absolute inset-0 grid grid-cols-8 gap-px">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-full border-l border-white/5" />
                ))}
              </div>
            </div>
          </>
        );
      
      case 'nature':
        return (
          <>
            {/* Sun */}
            <div className="absolute top-10 right-10 w-32 h-32 opacity-40">
              <div className="w-full h-full bg-gradient-radial from-yellow-300 via-yellow-200 to-transparent rounded-full blur-xl" />
            </div>
            {/* Trees silhouette */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-30">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <path
                  d="M0,200 Q50,150 100,200 T200,200 T300,200 T400,200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-green-800"
                />
                {[50, 150, 250, 350].map((x) => (
                  <g key={x}>
                    <ellipse cx={x} cy={120} rx="30" ry="40" fill="currentColor" className="text-green-700" />
                    <ellipse cx={x} cy={100} rx="25" ry="35" fill="currentColor" className="text-green-600" />
                  </g>
                ))}
              </svg>
            </div>
            {/* Clouds */}
            {[20, 60, 80].map((x, i) => (
              <div
                key={i}
                className="absolute top-20 opacity-20"
                style={{ left: `${x}%` }}
              >
                <div className="w-24 h-12 bg-white rounded-full blur-md" />
              </div>
            ))}
          </>
        );
      
      case 'forest':
        return (
          <>
            {/* Forest trees */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3 opacity-40">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {[30, 80, 130, 180, 230, 280, 330, 370].map((x, i) => (
                  <g key={i}>
                    {/* Tree trunk */}
                    <rect x={x - 8} y={200} width="16" height="100" fill="#5d4037" />
                    {/* Tree crown */}
                    <ellipse cx={x} cy={180} rx={25 + i * 2} ry={35 + i * 3} fill="#2e7d32" />
                    <ellipse cx={x - 10} cy={170} rx={20} ry={30} fill="#388e3c" />
                    <ellipse cx={x + 10} cy={170} rx={20} ry={30} fill="#388e3c" />
                  </g>
                ))}
              </svg>
            </div>
            {/* Forest floor */}
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-green-900 via-green-800 to-transparent opacity-30" />
            {/* Sunlight rays */}
            <div className="absolute top-0 left-1/4 w-1 h-full opacity-10">
              <div className="w-full h-full bg-gradient-to-b from-yellow-200 via-transparent to-transparent" />
            </div>
          </>
        );
      
      case 'space':
        return (
          <>
            {/* Stars */}
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  opacity: Math.random() * 0.8 + 0.2,
                  animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                }}
              />
            ))}
            {/* Planets */}
            <div className="absolute top-20 right-20 w-24 h-24 opacity-30">
              <div className="w-full h-full bg-gradient-radial from-purple-400 via-purple-600 to-purple-800 rounded-full blur-sm" />
              <div className="absolute inset-2 bg-gradient-to-br from-purple-300/50 to-transparent rounded-full" />
            </div>
            <div className="absolute bottom-32 left-32 w-16 h-16 opacity-20">
              <div className="w-full h-full bg-gradient-radial from-blue-400 via-blue-600 to-blue-800 rounded-full blur-sm" />
            </div>
            {/* Nebula */}
            <div className="absolute top-1/3 right-1/4 w-64 h-64 opacity-15">
              <div className="w-full h-full bg-gradient-radial from-pink-400 via-purple-400 to-transparent rounded-full blur-3xl" />
            </div>
            <style>{`
              @keyframes twinkle {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 1; }
              }
            `}</style>
          </>
        );
      
      case 'ocean':
        return (
          <>
            {/* Ocean waves */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-40">
              <svg viewBox="0 0 400 150" className="w-full h-full">
                <path
                  d="M0,100 Q100,80 200,100 T400,100 L400,150 L0,150 Z"
                  fill="url(#oceanGradient)"
                />
                <path
                  d="M0,120 Q100,100 200,120 T400,120 L400,150 L0,150 Z"
                  fill="url(#oceanGradient2)"
                  opacity="0.7"
                />
                <defs>
                  <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e90ff" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#0066cc" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="oceanGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00bfff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#1e90ff" stopOpacity="0.7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Sun reflection */}
            <div className="absolute bottom-1/4 left-1/3 w-48 h-8 opacity-30">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-yellow-200 to-transparent rounded-full blur-lg" />
            </div>
            {/* Clouds */}
            {[15, 45, 75].map((x, i) => (
              <div
                key={i}
                className="absolute top-16 opacity-25"
                style={{ left: `${x}%` }}
              >
                <div className="w-32 h-16 bg-white rounded-full blur-xl" />
              </div>
            ))}
            {/* Seagulls */}
            {[20, 60, 80].map((x, i) => (
              <div
                key={i}
                className="absolute top-1/4 opacity-30"
                style={{ left: `${x}%`, animation: `fly ${10 + i * 2}s infinite linear` }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 4L8 8h2v4h4V8h2L12 4z" />
                </svg>
              </div>
            ))}
            <style>{`
              @keyframes fly {
                0% { transform: translateX(0) translateY(0); }
                25% { transform: translateX(20px) translateY(-10px); }
                50% { transform: translateX(40px) translateY(0); }
                75% { transform: translateX(20px) translateY(-10px); }
                100% { transform: translateX(0) translateY(0); }
              }
            `}</style>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {getSceneElements()}
      {children}
    </div>
  );
}


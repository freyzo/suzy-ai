interface ButterflyProps {
  size?: number;
  color?: 'purple' | 'orange' | 'white';
  delay?: number;
}

const Butterfly = ({ size = 24, color = 'purple', delay = 0 }: ButterflyProps) => {
  const colorClasses = {
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
    white: 'from-white to-gray-200',
  };

  return (
    <div
      className="absolute pointer-events-none animate-butterfly-fly"
      style={{
        animationDelay: `${delay}s`,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* Butterfly body */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-yellow-300 rounded-full z-10" />
      
      {/* Left wing - top */}
      <div
        className={`absolute left-0 top-0 w-2 h-3 bg-gradient-to-br ${colorClasses[color]} rounded-tl-full rounded-br-full animate-butterfly-flap-left`}
        style={{ transformOrigin: 'right center' }}
      />
      
      {/* Left wing - bottom */}
      <div
        className={`absolute left-0 top-3 w-2 h-2 bg-gradient-to-tr ${colorClasses[color]} rounded-bl-full rounded-tr-full animate-butterfly-flap-left`}
        style={{ 
          transformOrigin: 'right center',
          animationDelay: '0.1s',
        }}
      />
      
      {/* Right wing - top */}
      <div
        className={`absolute right-0 top-0 w-2 h-3 bg-gradient-to-bl ${colorClasses[color]} rounded-tr-full rounded-bl-full animate-butterfly-flap-right`}
        style={{ transformOrigin: 'left center' }}
      />
      
      {/* Right wing - bottom */}
      <div
        className={`absolute right-0 top-3 w-2 h-2 bg-gradient-to-tl ${colorClasses[color]} rounded-br-full rounded-tl-full animate-butterfly-flap-right`}
        style={{ 
          transformOrigin: 'left center',
          animationDelay: '0.1s',
        }}
      />
    </div>
  );
};

export default Butterfly;


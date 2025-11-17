import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={`mb-1 w-full gap-2 flex ${className || ''} max-md:gap-1`}>
      <div className="w-full">
        <div className="m-1 block max-h-[10lh] min-h-[1lh] rounded-lg bg-card/30 backdrop-blur-md p-2 text-lg text-foreground/90 outline-none border border-border/50 shadow-sm max-md:p-1.5 max-md:text-base">
          <span className="text-xl font-bold max-md:text-lg">Suzy</span>
        </div>
      </div>
      <Link
        className="m-1 block max-h-[10lh] min-h-[1lh] rounded-lg bg-card/30 backdrop-blur-md p-2 text-lg text-foreground/90 outline-none border border-border/50 shadow-sm hover:bg-card/40 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center max-md:p-1.5"
        to="/settings"
      >
        <Settings className="h-5 w-5 max-md:h-4 max-md:w-4" />
      </Link>
    </header>
  );
}


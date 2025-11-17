import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={`mb-1 w-full gap-2 flex ${className || ''}`}>
      <div className="w-full">
        <div className="m-1 block max-h-[10lh] min-h-[1lh] rounded-lg bg-card/30 backdrop-blur-md p-2 text-lg text-foreground/90 outline-none border border-border/50 shadow-sm">
          <span className="text-xl font-bold">Suzy</span>
        </div>
      </div>
      <Link
        className="m-1 block max-h-[10lh] min-h-[1lh] rounded-lg bg-card/30 backdrop-blur-md p-2 text-lg text-foreground/90 outline-none border border-border/50 shadow-sm hover:bg-card/40 transition-colors"
        to="/settings"
      >
        <Settings className="h-5 w-5" />
      </Link>
    </header>
  );
}


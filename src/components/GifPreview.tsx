import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface GifPreviewProps {
  gifPath?: string;
  className?: string;
}

export default function GifPreview({ 
  gifPath = '/make-gif-small.gif',
  className = '' 
}: GifPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`relative overflow-hidden p-0 h-auto ${className}`}
        >
          <img
            src={gifPath}
            alt="Suzy AI Preview"
            className="w-full h-full object-cover rounded"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center rounded">
            <span className="text-white text-xs font-medium opacity-0 hover:opacity-100 transition-opacity px-2 py-1 bg-black/50 rounded">
              Preview
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <img
            src={gifPath}
            alt="Suzy AI Preview"
            className="w-full h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


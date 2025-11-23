import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useScreenshot() {
  const { toast } = useToast();

  const takeScreenshot = useCallback(async (filename?: string) => {
    try {
      // Use the Screen Capture API if available
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = filename || `suzy-ai-screenshot-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  toast({
                    title: 'Screenshot saved',
                    description: `Saved as ${link.download}`,
                  });
                }
                stream.getTracks().forEach(track => track.stop());
                resolve(null);
              }, 'image/png');
            }
          };
        });
      } else {
        // Fallback: Use canvas to capture visible content
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw a simple representation
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#fff';
          ctx.font = '24px Arial';
          ctx.fillText('Screenshot', 50, 50);
          ctx.fillText('Use browser screenshot tools (Cmd+Shift+4 on Mac)', 50, 100);
          ctx.fillText('or install html2canvas library for full capture', 50, 150);

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename || `suzy-ai-screenshot-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        }
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      toast({
        title: 'Error',
        description: 'Failed to take screenshot. Try using browser screenshot tools.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return { takeScreenshot };
}


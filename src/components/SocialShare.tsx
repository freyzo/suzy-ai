import { Share2, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { shareToSocial, shareToTwitter, shareToFacebook, shareToLinkedIn } from '@/utils/social-sharing';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function SocialShare() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: 'native' | 'twitter' | 'facebook' | 'linkedin' | 'copy') => {
    if (platform === 'native') {
      const success = await shareToSocial();
      if (!success) {
        // Fallback to copy
        handleShare('copy');
      }
    } else if (platform === 'twitter') {
      shareToTwitter();
    } else if (platform === 'facebook') {
      shareToFacebook();
    } else if (platform === 'linkedin') {
      shareToLinkedIn();
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast({
          title: 'Copied!',
          description: 'Link copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to copy link',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleShare('native')}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="mr-2 h-4 w-4" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')}>
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('copy')}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


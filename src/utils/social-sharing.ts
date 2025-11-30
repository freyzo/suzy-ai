// Social sharing utilities
export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  image?: string;
}

export async function shareToSocial(options: ShareOptions = {}) {
  const defaultOptions: ShareOptions = {
    title: 'Suzy AI - Interactive AI Companion',
    text: 'Check out Suzy AI, an immersive AI-powered character interaction platform!',
    url: window.location.href,
    image: `${window.location.origin}/make-gif-small.gif`,
  };

  const shareData = { ...defaultOptions, ...options };

  // Use Web Share API if available
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url,
      });
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return false;
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(shareData.url || window.location.href);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export function shareToTwitter(options: ShareOptions = {}) {
  const url = options.url || window.location.href;
  const text = options.text || 'Check out Suzy AI!';
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank', 'width=550,height=420');
}

export function shareToFacebook(options: ShareOptions = {}) {
  const url = options.url || window.location.href;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank', 'width=550,height=420');
}

export function shareToLinkedIn(options: ShareOptions = {}) {
  const url = options.url || window.location.href;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, '_blank', 'width=550,height=420');
}




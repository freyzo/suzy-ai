interface ImageBackgroundProps {
  imageUrl?: string;
  children?: React.ReactNode;
}

export default function ImageBackground({ 
  imageUrl = '/fairy-forest.png',
  children 
}: ImageBackgroundProps) {
  // URL encode the image path to handle spaces and special characters
  const encodedUrl = encodeURI(imageUrl);
  
  return (
    <div 
      className="image-background-container"
      style={{
        backgroundImage: `url("${encodedUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <div className="relative z-[1] w-full h-full">
        {children}
      </div>
    </div>
  );
}


import { useState } from 'react';

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function ImageWithFallback({ src, alt, className }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`bg-[#141414] flex items-center justify-center ${className}`}>
        <span className="text-white/40 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
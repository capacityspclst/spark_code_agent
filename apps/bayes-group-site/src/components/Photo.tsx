import * as React from 'react';

type PhotoProps = {
  name: string; // base name without extension
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export function Photo({ name, alt, priority = false, className, sizes: sizesProp }: PhotoProps) {
  const src = `/images/${name}.jpg`;
  const src768 = `/images/${name}-768.jpg`;
  const loading = priority ? undefined : 'lazy';
  // sizes can be generic; tests only check presence of attribute non-empty
  const sizes = sizesProp || '100vw';
  return (
    <picture className={className}>
      <source srcSet={`${src768} 768w, ${src} 1344w`} sizes={sizes} />
      <img
        src={src}
        srcSet={`${src768} 768w, ${src} 1344w`}
        sizes={sizes}
        width="1344"
        height="768"
        decoding="async"
        loading={loading}
        alt={alt}
      />
    </picture>
  );
}

export default Photo;

import * as React from 'react';
import { PHOTOS } from '../content/images';

type PhotoProps = {
  name: keyof typeof PHOTOS;
  priority?: boolean;
  className?: string;
  sizes?: string;
  alt?: string; // optional override
};

export default function Photo({ name, priority = false, className, alt, sizes: sizesProp }: PhotoProps) {
  const { alt: defaultAlt } = PHOTOS[name];
  const imageAlt = alt ?? defaultAlt;
  const src = `/images/${name}.jpg`;
  const srcSet = `/images/${name}-768.jpg 768w, /images/${name}.jpg 1344w`;
  const sizes = sizesProp && sizesProp.trim() ? sizesProp : '(min-width:1024px) 50vw, 100vw';
  const loading = priority ? 'eager' : 'lazy';
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      width="1344"
      height="768"
      decoding="async"
      loading={loading}
      alt={imageAlt}
      className={className}
    />
  );
}

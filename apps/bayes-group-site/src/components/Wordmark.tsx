import * as React from 'react';
import { Link } from 'react-router-dom';

export function Wordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link
      to='/'
      aria-label='The Bayes Group home'
      className={onDark ? 'wordmark wordmark-dark' : 'wordmark'}
    >
      <svg
        width='28'
        height='20'
        viewBox='0 0 28 20'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        role='img'
        aria-label='The Bayes Group'
        focusable='false'
        className='wordmark-mark'
      >
        <path
          d='M1.5 18.5 C7 18.5, 9 2, 14 2 C19 2, 21 18.5, 26.5 18.5'
          stroke={onDark ? 'var(--color-accent-light)' : 'var(--color-accent)'}
          strokeWidth='2.5'
          strokeLinecap='round'
          fill='none'
        />
      </svg>
      <span className='wordmark-text' aria-hidden='true'>
        The Bayes Group
      </span>
    </Link>
  );
}

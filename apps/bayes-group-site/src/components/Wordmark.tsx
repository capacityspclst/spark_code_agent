import * as React from 'react';
import { Link } from 'react-router-dom';

export function Wordmark() {
  return (
    <Link to='/' aria-label='The Bayes Group home' className='wordmark'>
      <svg
        width='28'
        height='20'
        viewBox='0 0 28 20'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        role='img'
        aria-label='The Bayes Group'
        focusable='false'
        style={{ marginRight: '8px' }}
      >
        <path
          d='M2 10 C6 2, 22 2, 26 10'
          stroke='var(--color-accent)'
          strokeWidth='2.5'
          fill='none'
        />
      </svg>
      <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '20px' }}>
        The Bayes Group
      </span>
    </Link>
  );
}

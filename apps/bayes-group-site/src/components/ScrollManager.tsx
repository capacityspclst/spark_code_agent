import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollManager() {
  const location = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      // skip on initial load
      firstRender.current = false;
      return;
    }
    const { pathname, hash } = location;
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView();
      }
    } else {
      window.scrollTo(0, 0);
      const main = document.getElementById('main');
      if (main) {
        // focus without scrolling
        (main as HTMLElement).focus({ preventScroll: true });
      }
    }
  }, [location]);

  return null;
}

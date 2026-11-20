import { useEffect } from 'react';
import { getPageMeta } from '../seo';

export function useDocumentTitle(pathname: string) {
  useEffect(() => {
    const meta = getPageMeta(pathname);
    document.title = meta.title;
  }, [pathname]);
}

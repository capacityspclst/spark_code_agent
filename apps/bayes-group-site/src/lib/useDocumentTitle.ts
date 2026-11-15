import { useEffect } from 'react';
import { getPageTitle } from '../content/site';

export function useDocumentTitle(pathname: string) {
  useEffect(() => {
    document.title = getPageTitle(pathname);
  }, [pathname]);
}

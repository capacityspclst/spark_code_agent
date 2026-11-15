import * as React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);
  return (
    <div className="notfound-page">
      <h1>Page not found</h1>
      <p>The page you\'re looking for doesn\'t exist or has moved.</p>
      <Link to="/">Back to home</Link>
    </div>
  );
}

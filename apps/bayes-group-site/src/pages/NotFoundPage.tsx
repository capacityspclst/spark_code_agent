import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { BellCurveIllustration } from '../components/Motifs';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);
  return (
    <div className="notfound-page">
      <div className="container notfound-layout">
        <BellCurveIllustration className="notfound-art" />
        <p className="eyebrow">Error</p>
        <h1>Page not found</h1>
        <p className="lead">The page you're looking for doesn't exist or has moved.</p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">Back to home</Link>
          <Link to="/services" className="text-link">View services</Link>
        </div>
      </div>
    </div>
  );
}

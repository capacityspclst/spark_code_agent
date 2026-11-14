import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div>
    <h1>Page not found</h1>
    <p>Oops! The page you’re looking for doesn’t exist.</p>
    <Link to="/" className="button-primary">Return home</Link>
  </div>
);

export default NotFound;

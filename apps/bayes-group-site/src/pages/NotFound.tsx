import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  useEffect(() => {
    document.title = 'Page not found | The Bayes Group';
  }, []);

  return (
    <section>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Back to home</Link>
    </section>
  );
};

export default NotFound;

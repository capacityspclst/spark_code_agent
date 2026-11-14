import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Training from './pages/Training';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

const TitleManager: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    let title = 'The Bayes Group';
    switch (path) {
      case '/':
        title = 'The Bayes Group | Evidence-driven AI';
        break;
      case '/services':
        title = 'Services | The Bayes Group';
        break;
      case '/training':
        title = 'Training | The Bayes Group';
        break;
      case '/about':
        title = 'About | The Bayes Group';
        break;
      case '/contact':
        title = 'Contact | The Bayes Group';
        break;
      default:
        title = 'Page not found | The Bayes Group';
    }
    document.title = title;
  }, [location]);
  return null;
};

const App: React.FC = () => (
  <Router>
    <TitleManager />
    <Header />
    <main className="container" style={{ padding: 'var(--space-6) 0' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/training" element={<Training />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
  </Router>
);

export default App;

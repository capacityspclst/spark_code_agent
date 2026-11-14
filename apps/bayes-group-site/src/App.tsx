import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Training from './pages/Training';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

const ScrollToTop: React.FC = () => {
  if (typeof window !== 'undefined' && !(window as any).scrollTo) {
    (window as any).scrollTo = () => {};
  }
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <main>
      <Header />
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
    </>
  );
};

export default App;

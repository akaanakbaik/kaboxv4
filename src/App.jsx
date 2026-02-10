import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ApiDocs from './pages/ApiDocs';
import Terms from './pages/Terms';
import { Toaster } from './components/ui/toaster';

function App() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectLanguage = async () => {
      const path = location.pathname;
      const langMatch = path.match(/^\/(id|en)/);
      
      if (langMatch) {
        const detectedLang = langMatch[1];
        if (i18n.language !== detectedLang) {
          await i18n.changeLanguage(detectedLang);
        }
        setIsLoading(false);
      } else {
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          const country = data.country_code;
          const lang = country === 'ID' ? 'id' : 'en';
          
          await i18n.changeLanguage(lang);
          navigate(`/${lang}/~`, { replace: true });
        } catch (error) {
          await i18n.changeLanguage('en');
          navigate('/en/~', { replace: true });
        }
        setIsLoading(false);
      }
    };

    detectLanguage();
  }, [location.pathname, i18n, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/:lang/~" element={<Home />} />
          <Route path="/:lang/docs" element={<ApiDocs />} />
          <Route path="/:lang/terms" element={<Terms />} />
          <Route path="/" element={<Navigate to={`/${i18n.language}/~`} replace />} />
          <Route path="*" element={<Navigate to={`/${i18n.language}/~`} replace />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
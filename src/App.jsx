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
  const [currentLang, setCurrentLang] = useState('id');

  useEffect(() => {
    const detectLanguage = async () => {
      const path = location.pathname;
      const langMatch = path.match(/^\/(id|en)/);
      
      if (langMatch) {
        const detectedLang = langMatch[1];
        setCurrentLang(detectedLang);
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
          
          setCurrentLang(lang);
          await i18n.changeLanguage(lang);
          
          if (path === '/' || path === '') {
            navigate(`/${lang}/~`, { replace: true });
          } else {
            navigate(`/${lang}${path}`, { replace: true });
          }
        } catch (error) {
          const defaultLang = 'en';
          setCurrentLang(defaultLang);
          await i18n.changeLanguage(defaultLang);
          
          if (path === '/' || path === '') {
            navigate(`/${defaultLang}/~`, { replace: true });
          } else {
            navigate(`/${defaultLang}${path}`, { replace: true });
          }
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
    <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
      <Header currentLang={currentLang} />
      <main className="flex-1">
        <Routes>
          <Route path="/:lang/~" element={<Home currentLang={currentLang} />} />
          <Route path="/:lang/docs" element={<ApiDocs currentLang={currentLang} />} />
          <Route path="/:lang/terms" element={<Terms currentLang={currentLang} />} />
          <Route path="/" element={<Navigate to={`/${currentLang}/~`} replace />} />
          <Route path="*" element={<Navigate to={`/${currentLang}/~`} replace />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
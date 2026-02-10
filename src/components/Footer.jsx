import { useTranslation } from 'react-i18next';
import { Heart, Code2 } from 'lucide-react';
import { FaTelegram, FaGithub } from 'react-icons/fa';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-sm text-white/80">
            <span>{t('footer.created')}</span>
            <a
              href="https://akadev.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent hover:from-red-400 hover:to-white/90 transition-all"
            >
              aka
            </a>
          </div>

          <div className="flex items-center space-x-2 text-sm text-white/80">
            <span>{t('footer.with')}</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>{t('footer.and')}</span>
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>{t('footer.code')}</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://t.me/akamodebaik"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-110"
              aria-label="Telegram"
            >
              <FaTelegram className="w-5 h-5 text-blue-400" />
            </a>

            <a
              href="https://github.com/akaanakbaik"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-110"
              aria-label="GitHub"
            >
              <FaGithub className="w-5 h-5" />
            </a>
          </div>

          <div className="text-xs text-white/40 text-center">
            <p>&copy; 2025 Kabox. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
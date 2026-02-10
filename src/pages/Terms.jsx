import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Lock, Database, Ban, RefreshCw, Mail } from 'lucide-react';

function Terms() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: Shield,
      title: t('terms.acceptance'),
      content: t('terms.acceptanceText')
    },
    {
      icon: Database,
      title: t('terms.service'),
      content: t('terms.serviceText')
    },
    {
      icon: Lock,
      title: t('terms.usage'),
      content: t('terms.usageText')
    },
    {
      icon: Ban,
      title: t('terms.prohibited'),
      content: t('terms.prohibitedItems'),
      isList: true
    },
    {
      icon: AlertTriangle,
      title: t('terms.limits'),
      content: t('terms.limitsText')
    },
    {
      icon: Lock,
      title: t('terms.privacy'),
      content: t('terms.privacyText')
    },
    {
      icon: Shield,
      title: t('terms.liability'),
      content: t('terms.liabilityText')
    },
    {
      icon: Ban,
      title: t('terms.termination'),
      content: t('terms.terminationText')
    },
    {
      icon: RefreshCw,
      title: t('terms.changes'),
      content: t('terms.changesText')
    },
    {
      icon: Mail,
      title: t('terms.contact'),
      content: t('terms.contactText')
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('terms.title')}
          </h1>
          <p className="text-white/60 text-lg mb-2">
            {t('terms.subtitle')}
          </p>
          <p className="text-sm text-white/40">
            {t('terms.updated')}: 10 Februari 2025
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Penting untuk Dibaca</h3>
              <p className="text-sm text-white/80">
                Dengan menggunakan layanan Kabox, Anda secara otomatis menyetujui seluruh syarat dan ketentuan yang tercantum di halaman ini. Harap baca dengan seksama sebelum menggunakan layanan kami.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 card-hover"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/10 rounded-lg flex-shrink-0">
                  <section.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                  {section.isList ? (
                    <ul className="space-y-2">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2 text-white/80">
                          <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white/80 leading-relaxed">{section.content}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 bg-white/5 border border-white/10 rounded-xl"
        >
          <h3 className="text-xl font-bold mb-4">Ringkasan Penting</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-black/30 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Yang Boleh</h4>
              <ul className="space-y-1 text-white/70">
                <li>✓ Upload file legal dan sah</li>
                <li>✓ Maksimal 5 file per upload</li>
                <li>✓ File hingga 100MB</li>
                <li>✓ Semua format file populer</li>
                <li>✓ Penggunaan pribadi dan komersial</li>
              </ul>
            </div>
            <div className="p-4 bg-black/30 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-2">Yang Dilarang</h4>
              <ul className="space-y-1 text-white/70">
                <li>✗ Konten ilegal atau berbahaya</li>
                <li>✗ Malware atau virus</li>
                <li>✗ Konten pornografi</li>
                <li>✗ Pelanggaran hak cipta</li>
                <li>✗ Spam atau penyalahgunaan</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl"
        >
          <h3 className="font-bold mb-2">Butuh Bantuan?</h3>
          <p className="text-sm text-white/80 mb-4">
            Jika Anda memiliki pertanyaan atau memerlukan klarifikasi mengenai syarat dan ketentuan ini, jangan ragu untuk menghubungi kami.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:akaanakbaik17@proton.me"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>akaanakbaik17@proton.me</span>
            </a>
            <a
              href="https://t.me/akamodebaik"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              <span>@akamodebaik</span>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-sm text-white/40"
        >
          <p>© 2025 Kabox. Hak cipta dilindungi undang-undang.</p>
          <p className="mt-2">
            Dokumen ini terakhir diperbarui pada 10 Februari 2025 dan dapat berubah sewaktu-waktu.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Terms;
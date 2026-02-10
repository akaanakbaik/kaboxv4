import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Check, Copy, ExternalLink, Loader2, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

function Home({ currentLang }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 5) {
        toast({
          title: t('errors.tooManyFiles'),
          description: t('upload.maxFiles'),
          variant: 'destructive'
        });
        return;
      }
      setFiles(acceptedFiles);
      setUploadResults([]);
    },
    maxFiles: 5,
    maxSize: 100 * 1024 * 1024
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: t('errors.selectFile'),
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      console.log('Upload response:', response.data);

      if (response.data && response.data.success && response.data.data) {
        const results = response.data.data.filter(item => item.success);
        
        if (results.length > 0) {
          setUploadResults(results);
          setFiles([]);
          toast({
            title: t('upload.success'),
            description: `${results.length} file berhasil diupload`
          });
        } else {
          toast({
            title: 'Upload gagal',
            description: 'Tidak ada file yang berhasil diupload',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = t('errors.networkError');
      
      if (error.response && error.response.data) {
        if (typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('errors.uploadFailed'),
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = (text) => {
    if (!text || text === 'undefined') {
      toast({
        title: 'Error',
        description: 'Link tidak tersedia',
        variant: 'destructive'
      });
      return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: t('results.copied'),
        duration: 2000
      });
    }).catch(err => {
      console.error('Copy failed:', err);
      toast({
        title: 'Error',
        description: 'Gagal menyalin link',
        variant: 'destructive'
      });
    });
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 MB';
    const mb = bytes / 1024 / 1024;
    return mb.toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-6 md:py-12 px-3 md:px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent px-2">
            {t('upload.title')}
          </h1>
          <p className="text-white/60 text-sm md:text-lg px-2">
            {t('upload.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 md:mb-8"
        >
          <div
            {...getRootProps()}
            className={`upload-drop-zone border-2 border-dashed rounded-xl md:rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'drag-active border-white/50 bg-white/5'
                : 'border-white/20 hover:border-white/30 hover:bg-white/5'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-white/60" />
            <p className="text-lg md:text-xl font-medium mb-2">
              {t('upload.dragDrop')}
            </p>
            <p className="text-white/60 mb-3 md:mb-4 text-sm md:text-base">{t('upload.or')}</p>
            <div className="inline-block px-4 py-2 md:px-6 md:py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors text-sm md:text-base">
              {t('upload.clickSelect')}
            </div>
            <p className="text-xs md:text-sm text-white/40 mt-3 md:mt-4">{t('upload.maxFiles')}</p>
          </div>

          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 md:mt-6 space-y-2 md:space-y-3"
            >
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                    <File className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-white/60" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm md:text-base">{file.name}</p>
                      <p className="text-xs md:text-sm text-white/40">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 md:mt-6 text-center"
            >
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-3 md:px-8 md:py-4 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2 text-sm md:text-base"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    <span>{t('upload.uploading')}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{t('upload.startButton')}</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 md:mt-6"
            >
              <div className="bg-white/5 rounded-full h-2.5 md:h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 progress-bar"
                />
              </div>
              <p className="text-center text-xs md:text-sm text-white/60 mt-2">
                {uploadProgress}%
              </p>
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {uploadResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3 md:space-y-4"
            >
              <h2 className="text-xl md:text-2xl font-bold flex items-center space-x-2 px-2">
                <Check className="w-5 h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0" />
                <span>{t('results.title')}</span>
              </h2>

              <div className="grid gap-3 md:gap-4">
                {uploadResults.map((result, index) => (
                  <motion.div
                    key={result.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-xl card-hover"
                  >
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <p className="text-xs md:text-sm text-white/60 mb-1 truncate">
                          {result.name || 'File'}
                        </p>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 md:py-1 bg-white/10 rounded">
                            {result.storage || 'cloud'}
                          </span>
                          <span className="text-xs text-white/40">
                            {formatFileSize(result.size)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-2 md:p-3 bg-black/30 rounded-lg overflow-hidden">
                        <input
                          type="text"
                          value={result.downloadUrl || ''}
                          readOnly
                          className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm min-w-0 truncate"
                        />
                        <button
                          onClick={() => copyToClipboard(result.downloadUrl)}
                          className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                          title={t('results.copy')}
                        >
                          <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        {result.downloadUrl && result.downloadUrl !== 'undefined' && (
                          <a
                            href={result.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                            title={t('results.open')}
                          >
                            <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Home;
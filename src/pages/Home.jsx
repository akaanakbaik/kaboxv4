import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Check, Copy, ExternalLink, Loader2, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

function Home() {
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

      if (response.data.success) {
        setUploadResults(response.data.data);
        setFiles([]);
        toast({
          title: t('upload.success'),
          description: `${response.data.data.length} file berhasil diupload`
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('errors.uploadFailed'),
        description: error.response?.data?.error || t('errors.networkError'),
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('results.copied'),
      duration: 2000
    });
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            {t('upload.title')}
          </h1>
          <p className="text-white/60 text-lg">
            {t('upload.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div
            {...getRootProps()}
            className={`upload-drop-zone border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'drag-active border-white/50 bg-white/5'
                : 'border-white/20 hover:border-white/30 hover:bg-white/5'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 mx-auto mb-4 text-white/60" />
            <p className="text-xl font-medium mb-2">
              {isDragActive ? t('upload.dragDrop') : t('upload.dragDrop')}
            </p>
            <p className="text-white/60 mb-4">{t('upload.or')}</p>
            <div className="inline-block px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors">
              {t('upload.clickSelect')}
            </div>
            <p className="text-sm text-white/40 mt-4">{t('upload.maxFiles')}</p>
          </div>

          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 space-y-3"
            >
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <File className="w-5 h-5 flex-shrink-0 text-white/60" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-white/40">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('upload.uploading')}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
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
              className="mt-6"
            >
              <div className="bg-white/5 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 progress-bar"
                />
              </div>
              <p className="text-center text-sm text-white/60 mt-2">
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
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Check className="w-6 h-6 text-green-500" />
                <span>{t('results.title')}</span>
              </h2>

              <div className="grid gap-4">
                {uploadResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-white/5 border border-white/10 rounded-xl card-hover"
                  >
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-white/60 mb-1">
                          {result.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 bg-white/10 rounded">
                            {result.storage}
                          </span>
                          <span className="text-xs text-white/40">
                            {(result.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-3 bg-black/30 rounded-lg">
                        <input
                          type="text"
                          value={result.downloadUrl}
                          readOnly
                          className="flex-1 bg-transparent border-none outline-none text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(result.downloadUrl)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title={t('results.copy')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={result.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title={t('results.open')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
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
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Code2, FileUp, FileDown, Info, Activity } from 'lucide-react';

function ApiDocs() {
  const { t } = useTranslation();

  const apiEndpoints = [
    {
      title: t('docs.upload'),
      description: t('docs.uploadDesc'),
      method: 'POST',
      endpoint: '/api/upload',
      icon: FileUp,
      parameters: [
        { name: 'files', type: 'File[]', required: true, description: 'Files to upload (max 5 files, 100MB each)' }
      ],
      curl: `curl -X POST https://kabox.my.id/api/upload \\
  -F "files=@image.jpg" \\
  -F "files=@document.pdf"`,
      response: `{
  "author": "aka",
  "email": "akaanakbaik17@proton.me",
  "success": true,
  "data": [
    {
      "success": true,
      "id": "abc123xyz456",
      "name": "image.jpg",
      "size": 1048576,
      "downloadUrl": "https://kabox.my.id/files/abc123xyz456/download",
      "storage": "cloudinary"
    }
  ]
}`
    },
    {
      title: t('docs.getFile'),
      description: t('docs.getFileDesc'),
      method: 'GET',
      endpoint: '/files/:id',
      icon: Info,
      parameters: [
        { name: 'id', type: 'String', required: true, description: 'File ID from upload response' }
      ],
      curl: `curl https://kabox.my.id/files/abc123xyz456`,
      response: `{
  "author": "aka",
  "email": "akaanakbaik17@proton.me",
  "success": true,
  "data": {
    "id": "abc123xyz456",
    "name": "image.jpg",
    "size": 1048576,
    "mimeType": "image/jpeg",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "downloadUrl": "https://kabox.my.id/files/abc123xyz456/download"
  }
}`
    },
    {
      title: t('docs.download'),
      description: t('docs.downloadDesc'),
      method: 'GET',
      endpoint: '/files/:id/download',
      icon: FileDown,
      parameters: [
        { name: 'id', type: 'String', required: true, description: 'File ID' }
      ],
      curl: `curl -OJ https://kabox.my.id/files/abc123xyz456/download`,
      response: 'File will be downloaded with original filename'
    },
    {
      title: t('docs.status'),
      description: t('docs.statusDesc'),
      method: 'GET',
      endpoint: '/files/:id/status',
      icon: Activity,
      parameters: [
        { name: 'id', type: 'String', required: true, description: 'File ID' }
      ],
      curl: `curl https://kabox.my.id/files/abc123xyz456/status`,
      response: `{
  "author": "aka",
  "email": "akaanakbaik17@proton.me",
  "success": true,
  "data": {
    "id": "abc123xyz456",
    "name": "image.jpg",
    "size": 1048576,
    "status": "completed",
    "message": "Upload completed",
    "chunked": false,
    "chunkCount": 0,
    "downloadUrl": "https://kabox.my.id/files/abc123xyz456/download"
  }
}`
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('docs.title')}
          </h1>
          <p className="text-white/60 text-lg">
            {t('docs.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-8">
          {apiEndpoints.map((endpoint, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <endpoint.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{endpoint.title}</h2>
                      <p className="text-white/60 text-sm mt-1">
                        {endpoint.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      endpoint.method === 'POST'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {endpoint.method}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60 mb-2">{t('docs.endpoint')}</p>
                    <div className="p-3 bg-black/40 rounded-lg font-mono text-sm">
                      {endpoint.endpoint}
                    </div>
                  </div>

                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <div>
                      <p className="text-sm text-white/60 mb-2">{t('docs.parameters')}</p>
                      <div className="space-y-2">
                        {endpoint.parameters.map((param, i) => (
                          <div
                            key={i}
                            className="p-3 bg-black/40 rounded-lg text-sm"
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-mono font-semibold">
                                {param.name}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-white/10 rounded">
                                {param.type}
                              </span>
                              {param.required && (
                                <span className="text-xs text-red-400">
                                  required
                                </span>
                              )}
                            </div>
                            <p className="text-white/60 text-xs">
                              {param.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-white/60 mb-2 flex items-center space-x-2">
                    <Code2 className="w-4 h-4" />
                    <span>{t('docs.curlExample')}</span>
                  </p>
                  <pre className="p-4 bg-black/60 rounded-lg overflow-x-auto text-sm">
                    <code className="text-green-400">{endpoint.curl}</code>
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-white/60 mb-2">{t('docs.responseExample')}</p>
                  <pre className="p-4 bg-black/60 rounded-lg overflow-x-auto text-sm">
                    <code className="text-blue-300">
                      {typeof endpoint.response === 'string' && endpoint.response.startsWith('{')
                        ? endpoint.response
                        : endpoint.response}
                    </code>
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl"
        >
          <h3 className="text-xl font-bold mb-2 flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-400" />
            <span>Important Notes</span>
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>No API key required - completely free to use</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Maximum 5 files per upload request</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Each file limited to 100MB</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Rate limit: 10 requests per second per IP</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Files stored on multi-cloud infrastructure (Cloudinary, ImageKit, Supabase)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>All responses include author information in JSON format</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

export default ApiDocs;
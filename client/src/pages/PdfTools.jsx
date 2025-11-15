import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  FileDown, 
  Trash2, 
  Volume2, 
  Sparkles,
  File,
  X
} from 'lucide-react';
import api from '../utils/api.js';
import PageTemplate from '../components/PageTemplate.jsx';
import PageHeader from '../components/PageHeader.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GlassCard from '../components/GlassCard.jsx';
import Button from '../components/Button.jsx';
import MotionContainer from '../components/MotionContainer.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function PdfTools() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const audioRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis || null);

  const loadDocs = () => {
    setLoading(true);
    api.get('/pdf')
      .then(r => setDocs(r.data.items || []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('pdf', file);
      const r = await api.post('/pdf/upload', form);
      setText(r.data.text);
      setFile(null);
      loadDocs();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this PDF? This will also delete all associated flashcards.')) {
      return;
    }
    try {
      await api.delete(`/pdf/${id}`);
      loadDocs();
      if (selectedDoc === id) {
        setText('');
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error('Error deleting PDF:', error);
      alert('Failed to delete PDF. Please try again.');
    }
  };

  const openDoc = async (doc) => {
    setSelectedDoc(doc.id);
    try {
      const r = await api.get('/pdf/' + doc.id);
      setText(r.data.text);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  const readAloud = () => {
    if (!synthRef.current || !text) return;
    const utter = new SpeechSynthesisUtterance(text.slice(0, 1000));
    synthRef.current.cancel();
    synthRef.current.speak(utter);
  };

  const summarize = async (detail) => {
    if (!text) return;
    setLoading(true);
    try {
      const r = await api.post('/summarize', { text, detail });
      setText(r.data.summary);
    } catch (error) {
      console.error('Error summarizing:', error);
      alert('Failed to summarize. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTemplate>
      <PageHeader
        title="PDF Tools"
        subtitle="Upload, read, and analyze your PDF documents"
        icon={FileText}
        action={
          <Button
            icon={Upload}
            onClick={() => document.getElementById('file-input')?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </Button>
        }
      />

      <input
        id="file-input"
        type="file"
        accept="application/pdf"
        onChange={e => setFile(e.target.files?.[0] || null)}
        className="hidden"
      />

      {/* Upload Section */}
      {file && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <AnimatedCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="w-8 h-8 text-indigo-600" />
                <div>
                  <div className="font-semibold text-gray-800">{file.name}</div>
                  <div className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={upload} disabled={uploading} size="sm">
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <button
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Document Editor</h3>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => summarize('short')}
                  disabled={!text || loading}
                >
                  Short
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => summarize('medium')}
                  disabled={!text || loading}
                >
                  Medium
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => summarize('detailed')}
                  disabled={!text || loading}
                >
                  Detailed
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  icon={Volume2}
                  onClick={readAloud}
                  disabled={!text}
                >
                  Read
                </Button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Upload a PDF or select one from the list to view its content here..."
              className="w-full h-[600px] p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </AnimatedCard>
        </div>

        {/* Recent PDFs Sidebar */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Recent PDFs
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <LoadingSkeleton key={i} variant="card" />
                ))}
              </div>
            ) : docs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">No PDFs uploaded yet</p>
              </div>
            ) : (
              <MotionContainer className="space-y-2">
                {docs.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openDoc(doc)}
                    className={`
                      p-3 rounded-xl cursor-pointer transition-all duration-300
                      ${selectedDoc === doc.id 
                        ? 'bg-indigo-50 border-2 border-indigo-500' 
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <File className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-sm font-semibold text-gray-800 truncate" title={doc.filename}>
                            {doc.filename}
                          </span>
                        </div>
                        {doc.createdAt && (
                          <div className="text-xs text-gray-500">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => deleteDoc(doc.id, e)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </MotionContainer>
            )}
          </GlassCard>
        </div>
      </div>
      <audio ref={audioRef} hidden />
    </PageTemplate>
  );
}

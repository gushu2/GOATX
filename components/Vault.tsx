import React, { useState, useEffect, useRef } from 'react';
import { Note, VaultData } from '../types';
import { saveVault, createNote } from '../services/storageService';
import { enhanceNote, suggestTags, summarizeVault } from '../services/geminiService';

interface VaultProps {
  initialData: VaultData;
  onLogout: () => void;
}

const Vault: React.FC<VaultProps> = ({ initialData, onLogout }) => {
  const [data, setData] = useState<VaultData>(initialData);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState<string | null>(null);

  const activeNote = data.notes.find(n => n.id === activeNoteId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-save whenever data changes
    saveVault(data);
  }, [data]);

  const handleAddNote = () => {
    const newNote = createNote('');
    setData(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes]
    }));
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      setData(prev => ({
        ...prev,
        notes: prev.notes.filter(n => n.id !== id)
      }));
      if (activeNoteId === id) setActiveNoteId(null);
    }
  };

  const updateNoteContent = (content: string) => {
    if (!activeNoteId) return;
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(n => 
        n.id === activeNoteId 
          ? { ...n, content, updatedAt: Date.now() } 
          : n
      )
    }));
  };

  const handleAIEnhance = async () => {
    if (!activeNote || !activeNote.content.trim()) return;
    setIsAIProcessing(true);
    try {
      const improved = await enhanceNote(activeNote.content);
      updateNoteContent(improved);
    } catch (err) {
      alert("Failed to enhance note.");
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleAITag = async () => {
    if (!activeNote || !activeNote.content.trim()) return;
    setIsAIProcessing(true);
    try {
      const tags = await suggestTags(activeNote.content);
      setData(prev => ({
        ...prev,
        notes: prev.notes.map(n => 
          n.id === activeNoteId 
            ? { ...n, tags: [...new Set([...(n.tags || []), ...tags])] } 
            : n
        )
      }));
    } catch (err) {
      alert("Failed to generate tags.");
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleVaultSummary = async () => {
    const texts = data.notes.map(n => n.content).filter(c => c.length > 10);
    if (texts.length === 0) return;
    
    setIsAIProcessing(true);
    try {
      const result = await summarizeVault(texts);
      setSummary(result);
    } finally {
      setIsAIProcessing(false);
    }
  };

  const filteredNotes = data.notes.filter(n => 
    n.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-rv-bg text-rv-text overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-rv-border flex flex-col bg-rv-bg ${activeNoteId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-rv-border flex justify-between items-center bg-rv-bg z-10">
          <div>
            <h2 className="font-bold text-xl tracking-tight">RV Vault <span className="text-rv-accent">#{data.code}</span></h2>
            <p className="text-xs text-rv-muted">{data.notes.length} Notes</p>
          </div>
          <button onClick={onLogout} className="p-2 hover:bg-rv-card rounded-lg transition-colors text-rv-muted hover:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input 
            type="text" 
            placeholder="Search notes..." 
            className="w-full bg-rv-card border border-rv-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rv-accent transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={handleAddNote}
            className="w-full bg-rv-accent hover:bg-rv-accentHover text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Note
          </button>
          {data.notes.length > 1 && (
             <button 
             onClick={handleVaultSummary}
             disabled={isAIProcessing}
             className="w-full bg-rv-card hover:bg-rv-border border border-rv-border text-rv-muted hover:text-rv-text py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
           >
             {isAIProcessing ? 'Thinking...' : 'Summarize Vault (AI)'}
           </button>
          )}
        </div>

        {summary && (
          <div className="mx-4 mb-4 p-3 bg-rv-card/50 border border-rv-accent/30 rounded-lg text-sm text-rv-text relative animate-fade-in">
             <button onClick={() => setSummary(null)} className="absolute top-1 right-1 text-rv-muted hover:text-white">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <p className="leading-relaxed text-xs text-gray-300"><span className="text-rv-accent font-bold">Summary:</span> {summary}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {filteredNotes.length === 0 && (
            <div className="text-center text-rv-muted text-sm mt-10">
              No notes found.
            </div>
          )}
          {filteredNotes.map(note => (
            <div 
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 group relative
                ${activeNoteId === note.id 
                  ? 'bg-rv-card border-rv-accent shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-rv-card/50 hover:border-rv-border'}`}
            >
              <div className="pr-6">
                 <p className="font-medium text-sm truncate text-gray-200">
                    {note.content.split('\n')[0] || 'Empty Note'}
                 </p>
                 <p className="text-xs text-rv-muted truncate mt-1">
                    {note.content.split('\n').slice(1).join(' ') || 'No additional text'}
                 </p>
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                 {note.tags?.map(tag => (
                   <span key={tag} className="text-[10px] bg-rv-border px-1.5 py-0.5 rounded text-gray-400">#{tag}</span>
                 ))}
              </div>
              
              <button 
                onClick={(e) => handleDeleteNote(e, note.id)}
                className="absolute top-3 right-3 text-rv-muted opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className={`flex-1 flex flex-col bg-rv-bg ${!activeNoteId ? 'hidden md:flex' : 'flex'}`}>
        {activeNote ? (
          <>
            <div className="h-14 border-b border-rv-border flex items-center justify-between px-6 bg-rv-bg">
              <div className="flex items-center gap-2">
                 <button onClick={() => setActiveNoteId(null)} className="md:hidden text-rv-muted hover:text-white mr-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 <span className="text-xs text-rv-muted font-mono">
                   Last edited: {new Date(activeNote.updatedAt).toLocaleTimeString()}
                 </span>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={handleAITag}
                   disabled={isAIProcessing}
                   className="text-xs bg-rv-card hover:bg-rv-border border border-rv-border text-rv-muted hover:text-white px-3 py-1.5 rounded transition-colors"
                 >
                   Auto-Tag
                 </button>
                 <button 
                   onClick={handleAIEnhance}
                   disabled={isAIProcessing}
                   className="text-xs bg-rv-accent/10 hover:bg-rv-accent/20 border border-rv-accent/30 text-rv-accent px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                 >
                   {isAIProcessing ? (
                     <span className="animate-pulse">Processing...</span>
                   ) : (
                     <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                        Enhance Text
                     </>
                   )}
                 </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              className="flex-1 bg-rv-bg p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed text-gray-200"
              placeholder="Start writing..."
              value={activeNote.content}
              onChange={(e) => updateNoteContent(e.target.value)}
              spellCheck={false}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-rv-muted opacity-30 select-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p>Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
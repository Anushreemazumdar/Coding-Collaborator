import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FileCode, Sparkles } from 'lucide-react';

export function CodeEditor({
  activeFile,
  content,
  onChange,
  onSave,
  remoteAuthor,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const getLanguage = (fileName) => {
    if (!fileName) return 'plaintext';
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'java':
        return 'java';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'c':
        return 'cpp';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'sql':
        return 'sql';
      case 'md':
        return 'markdown';
      case 'xml':
        return 'xml';
      default:
        return 'plaintext';
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add Ctrl+S / Cmd+S save command
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) onSave();
    });

    // Editor formatting & styling options
    editor.updateOptions({
      fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
      fontLigatures: true,
      fontSize: 14,
      lineHeight: 22,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      tabSize: 4,
      automaticLayout: true,
    });
  };

  if (!activeFile) {
    return (
      <div className="editor-empty-state">
        <div className="empty-content">
          <FileCode size={48} className="empty-icon" />
          <h3>No File Selected</h3>
          <p>Select a file from the explorer on the left or create a new one to begin real-time collaboration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-tab-bar">
        <div className="tab-item active">
          <span className="tab-name">{activeFile.name}</span>
        </div>
        {remoteAuthor && (
          <div className="remote-editing-badge" title="Someone is editing this session">
            <Sparkles size={13} className="sparkle-icon" />
            <span>Editing by: <strong>{remoteAuthor}</strong></span>
          </div>
        )}
      </div>

      <div className="editor-monaco-wrapper">
        <Editor
          height="100%"
          language={getLanguage(activeFile.name)}
          theme="vs-dark"
          value={content}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly: false,
            wordWrap: 'on',
          }}
          loading={
            <div className="editor-loading">
              <div className="spinner"></div>
              <span>Loading Monaco Editor...</span>
            </div>
          }
        />
      </div>
    </div>
  );
}

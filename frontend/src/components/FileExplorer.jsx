import React, { useState } from 'react';
import {
  FileCode2,
  FilePlus,
  Trash2,
  FolderOpen,
  Coffee,
  FileJson,
  FileText,
  FileCode,
  Globe,
  FileType,
} from 'lucide-react';

export function FileExplorer({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  projectName,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [error, setError] = useState('');

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'java':
        return <Coffee size={15} className="file-icon icon-java" />;
      case 'js':
      case 'jsx':
        return <FileCode size={15} className="file-icon icon-js" />;
      case 'html':
        return <Globe size={15} className="file-icon icon-html" />;
      case 'json':
        return <FileJson size={15} className="file-icon icon-json" />;
      case 'py':
        return <FileCode2 size={15} className="file-icon icon-py" />;
      case 'md':
      case 'txt':
        return <FileText size={15} className="file-icon icon-txt" />;
      default:
        return <FileType size={15} className="file-icon" />;
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      setError('Please enter a file name');
      return;
    }
    onCreateFile(newFileName.trim());
    setNewFileName('');
    setIsCreating(false);
    setError('');
  };

  return (
    <aside className="file-explorer">
      <div className="explorer-header">
        <div className="explorer-title">
          <FolderOpen size={16} className="folder-icon" />
          <span>{projectName || 'FILES'}</span>
        </div>
        <button
          className="btn-create-file"
          onClick={() => setIsCreating(true)}
          title="New File"
        >
          <FilePlus size={15} />
        </button>
      </div>

      {isCreating && (
        <form className="create-file-form" onSubmit={handleCreateSubmit}>
          <input
            type="text"
            className="input-file-name"
            placeholder="e.g. Solution.java"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            autoFocus
          />
          {error && <span className="create-error">{error}</span>}
          <div className="create-actions">
            <button type="submit" className="btn-confirm-create">Create</button>
            <button
              type="button"
              className="btn-cancel-create"
              onClick={() => {
                setIsCreating(false);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="file-list">
        {files.length === 0 ? (
          <div className="empty-files">No files yet</div>
        ) : (
          files.map((file) => {
            const isActive = activeFile?.id === file.id;
            return (
              <div
                key={file.id}
                className={`file-item ${isActive ? 'file-active' : ''}`}
                onClick={() => onSelectFile(file)}
              >
                <div className="file-item-left">
                  {getFileIcon(file.name)}
                  <span className="file-label">{file.name}</span>
                </div>
                <button
                  className="btn-delete-file"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ${file.name}?`)) {
                      onDeleteFile(file.id);
                    }
                  }}
                  title="Delete File"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

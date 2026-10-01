import React from 'react';
import { Code2, Circle, Save, LogOut, LayoutDashboard, Radio, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar({
  currentSession,
  currentProject,
  activeFile,
  connectionState,
  isSaving,
  hasUnsavedChanges,
  onSave,
  onNavigateDashboard,
}) {
  const { user, logout } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const copySessionCode = () => {
    if (currentSession?.sessionCode) {
      navigator.clipboard.writeText(currentSession.sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return (
          <span className="status-badge status-connected" title="Real-time WebSocket connection active">
            <span className="status-dot green"></span>
            Connected
          </span>
        );
      case 'CONNECTING':
        return (
          <span className="status-badge status-connecting" title="Connecting to collaboration server...">
            <span className="status-dot yellow"></span>
            Connecting...
          </span>
        );
      default:
        return (
          <span className="status-badge status-disconnected" title="Disconnected from collaboration server">
            <span className="status-dot red"></span>
            Disconnected
          </span>
        );
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="brand" onClick={onNavigateDashboard} style={{ cursor: 'pointer' }}>
          <div className="brand-logo">
            <Code2 size={20} className="logo-icon" />
          </div>
          <span className="brand-name">CodeCollab</span>
        </div>

        {currentProject && (
          <div className="navbar-breadcrumb">
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-item project-name">{currentProject.name}</span>
            {currentSession && (
              <>
                <span className="breadcrumb-divider">/</span>
                <div className="session-tag" onClick={copySessionCode} title="Click to copy Session ID">
                  <Radio size={13} className="session-icon" />
                  <span>{currentSession.sessionCode}</span>
                  {copied ? <Check size={12} className="copy-icon text-success" /> : <Copy size={12} className="copy-icon" />}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="navbar-center">
        {activeFile && (
          <div className="active-file-pill">
            <span className="file-name">{activeFile.name}</span>
            {hasUnsavedChanges && <span className="unsaved-indicator" title="Unsaved changes">•</span>}
          </div>
        )}
      </div>

      <div className="navbar-right">
        {connectionState && getStatusBadge()}

        {onSave && activeFile && (
          <button
            className={`btn-save ${hasUnsavedChanges ? 'btn-save-dirty' : ''}`}
            onClick={onSave}
            disabled={isSaving}
            title="Save file to database (Ctrl+S)"
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save *' : 'Saved'}</span>
          </button>
        )}

        <button
          className="btn-icon"
          onClick={onNavigateDashboard}
          title="Back to Dashboard"
        >
          <LayoutDashboard size={17} />
        </button>

        {user && (
          <div className="user-profile">
            <div className="avatar" title={`Logged in as ${user.username}`}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user.username}</span>
            <button className="btn-icon logout-btn" onClick={logout} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { FileExplorer } from '../components/FileExplorer';
import { CodeEditor } from '../components/CodeEditor';
import { Participants } from '../components/Participants';
import { Chat } from '../components/Chat';
import { api } from '../services/api';
import { websocketService } from '../services/websocket';
import { useAuth } from '../context/AuthContext';

export function CollaborationRoom({ sessionId, onNavigateDashboard }) {
  const { user } = useAuth();

  // Session & Project State
  const [session, setSession] = useState(null);
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Real-time State
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [remoteAuthor, setRemoteAuthor] = useState('');

  // Refs for tracking current state inside callbacks
  const activeFileRef = useRef(activeFile);
  activeFileRef.current = activeFile;
  const isLocalEditRef = useRef(false);
  const remoteAuthorTimeoutRef = useRef(null);

  // 1. Fetch Session, Project, and Files data
  const loadRoomData = useCallback(async () => {
    try {
      setLoading(true);
      const sessionData = await api.sessions.getById(sessionId);
      setSession(sessionData);

      const projectData = await api.projects.getById(sessionData.projectId);
      setProject(projectData);

      const fileList = await api.files.getByProject(sessionData.projectId);
      setFiles(fileList || []);

      // If files exist, set first file active
      if (fileList && fileList.length > 0) {
        const initialFile = fileList[0];
        setActiveFile(initialFile);
        setEditorContent(initialFile.content || '');
      }

      // Load initial chat history
      const history = await api.messages.getBySession(sessionId);
      setMessages(history || []);
    } catch (err) {
      console.error('Failed to load collaboration room:', err);
      setError('Failed to load session room. ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadRoomData();
  }, [loadRoomData]);

  // 2. Setup WebSocket lifecycle
  useEffect(() => {
    if (!sessionId || !user) return;

    // Listen to Connection State changes
    const unsubStatus = websocketService.onStatusChange((status) => {
      setConnectionState(status);
    });

    // Listen to Real-Time Code Changes
    const unsubCode = websocketService.onCodeChange((msg) => {
      // Ignore our own broadcasted changes
      if (msg.userId === user.id) return;

      // Check if the change is for the current open file
      if (activeFileRef.current && msg.fileId === activeFileRef.current.id) {
        isLocalEditRef.current = true;
        setEditorContent(msg.content);
        setHasUnsavedChanges(true);
        setTimeout(() => {
          isLocalEditRef.current = false;
        }, 50);

        // Show remote editing indicator badge
        setRemoteAuthor(msg.username || 'Collaborator');
        if (remoteAuthorTimeoutRef.current) clearTimeout(remoteAuthorTimeoutRef.current);
        remoteAuthorTimeoutRef.current = setTimeout(() => {
          setRemoteAuthor('');
        }, 2000);
      }
    });

    // Listen to Real-Time Chat Messages
    const unsubChat = websocketService.onChatMessage((msg) => {
      setMessages((prev) => {
        // Prevent duplicate append if message already exists
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    // Listen to Real-Time Presence Updates
    const unsubPresence = websocketService.onPresenceChange((msg) => {
      if (msg.activeUsers && Array.isArray(msg.activeUsers)) {
        setParticipants(msg.activeUsers);
      }

      // Add system notification for user joins/leaves
      if (msg.action === 'JOIN' && msg.userId !== user.id) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'SYSTEM',
            content: `${msg.username} joined the session`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else if (msg.action === 'LEAVE') {
        setMessages((prev) => [
          ...prev,
          {
            type: 'SYSTEM',
            content: `${msg.username} left the session`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    });

    // Connect to STOMP Broker
    websocketService.connect({
      sessionId: Number(sessionId),
      userId: user.id,
      username: user.username,
      onConnect: () => {
        // Connected
      },
      onError: (err) => {
        console.error('WebSocket connection error:', err);
      },
    });

    return () => {
      unsubStatus();
      unsubCode();
      unsubChat();
      unsubPresence();
      websocketService.disconnect();
    };
  }, [sessionId, user]);

  // 3. Handle File Switching
  const handleSelectFile = (file) => {
    if (activeFile?.id === file.id) return;

    // Prompt if unsaved changes exist or auto-save
    setActiveFile(file);
    setEditorContent(file.content || '');
    setHasUnsavedChanges(false);
  };

  // 4. Handle Local Code Change (Monaco onChange)
  const handleEditorChange = (newVal) => {
    if (isLocalEditRef.current) return;

    setEditorContent(newVal);
    setHasUnsavedChanges(true);

    // Broadcast code update to session via STOMP
    if (activeFile) {
      websocketService.sendCodeChange({
        fileId: activeFile.id,
        content: newVal,
      });
    }
  };

  // 5. Handle File Save (PUT /api/files/{id})
  const handleSaveFile = async () => {
    if (!activeFile) return;

    setIsSaving(true);
    try {
      const updated = await api.files.update(activeFile.id, editorContent);
      setActiveFile(updated);
      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to save file:', err);
      alert('Failed to save file: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 6. Handle File Creation
  const handleCreateFile = async (fileName) => {
    if (!project) return;
    try {
      const created = await api.files.create({
        projectId: project.id,
        name: fileName,
        content: '',
      });
      setFiles((prev) => [...prev, created]);
      setActiveFile(created);
      setEditorContent(created.content || '');
      setHasUnsavedChanges(false);
    } catch (err) {
      alert('Failed to create file: ' + err.message);
    }
  };

  // 7. Handle File Deletion
  const handleDeleteFile = async (fileId) => {
    try {
      await api.files.delete(fileId);
      const remaining = files.filter((f) => f.id !== fileId);
      setFiles(remaining);

      if (activeFile?.id === fileId) {
        if (remaining.length > 0) {
          setActiveFile(remaining[0]);
          setEditorContent(remaining[0].content || '');
        } else {
          setActiveFile(null);
          setEditorContent('');
        }
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      alert('Failed to delete file: ' + err.message);
    }
  };

  // 8. Handle Chat Message Send
  const handleSendMessage = (text) => {
    websocketService.sendChatMessage(text);
  };

  if (loading) {
    return (
      <div className="room-loading-screen">
        <div className="spinner large"></div>
        <h2>Entering Collaboration Room...</h2>
        <p>Connecting to real-time session {sessionId}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-error-screen">
        <h2>Unable to join room</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={onNavigateDashboard}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="collaboration-room-layout">
      {/* Top Navbar */}
      <Navbar
        currentSession={session}
        currentProject={project}
        activeFile={activeFile}
        connectionState={connectionState}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSaveFile}
        onNavigateDashboard={onNavigateDashboard}
      />

      {/* Main 3-Pane Work Area */}
      <div className="room-main-area">
        {/* Left Pane: File Explorer */}
        <FileExplorer
          files={files}
          activeFile={activeFile}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          projectName={project?.name}
        />

        {/* Center Pane: Monaco Code Editor */}
        <section className="editor-main-section">
          <CodeEditor
            activeFile={activeFile}
            content={editorContent}
            onChange={handleEditorChange}
            onSave={handleSaveFile}
            remoteAuthor={remoteAuthor}
          />
        </section>

        {/* Right Pane: Participants & Chat */}
        <aside className="room-sidebar-right">
          <Participants
            participants={participants.length > 0 ? participants : session?.participants || [user]}
            currentUserId={user?.id}
          />
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserId={user?.id}
          />
        </aside>
      </div>
    </div>
  );
}

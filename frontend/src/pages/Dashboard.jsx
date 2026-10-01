import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  Play,
  Trash2,
  Radio,
  FileCode2,
  Calendar,
  Users,
  Search,
  PlusCircle,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export function Dashboard({ onEnterSession }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals / Inputs
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  const [showCreateSession, setShowCreateSession] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [sessionName, setSessionName] = useState('');

  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projList, sessList] = await Promise.all([
        api.projects.getAll(),
        api.sessions.getAll(),
      ]);
      setProjects(projList || []);
      setSessions(sessList || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      const newProj = await api.projects.create({
        name: projectName.trim(),
        description: projectDesc.trim(),
        ownerId: user.id,
      });
      setShowCreateProject(false);
      setProjectName('');
      setProjectDesc('');
      loadData();
    } catch (err) {
      alert('Error creating project: ' + err.message);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    try {
      const newSession = await api.sessions.create({
        sessionCode: sessionCode.trim() || undefined,
        sessionName: sessionName.trim() || undefined,
        projectId: Number(selectedProjectId),
        createdById: user.id,
      });
      setShowCreateSession(false);
      setSessionCode('');
      setSessionName('');
      onEnterSession(newSession.id);
    } catch (err) {
      alert('Error creating session: ' + err.message);
    }
  };

  const handleJoinSession = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setJoinError('');
    try {
      const session = await api.sessions.getByCode(joinCode.trim());
      if (session && session.id) {
        // Join session API call
        await api.sessions.join(session.id, user.id);
        onEnterSession(session.id);
      } else {
        setJoinError('Session not found with code: ' + joinCode);
      }
    } catch (err) {
      setJoinError('Session not found or server error');
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete project "${projectName}"?`)) {
      try {
        await api.projects.delete(projectId);
        loadData();
      } catch (err) {
        alert('Failed to delete project: ' + err.message);
      }
    }
  };

  const handleQuickLaunch = async (project) => {
    try {
      const newSession = await api.sessions.create({
        sessionName: `${project.name} Collaboration Session`,
        projectId: project.id,
        createdById: user.id,
      });
      onEnterSession(newSession.id);
    } catch (err) {
      alert('Failed to start session: ' + err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar onNavigateDashboard={() => {}} />

      <main className="dashboard-content">
        {/* Hero / Quick Actions */}
        <section className="dashboard-hero">
          <div className="hero-left">
            <h1>Collaborative Coding Workspace</h1>
            <p>Create real-time sessions, invite team members, and code simultaneously with live synchronization.</p>
          </div>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setShowCreateProject(true)}>
              <FolderPlus size={16} />
              <span>New Project</span>
            </button>
            <button className="btn-secondary" onClick={() => setShowCreateSession(true)}>
              <Radio size={16} />
              <span>New Session</span>
            </button>
          </div>
        </section>

        {/* Join Session Banner */}
        <section className="join-session-banner">
          <div className="join-banner-left">
            <Radio size={20} className="radio-pulse" />
            <div>
              <h3>Join Active Session</h3>
              <p>Enter a session code (e.g. <code>SESSION-101</code>) to collaborate instantly.</p>
            </div>
          </div>
          <form className="join-form" onSubmit={handleJoinSession}>
            <input
              type="text"
              placeholder="Enter Session Code (e.g. SESSION-101)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <button type="submit" className="btn-join">
              <span>Join Room</span>
              <Play size={14} />
            </button>
          </form>
          {joinError && <div className="join-error">{joinError}</div>}
        </section>

        {/* Projects Grid */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Projects</h2>
            <span className="badge-count">{projects.length}</span>
          </div>

          {loading ? (
            <div className="section-loading">
              <div className="spinner"></div>
              <span>Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state-card">
              <Code2 size={40} className="empty-icon" />
              <h3>No projects found</h3>
              <p>Create your first project to start creating files and coding sessions.</p>
              <button className="btn-primary" onClick={() => setShowCreateProject(true)}>
                <FolderPlus size={15} />
                <span>Create Project</span>
              </button>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((p) => (
                <div key={p.id} className="project-card">
                  <div className="card-top">
                    <div className="project-badge">
                      <FileCode2 size={16} />
                      <span>{p.fileCount} file{p.fileCount !== 1 ? 's' : ''}</span>
                    </div>
                    {p.ownerId === user.id && (
                      <button
                        className="btn-delete-proj"
                        onClick={() => handleDeleteProject(p.id, p.name)}
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <h3 className="project-title">{p.name}</h3>
                  <p className="project-desc">{p.description || 'No description provided.'}</p>

                  <div className="card-footer">
                    <span className="owner-tag">By {p.ownerUsername}</span>
                    <button
                      className="btn-launch-session"
                      onClick={() => handleQuickLaunch(p)}
                      title="Launch live coding session"
                    >
                      <Play size={14} />
                      <span>Start Session</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Sessions List */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Active Coding Sessions</h2>
            <span className="badge-count">{sessions.length}</span>
          </div>

          {sessions.length === 0 ? (
            <div className="empty-state-card">
              <Radio size={40} className="empty-icon" />
              <h3>No Active Sessions</h3>
              <p>Launch a session from any project above to collaborate in real-time.</p>
            </div>
          ) : (
            <div className="sessions-table-wrapper">
              <table className="sessions-table">
                <thead>
                  <tr>
                    <th>Session Code</th>
                    <th>Session Name</th>
                    <th>Project</th>
                    <th>Created By</th>
                    <th>Participants</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="session-code-pill">{s.sessionCode}</span>
                      </td>
                      <td className="font-semibold">{s.sessionName}</td>
                      <td>{s.projectName}</td>
                      <td>{s.createdByUsername}</td>
                      <td>
                        <span className="participants-pill">
                          <Users size={12} />
                          {s.participants?.length || 1}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-join-sm"
                          onClick={() => {
                            api.sessions.join(s.id, user.id);
                            onEnterSession(s.id);
                          }}
                        >
                          <span>Join</span>
                          <ExternalLink size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Modal: Create Project */}
      {showCreateProject && (
        <div className="modal-overlay" onClick={() => setShowCreateProject(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Collaborative Java Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="e.g. Real-time collaborative coding project"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateProject(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Session */}
      {showCreateSession && (
        <div className="modal-overlay" onClick={() => setShowCreateSession(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Create Coding Session</h3>
            <form onSubmit={handleCreateSession}>
              <div className="form-group">
                <label>Select Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                >
                  <option value="">-- Choose a project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Session Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. SESSION-101"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Session Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Java Collaboration Session"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateSession(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={!selectedProjectId}>
                  Start Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

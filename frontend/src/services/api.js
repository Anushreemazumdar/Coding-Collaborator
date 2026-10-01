// API Client for Spring Boot Backend REST APIs
const API_BASE_URL = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP error ${response.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // 1. Auth APIs
  auth: {
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    login: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  },

  // 2. Project APIs
  projects: {
    getAll: (ownerId) => request(ownerId ? `/projects?ownerId=${ownerId}` : '/projects'),
    getById: (id) => request(`/projects/${id}`),
    create: (projectData) => request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),
    delete: (id) => request(`/projects/${id}`, {
      method: 'DELETE',
    }),
  },

  // 3. Session APIs
  sessions: {
    getAll: () => request('/sessions'),
    getById: (id) => request(`/sessions/${id}`),
    getByCode: (code) => request(`/sessions/code/${code}`),
    create: (sessionData) => request('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),
    join: (id, userId) => request(`/sessions/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
    leave: (id, userId) => request(`/sessions/${id}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  },

  // 4. File APIs
  files: {
    getByProject: (projectId) => request(`/files/project/${projectId}`),
    getById: (id) => request(`/files/${id}`),
    create: (fileData) => request('/files', {
      method: 'POST',
      body: JSON.stringify(fileData),
    }),
    update: (id, content) => request(`/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
    delete: (id) => request(`/files/${id}`, {
      method: 'DELETE',
    }),
  },

  // 5. Message APIs
  messages: {
    getBySession: (sessionId) => request(`/messages/session/${sessionId}`),
  },
};

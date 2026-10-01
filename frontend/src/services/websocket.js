import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.sessionId = null;
    this.userId = null;
    this.username = null;
    this.subscriptions = {};
    this.statusListeners = new Set();
    this.codeChangeListeners = new Set();
    this.chatListeners = new Set();
    this.presenceListeners = new Set();
    this.connectionState = 'DISCONNECTED'; // 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'
  }

  notifyStatus(status) {
    this.connectionState = status;
    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error('Status listener error:', err);
      }
    });
  }

  connect({ sessionId, userId, username, onConnect, onError }) {
    if (this.client && this.client.active) {
      if (this.sessionId === sessionId) {
        this.notifyStatus('CONNECTED');
        if (onConnect) onConnect();
        return;
      }
      this.disconnect();
    }

    this.sessionId = sessionId;
    this.userId = userId;
    this.username = username;
    this.notifyStatus('CONNECTING');

    this.client = new Client({
      // Provide SockJS fallback factory
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => {
        // console.debug('[STOMP]', msg);
      },
    });

    this.client.onConnect = (frame) => {
      console.log('STOMP Connected to session:', sessionId);
      this.notifyStatus('CONNECTED');

      // 1. Subscribe to real-time code changes
      this.subscriptions.code = this.client.subscribe(
        `/topic/session/${sessionId}/code`,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            this.codeChangeListeners.forEach((fn) => fn(data));
          } catch (err) {
            console.error('Failed to parse code change message:', err);
          }
        }
      );

      // 2. Subscribe to real-time chat messages
      this.subscriptions.chat = this.client.subscribe(
        `/topic/session/${sessionId}/chat`,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            this.chatListeners.forEach((fn) => fn(data));
          } catch (err) {
            console.error('Failed to parse chat message:', err);
          }
        }
      );

      // 3. Subscribe to real-time presence events
      this.subscriptions.presence = this.client.subscribe(
        `/topic/session/${sessionId}/presence`,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            this.presenceListeners.forEach((fn) => fn(data));
          } catch (err) {
            console.error('Failed to parse presence message:', err);
          }
        }
      );

      // Send Presence Join message
      this.sendPresenceJoin(sessionId, userId, username);

      if (onConnect) onConnect();
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message'], frame.body);
      this.notifyStatus('DISCONNECTED');
      if (onError) onError(frame);
    };

    this.client.onWebSocketClose = () => {
      console.warn('STOMP WebSocket Closed');
      this.notifyStatus('DISCONNECTED');
    };

    this.client.activate();
  }

  disconnect() {
    if (this.sessionId && this.userId) {
      this.sendPresenceLeave(this.sessionId, this.userId, this.username);
    }

    Object.values(this.subscriptions).forEach((sub) => {
      try {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      } catch (e) {}
    });
    this.subscriptions = {};

    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {}
      this.client = null;
    }

    this.notifyStatus('DISCONNECTED');
    this.sessionId = null;
  }

  // Send real-time code change
  sendCodeChange({ fileId, content, cursorLine, cursorColumn }) {
    if (!this.client || !this.client.connected) return;

    const payload = {
      sessionId: this.sessionId,
      fileId,
      userId: this.userId,
      username: this.username,
      content,
      cursorLine,
      cursorColumn,
      version: Date.now(),
    };

    this.client.publish({
      destination: `/app/session/${this.sessionId}/code`,
      body: JSON.stringify(payload),
    });
  }

  // Send real-time chat message
  sendChatMessage(content) {
    if (!this.client || !this.client.connected || !content || !content.trim()) return;

    const payload = {
      sessionId: this.sessionId,
      userId: this.userId,
      username: this.username,
      content: content.trim(),
      type: 'CHAT',
    };

    this.client.publish({
      destination: `/app/session/${this.sessionId}/chat`,
      body: JSON.stringify(payload),
    });
  }

  // Presence helper: Join
  sendPresenceJoin(sessionId, userId, username) {
    if (!this.client || !this.client.connected) return;
    this.client.publish({
      destination: `/app/session/${sessionId}/join`,
      body: JSON.stringify({
        sessionId,
        userId,
        username,
        action: 'JOIN',
      }),
    });
  }

  // Presence helper: Leave
  sendPresenceLeave(sessionId, userId, username) {
    if (!this.client || !this.client.connected) return;
    try {
      this.client.publish({
        destination: `/app/session/${sessionId}/leave`,
        body: JSON.stringify({
          sessionId,
          userId,
          username,
          action: 'LEAVE',
        }),
      });
    } catch (e) {}
  }

  // Event Listeners
  onStatusChange(fn) {
    this.statusListeners.add(fn);
    fn(this.connectionState);
    return () => this.statusListeners.delete(fn);
  }

  onCodeChange(fn) {
    this.codeChangeListeners.add(fn);
    return () => this.codeChangeListeners.delete(fn);
  }

  onChatMessage(fn) {
    this.chatListeners.add(fn);
    return () => this.chatListeners.delete(fn);
  }

  onPresenceChange(fn) {
    this.presenceListeners.add(fn);
    return () => this.presenceListeners.delete(fn);
  }
}

export const websocketService = new WebSocketService();

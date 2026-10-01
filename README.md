# Real-Time Collaborative Coding Platform

A web-based **Real-Time Collaborative Coding Platform** built for academic demonstration (Milestone 3 — Development and Implementation). It allows multiple developers to join the same coding session and see code changes, active participants, and chat messages updated instantly across all connected clients via WebSockets + STOMP.

---

## 1. Technology Stack

### Frontend
- **Framework:** React 18 + Vite
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)
- **Real-Time Protocol:** STOMP over WebSocket (`@stomp/stompjs` + `sockjs-client`)
- **UI & Icons:** Lucide React + Modern Dark-Themed IDE CSS

### Backend
- **Framework:** Java 17+ / Spring Boot 3.3.5
- **Modules:** Spring Web, Spring Data JPA, Spring WebSocket, STOMP Messaging Broker
- **Build Tool:** Apache Maven

### Database
- **Database:** MySQL 8.0+ (with automatic schema creation and JPA entity persistence)

---

## 2. Directory Structure

```text
collaborative-coding-platform/
│
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/example/collab/
│       │   │   ├── config/          # WebSocketConfig, WebConfig
│       │   │   ├── controller/      # Auth, Project, Session, File, Message
│       │   │   ├── dto/             # CodeChangeMessage, ChatMessage, PresenceMessage, etc.
│       │   │   ├── entity/          # User, Project, Session, FileEntity, Message
│       │   │   ├── repository/      # Spring Data JPA Repositories
│       │   │   ├── service/         # Business logic and real-time presence
│       │   │   ├── websocket/       # CollaborationSocketController (STOMP handlers)
│       │   │   └── CollabApplication.java
│       │   └── resources/
│       │       └── application.properties
│       └── test/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx           # Status badge, file pill, save button, session tag
│       │   ├── FileExplorer.jsx     # Project file tree, create/delete files
│       │   ├── CodeEditor.jsx       # Monaco Editor with multi-language & shortcuts
│       │   ├── Chat.jsx             # Real-time session messaging & join/leave alerts
│       │   └── Participants.jsx     # Live online user indicators
│       ├── pages/
│       │   ├── Login.jsx            # User authentication
│       │   ├── Register.jsx         # New user registration
│       │   ├── Dashboard.jsx        # Project manager & session launcher
│       │   └── CollaborationRoom.jsx# 3-Pane real-time IDE environment
│       ├── services/
│       │   ├── api.js               # REST API client
│       │   └── websocket.js         # STOMP/SockJS client
│       ├── context/
│       │   └── AuthContext.jsx      # Session state provider
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
│
├── database/
│   └── schema.sql                   # MySQL relational schema definition
│
├── start-backend.bat                # 1-click backend launcher
├── start-frontend.bat               # 1-click frontend launcher
├── start-all.bat                    # 1-click full stack launcher
└── README.md
```

---

## 3. Prerequisites

Make sure the following are installed:
- **Java Development Kit (JDK):** Version 17 or higher (`java -version`)
- **Node.js & npm:** Node v18+ and npm v9+ (`node -v`, `npm -v`)
- **MySQL Server:** Version 8.0+ running locally on port `3306`
- **Maven:** (A standalone Maven distribution is included in the `tools/` directory, or use system `mvn`)

---

## 4. MySQL Setup

1. Start your local MySQL service.
2. The backend creates the `collab_db` database and tables automatically on startup.
3. Alternatively, you can manually run the SQL script located at `database/schema.sql`:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
4. Configure database credentials in `backend/src/main/resources/application.properties` (defaults to `username: root`, `password: root`):
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/collab_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```

---

## 5. Running the Application

### Option A: 1-Click Startup (Windows)
Double-click `start-all.bat` in the root folder, or run:
```bash
./start-all.bat
```

### Option B: Manual Command Line Startup

#### 1. Start the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
*(Or use the included tool: `..\tools\apache-maven-3.9.6\bin\mvn spring-boot:run`)*

#### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 6. Default Network Ports & Endpoints

| Component | Protocol | Endpoint / URL |
|---|---|---|
| **Frontend Application** | HTTP | `http://localhost:5173` |
| **Backend REST APIs** | HTTP | `http://localhost:8080/api` |
| **WebSocket / STOMP** | WS / SockJS | `ws://localhost:8080/ws` |
| **MySQL Database** | TCP | `localhost:3306/collab_db` |

---

## 7. REST API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user (`username`, `email`, `password`)
- `POST /api/auth/login` — Sign in and obtain user session

### Projects (`/api/projects`)
- `POST /api/projects` — Create a project (`name`, `description`, `ownerId`)
- `GET /api/projects` — List all projects or filter by `?ownerId=`
- `GET /api/projects/{id}` — Get single project details and file list
- `DELETE /api/projects/{id}` — Delete a project and its associated files/sessions

### Coding Sessions (`/api/sessions`)
- `POST /api/sessions` — Create a session (`sessionCode`, `sessionName`, `projectId`, `createdById`)
- `GET /api/sessions` — List all active sessions
- `GET /api/sessions/{id}` — Get session metadata and active participants
- `GET /api/sessions/code/{sessionCode}` — Look up session by human-readable code
- `POST /api/sessions/{id}/join` — Add participant to session
- `POST /api/sessions/{id}/leave` — Remove participant from session

### Files (`/api/files`)
- `POST /api/files` — Create a new file in a project
- `GET /api/files/project/{projectId}` — List all files for a project
- `GET /api/files/{id}` — Get file details and persisted code content
- `PUT /api/files/{id}` — Save updated file content to MySQL database
- `DELETE /api/files/{id}` — Delete a file

### Chat Messages (`/api/messages`)
- `GET /api/messages/session/{sessionId}` — Retrieve full chat history for a session

---

## 8. Real-Time WebSocket & STOMP Architecture

The platform uses STOMP messaging over WebSocket with the following channel mapping:

```text
[Client A: React Editor] ─── (publish) ───> /app/session/{sessionId}/code
                                                     │
                                             [Spring Boot Broker]
                                                     │
[Client B: React Editor] <── (broadcast) ── /topic/session/{sessionId}/code
```

### Destination Topics

| Type | Client Sends (App Destination) | Broker Broadcasts (Topic Subscription) | Payload Description |
|---|---|---|---|
| **Code Changes** | `/app/session/{id}/code` | `/topic/session/{id}/code` | `{ sessionId, fileId, userId, username, content, version }` |
| **Chat Messages** | `/app/session/{id}/chat` | `/topic/session/{id}/chat` | `{ sessionId, userId, username, content, timestamp }` |
| **Presence Join** | `/app/session/{id}/join` | `/topic/session/{id}/presence` | `{ sessionId, userId, username, action: 'JOIN', activeUsers }` |
| **Presence Leave** | `/app/session/{id}/leave` | `/topic/session/{id}/presence` | `{ sessionId, userId, username, action: 'LEAVE', activeUsers }` |

---

## 9. How to Test Two-User Collaboration (Step-by-Step)

Follow this 17-step flow to verify the live collaboration demonstration:

1. Open **Browser 1** (e.g. Chrome) and navigate to `http://localhost:5173`.
2. Click **Create Account** and register as `User A` (e.g., `alice`, `alice@example.com`, `pass123`).
3. On the Dashboard, click **New Project** and name it `Collaborative Java Project`.
4. Click **Start Session** on the project card. Note the Session Code (e.g., `SESSION-101`).
5. The 3-pane IDE opens with `Main.java`. Notice the status badge displays **Connected** (green).
6. Open **Browser 2** (e.g., Chrome Incognito window, Firefox, or Edge) and go to `http://localhost:5173`.
7. Register as `User B` (e.g., `bob`, `bob@example.com`, `pass123`).
8. On User B's Dashboard, enter `SESSION-101` in the **Join Active Session** box and click **Join Room**.
9. Both users are now in the same session room.
10. **Verify Presence:** Both `alice` and `bob` appear in the Participants panel with green online status indicators.
11. **Verify Live Code Editing:**
    - In Browser 1, edit `Main.java` (e.g. add a new `System.out.println("Live sync working!");`).
    - Observe Browser 2: The code updates immediately in real time without refreshing!
12. **Verify Live Chat:**
    - In Browser 2, type `Hello Alice!` in the Chat box and press Enter.
    - Observe Browser 1: The chat message arrives instantly in Alice's chat stream.
13. **Verify File Saving:**
    - In Browser 1, click the **Save \*** button (or press `Ctrl+S`). The button changes to `Saved`.
    - In MySQL database, verify the file content is updated in the `files` table.
14. **Verify Persistence:**
    - Refresh Browser 2. The latest saved code and chat history load cleanly from the database.

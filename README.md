# Character Coach Application

Character Coach is a web application designed to evaluate, track, and support the development of core character traits. The system allows users to take assessments, maintain reflective journal entries, view analytics charts, and export their reports.

The repository is structured as a monorepo consisting of:
* `/client`: React frontend built with Vite, TailwindCSS, and Material UI.
* `/server`: Node.js Express API using Prisma ORM with MariaDB.

---

## Technical Stack

### Frontend
* **Runtime & Tooling:** React (v19), Vite (v8)
* **Styling & Layout:** TailwindCSS, Material UI (MUI v6), Framer Motion (for animations)
* **State Management:** Zustand
* **Charts & Analytics:** Recharts, React SVG Worldmap
* **Utilities:** Axios (API calls), jsPDF & jsPDF-AutoTable (PDF export), React-Quill-New (Rich-Text Editor)

### Backend
* **Runtime & Framework:** Node.js, Express
* **Database & ORM:** MariaDB, Prisma ORM
* **Authentication:** JSON Web Tokens (JWT) stored in HTTP-Only cookies
* **Security Middleware:** Helmet, CORS, Express Rate Limit, Sanitize-HTML (for Rich-Text inputs)
* **Cryptography:** Crypto module (AES-256-GCM symmetric encryption for emails and avatars, SHA-256 hashing for lookups)

---

## Domain and Configuration Architecture

The application is configured to run in two distinct environments:

### 1. Local Testing and Development
In the development environment, both servers run on the local machine and use standard local host configurations:
* **Frontend Domain:** `http://localhost:5173`
* **Backend API Domain:** `http://localhost:5000`
* **Session Cookies:** Configured with `sameSite: 'lax'` and `secure: false`.
* **Mock Login:** Enabled for testing. Developers can sign in with mock email addresses bypassing Google OAuth verification.

### 2. Production Environment
In the production environment, the frontend and backend are hosted on separate platforms, requiring cross-origin cookie handling:
* **Frontend Domain:** Hosted on Vercel.
* **Backend API Domain:** Hosted on Render.
* **Database:** Managed MariaDB cluster hosted on CloudClusters.
* **Cross-Site Cookies:** Session cookies are configured with `sameSite: 'none'` and `secure: true` (HTTPS). This allows the frontend hosted on Vercel to securely attach credentials to API requests sent to the backend on Render.
* **Mock Login:** Disabled. All logins must authenticate through the Google OAuth2 flow.

---

## Environment Variables Configuration

### Server Configuration (`/server/.env`)
Create a `.env` file in the `/server` directory with the following variables:

```ini
# Server Port
PORT=5000

# Database Connection URI (MariaDB)
DATABASE_URL=mysql://<username>:<password>@<host>:<port>/<database_name>

# JWT Authentication Secrets
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# Allowed Frontend Origin URL
FRONTEND_URL=http://localhost:5173
```

### Client Configuration (`/client/.env`)
Create a `.env` file in the `/client` directory with the following variables:

```ini
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

---

## Installation and Setup

### Prerequisites
* Node.js (v18 or higher)
* MariaDB or MySQL database instance

### 1. Database Setup
1. From the `/server` directory, run Prisma code generation:
   ```bash
   npx prisma generate
   ```
2. Apply migrations to set up the database schema:
   ```bash
   npx prisma db push
   ```
3. Run the database seed script to populate default character traits and categories:
   ```bash
   npm run prisma:seed
   ```

### 2. Running Locally
To launch both environments concurrently, run the following commands in separate terminals:

* **Start Backend API:**
  ```bash
  cd server
  npm install
  npm run dev
  ```
* **Start Frontend Client:**
  ```bash
  cd client
  npm install
  npm run dev
  ```

---

## Security and Identity Architecture

To ensure user privacy, the database does not store plain-text email addresses or profile pictures:
1. **Email Encryption:** When a user logs in, their email is encrypted using AES-256-GCM before writing to the database.
2. **Deterministic Lookup:** An `emailHash` field is computed using SHA-256 of the plain-text email. This hash is indexed and used in unique queries to find existing records without decrypting all database rows.
3. **Session Integrity:** If a user logs in and the computed `emailHash` matches an existing database entry, they are immediately logged into their existing account, preserving all historical assessments and journal notes.
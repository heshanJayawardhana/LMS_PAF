# SmartEdu Portal Client

React frontend for the Smart Campus Operations Hub assignment.

## Authentication Coverage

This project includes the authentication pieces required by the assignment:

- Email/password registration and login
- Google OAuth 2.0 sign-in flow
- JWT-based authentication for API requests
- Role-aware routing for `USER`, `ADMIN`, and `TECHNICIAN`
- Session restoration with `/api/auth/me`
- Automatic logout when the token is invalid or expired

## How Authentication Works

### 1. Login methods

- Standard login sends credentials to `POST /api/auth/login`
- Google sign-in sends the Google ID token to `POST /api/auth/google`
- Registration sends student signup data to `POST /api/auth/register`

### 2. Token handling

- The backend issues a signed JWT after successful login
- The client stores the JWT and attaches it as `Authorization: Bearer <token>`
- The backend validates the token on each protected request

### 3. Session management

- Spring Security is configured as `STATELESS`
- When the app reloads, the client calls `GET /api/auth/me`
- If the token is valid, the session is restored
- If the token is missing, invalid, or expired, the client clears auth state and returns to `/login`

### 4. Role handling

- `USER` -> `/dashboard`
- `ADMIN` -> `/admin/dashboard`
- `TECHNICIAN` -> `/tickets`

Frontend route protection is handled by `ProtectedRoute`, while backend authorization is enforced in Spring Security.

## Environment Setup

Create `Client/.env` from the example below:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_NAME=SmartEdu Portal
REACT_APP_VERSION=1.0.0
```

## Google OAuth 2.0 Setup

This project uses Google Identity Services in React and verifies the returned ID token on the Spring Boot backend.

### Google Cloud steps

1. Open Google Cloud Console
2. Create or select a project
3. Go to `APIs & Services` -> `Credentials`
4. Create an `OAuth 2.0 Client ID`
5. Choose `Web application`
6. Add this authorized JavaScript origin:

```text
http://localhost:3000
```

7. Copy the generated client ID

### Client setup

Paste the client ID into `Client/.env`:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-real-client-id.apps.googleusercontent.com
```

### Backend setup

Start the backend with the same client ID in the environment:

```powershell
$env:GOOGLE_CLIENT_ID="your-real-client-id.apps.googleusercontent.com"
$env:JWT_SECRET="replace-this-with-a-strong-secret-of-at-least-32-characters"
cd E:\Y3S1\PAF\PAF_Project\LMS_PAF\server\server
.\mvnw.cmd spring-boot:run
```

### Frontend start

```powershell
cd E:\Y3S1\PAF\PAF_Project\LMS_PAF\Client
npm install
npm start
```

### Important notes

- The same Google client ID must be used on both frontend and backend
- Google login only works when `REACT_APP_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` are both set
- First-time Google users are created as local `USER` accounts
- Public signup creates student/user accounts only

## Backend Security Notes For Report

Use these points in your report or viva:

- JWT signing secret is loaded from the `JWT_SECRET` environment variable
- JWT tokens include user identity and role claims
- Spring Security runs in stateless mode
- `/api/auth/me` restores the logged-in user from the bearer token
- Backend authorization is enforced for facilities, bookings, notifications, and auth session endpoints
- Booking ownership is enforced on the backend for normal users

## Demo Checklist

Before submission, verify:

1. Student registration works
2. Student login works
3. Admin login works
4. Technician login works
5. Reload keeps the user signed in
6. Invalid token redirects to login
7. Google sign-in works with a real Google client ID
8. Admin-only pages reject non-admin users

## Build

```powershell
npm run build
```

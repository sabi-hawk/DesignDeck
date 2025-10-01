# DesignDeck Server

Backend server for the DesignDeck application with authentication and project management.

## Features

- **Authentication**: JWT-based user authentication with login/register
- **Project Management**: Save and load canvas projects
- **User Management**: User profiles and project ownership
- **RESTful API**: Clean API endpoints for frontend integration

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `config.env` and update the values
   - Update `MONGODB_URI` with your MongoDB connection string
   - Update `JWT_SECRET` with a secure secret key

4. Start MongoDB (if running locally):
   ```bash
   # Using MongoDB Compass or command line
   mongod
   ```

5. Start the server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Projects

- `GET /api/projects` - Get all user projects (protected)
- `GET /api/projects/:id` - Get single project (protected)
- `POST /api/projects` - Create new project (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)
- `POST /api/projects/save` - Save current canvas state (protected)

### Health Check

- `GET /api/health` - Server health status

## Environment Variables

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/designdeck
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

## Database Schema

### User
- `_id`: ObjectId
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `avatar`: String (optional)
- `createdAt`: Date

### Project
- `_id`: ObjectId
- `userId`: ObjectId (ref: User)
- `name`: String (required)
- `description`: String (optional)
- `canvasData`: Mixed (required)
- `thumbnail`: String (optional)
- `isPublic`: Boolean (default: false)
- `tags`: [String]
- `lastModified`: Date
- `createdAt`: Date

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- CORS configuration
- Error handling middleware

## Development

The server uses nodemon for development, which automatically restarts when files change.

```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set a strong `JWT_SECRET`
4. Configure CORS for your domain
5. Use PM2 or similar process manager

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `config.env`
- Verify network connectivity

### JWT Issues
- Ensure `JWT_SECRET` is set
- Check token expiration settings
- Verify token format in requests

### CORS Issues
- Update CORS origin in `server.js`
- Check frontend URL configuration

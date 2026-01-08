# Social App

A robust and scalable RESTful API backend for a modern social media platform, built with Node.js, Express, and TypeScript.

### Live Chat Preview 
![Live Chat](public/livechat.png)

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [API Overview](#-api-overview)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)

## Features

### Authentication & Security
- JWT-based authentication with **Access & Refresh tokens**
- **Email OTP verification** and password reset
- Optional **Two-Factor Authentication (2FA)** via email
- Secure password hashing using **bcrypt**
- Token rotation and invalidation
- Login activity tracking and session protection
- **Zod validation** for strict schema enforcement
- Encrypted data fields using **Crypto.js**

### User Management
- Create, read, update, and delete profiles
- Profile avatar upload via **AWS S3**
- Signed URL generation for secure uploads
- User blocking/unblocking system
- User bio, gender, age, phone, and contact details
- Retrieve blocked users and privacy settings

### Posts & Comments
- Create, update, and delete posts
- Visibility options: `public`, `friends`, `private`
- Image/video uploads through AWS S3
- Like, comment, and mention users
- Auto cleanup of media on delete
- Hashtags and content tagging support

### Chat & Messaging
- Real-time private and group chat using **Socket.io**
- Message delivery confirmation & read receipts
- Group creation and management
- Online/offline user presence tracking
- Secure message storage and deletion
- Event-driven notifications for new messages

### Friends & Social Features
- Send and manage friend requests
- Accept/decline/block users
- View friends and mutual connections
- Social feed showing posts from friends
- Notifications for friend requests and mentions

### Infrastructure
- Clean modular architecture
- Centralized error handling and logging
- **AWS S3** for file uploads
- **Mongoose ODM** for MongoDB
- **Nodemailer** for sending OTP and notifications
- **Winston logger** for server monitoring
- Environment-based configuration management

### Error Handling

The application implements a centralized error handling mechanism:

- Custom `AppError` class for error creation
- Global error handling middleware
- Structured error responses
- Validation error handling with Zod
- Async error catching with express middleware

---

## Tech Stack

- **Runtime Environment**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, bcrypt
- **Real-time Communication**: Socket.io
- **File Storage**: AWS S3
- **Email Service**: Nodemailer
- **Validation**: Zod
- **Security**: CORS, Crypto.js

## Project Architecture

The project implements clean architecture principles:

- Modular design
- Separation of concerns
- Repository pattern
- Service layer abstraction
- DTO pattern
- Event-driven architecture

```plaintext
src/
├── bootstrap.ts          # Application bootstrapping
├── index.ts             # Entry point
├── routes.ts            # Main router configuration
├── common/              # Shared utilities and validators
├── config/              # Configuration files
├── middlewares/         # Express middlewares
├── models/              # MongoDB models
├── modules/             # Feature modules
│   ├── auth/           # Authentication module
│   ├── chat/           # Chat functionality
│   ├── comment/        # Comment handling
│   ├── friend/         # Friend management
│   ├── group/          # Group chat features
│   ├── post/           # Post management
│   └── user/           # User management
├── repositories/        # Data access layer
├── services/           # Business logic
└── utils/              # Helper utilities
```

## API Overview

### Deployment URLs:
```
https://social-app-backend-tau.vercel.app
```

### Authentication API

#### Sign Up

```http
POST /auth/signup
Content-Type: application/json

{
  "name": "Mohamed Hassan",
  "email": "dev.mohamed.hassan@example.com",
  "password": "StrongPassword123",
  "confirmPassword": "StrongPassword123",
  "age": 72,
  "gender": "male",
  "phone": "+201234567890"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "dev.mohamed.hassan@example.com",
  "password": "StrongPassword123"
}
```

### Posts API

#### Create Post

```http
POST /posts
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
  "content": "Hello everyone! This is my first post.",
  "visibility": "public",
  "media": ["image1.jpg", "image2.jpg"]
}
```

#### Get User Posts

```http
GET /posts/user/:userId
Authorization: Bearer <your_access_token>
```

### Chat API

#### Send Private Message

```http
POST /chat/message
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
  "recipientId": "user123",
  "content": "Hey! How are you?",
  "type": "text"
}
```

#### Create Group Chat

```http
POST /groups
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
  "name": "Project Team",
  "members": ["user123", "user456", "user789"],
  "description": "Group for our awesome project"
}
```

### Friends API

#### Send Friend Request

```http
POST /friends/request
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
  "recipientId": "user123"
}
```

#### Accept Friend Request

```http
PUT /friends/request/accept
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
  "requestId": "request123"
}
```

> For complete API documentation [API Documentation](https://www.postman.com/maintenance-candidate-2675300/workspace/public-workspace/collection/45449526-802b2f33-5050-46e3-81e5-a999697e6728?action=share&creator=45449526&active-environment=45449526-c3ef379c-add5-4408-90b5-3407db5366fb).

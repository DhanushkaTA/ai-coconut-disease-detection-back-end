# AI Coconut Disease Detection Backend

Backend service for the **Web-Based AI-Powered Crop Disease Detection and Smart Agricultural Platform for Coconut Plants**.

This project provides the server-side APIs, authentication, database models, and real-time communication features required for the platform. It supports user management, posts, alerts, comments, products, chat, and AI-based coconut leaf disease prediction integration.

---

## Features

- JWT-based authentication and authorization
- Role-based access control for:
  - Admin
  - User / Farmer
  - Merchant
- Post management
- Post comments
- Alert management
- Alert comments
- Real-time chat with Socket.io
- MongoDB database integration with Mongoose
- AI disease prediction service integration
- RESTful API architecture
- Middleware-based request validation and security

---

## Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **MongoDB**
- **Mongoose**
- **Socket.io**
- **JWT (jsonwebtoken)**
- **bcryptjs**
- **cookie-parser**
- **cors**
- **dotenv**

---

## Project Structure

```bash
src/
│
├── config/              # Configuration files
├── controller/          # Request handlers / controllers
├── db/                  # Database connection
├── exception/           # Custom exception handling
├── middleware/          # JWT and role verification middleware
├── model/               # Mongoose models
│   └── chat/            # Chat-related models
├── route/               # API route definitions
├── socket/              # Socket.io server logic
├── type/                # Type definitions
├── util/                # Utility classes and constants
└── server.ts            # Application entry point
# Hipoca, a flashcard app

## Description

Hipoca allows users to create and review flashcards to enhance learning and memorization.

## Live demo

- [Link]()

**Demo Note:** _Only a username and password is needed to demo the website. No verification is required._

## Features

### Account Management

- Secure user authentication with JWT tokens
- Sign up and log in/out functionality

### Decks and cards

- View, create, edit, and delete decks and cards
- Search for and copy decks from other users to customize them freely
- Color and tag system for easy card grouping and filtering

### Review sessions

- Three types of study sessions:
  - Manually create a study stack
  - Review cards with due dates
  - Study entire decks
- Two study modes: casual and quiz
- Custom preferred review dates for each card
- Automatically calculated statistics (such as accuracy)

## Technology Stack

### Core Stack (PERN)

- **PostgreSQL** - Database
- **Express** - Backend framework
- **React** - Frontend library
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe programming language
- **React Google Charts** - Visualization library

### Frontend Packages

- **react-router-dom** - Route management
- **react-tooltip** - Easy tooltip implementation
- **vite** - Frontend bundler

### Backend Packages

- **bcryptjs** - Password hashing
- **cookie-parser** - JWT token parsing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **express** - Server framework
- **jsonwebtoken** - User authentication
- **prisma/client** - Database ORM

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository

```bash
git clone https://github.com/juscao/hipoca.git
cd hipoca
```

2. Install backend dependencies

```bash
cd server
npm install
```

3. Configure environment variables
   Create a `.env` file in the server directory with:

```
DATABASE_URL=postgresql://username:password@localhost:5432/hipoca
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
# Add other necessary environment variables
```

4. Set up the database

```bash
npx prisma migrate dev
```

5. Install frontend dependencies

```bash
cd ../client
npm install
```

6. Start the development servers

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

7. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Create an account or log in
2. Create a new deck or new flashcards
3. Customize flashcards with up to 5 tags or different colors for easy sorting and organization
4. Add cards to your study pile and start a review session
5. Browse for decks from other users and copy them to your account for editing
6. Come back each day to study cards that are designated for review

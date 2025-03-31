# Real Talk Video Compiler

A video processing application for compiling real-talk videos with TypeScript, Express, React, and Supabase.

## Project Structure

```
real-talk-video-compiler/
├── src/
│   ├── backend/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.ts
│   └── frontend/
│       └── src/
├── dist/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Supabase account and project

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/real-talk-video-compiler.git
   cd real-talk-video-compiler
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your Supabase credentials.

### Development

Start the development server:
```
npm run dev
```

### Build

Build the project:
```
npm run build
```

### Production

Start the production server:
```
npm start
```

## Features

- Video uploading and processing
- Real-talk video compilation
- User authentication (via Supabase)
- Interactive video player

## License

ISC
# Real Talk Philosophy - AI-Powered Video Curation System (MVP)

## System Overview

This application will serve as a streamlined solution for Real Talk Philosophy events, focusing on the essential recording processing and AI-powered curation of philosophical discussions. The MVP will:

1. **Manage Video Recordings** - Organize recordings in projects and a central library
2. **Process Recordings via AI** - Use Claude 3.7 with RAG and prompt templates for intelligent video curation
3. **Create Master Compilations** - Generate timestamp lists for video editing based on AI analysis

## Technical Architecture

### Frontend
- React-based web application
- Dashboard for managing projects and recordings
- Simple video player for reviewing recordings
- Project management interface

### Backend
- Node.js server with Express.js
- Supabase for data storage (metadata, transcripts, AI results)
- Local storage for video files (with option to integrate cloud storage later)
- Task queue system for handling processing jobs

### AI/ML Components
- Claude 3.7 integration via API for all intelligent processing
- Assembly.ai integration for high-precision timestamped transcription
- RAG (Retrieval Augmented Generation) system for building comprehensive prompts
- Minimal video processing for MVP (export timestamp lists for manual editing)

## Key Integrations

### Required for MVP
- **Assembly.ai API** - For high-precision timestamped transcription
- **Claude 3.7 API** - For all AI-powered analysis and decision making
- **Supabase** - For database storage and user authentication

### Optional for Future Versions
- **OTP Studio API** - For potential browser-based video editing
- **YouTube, Instagram APIs** - For direct publishing of compiled videos
- **Zoom API** - For programmatic access to recordings
- **FFmpeg** - If automatic video compilation is added later
# Real Talk Philosophy - Core Features for MVP

## 1. Recording Management

### 1.1 Project Organization
- Create and manage projects (collections of related recordings)
- Add any recordings from library to specific projects
- Basic metadata for projects (title, description, date, status)
- Search and filter functionality for recordings library

### 1.2 Recording Metadata
- Upload recordings from local storage (Zoom recordings)
- Enter and store speaker information for each recording
- Name and tag each recording
- Basic playback functionality for review

## 2. AI-Powered Processing Pipeline

### 2.1 Precise Transcription with Assembly.ai
- High-precision timestamped transcription (to 0.1s accuracy)
- Speaker diarization with manual name assignment
- Map entered speaker names to diarized speakers (speaker1, speaker2, etc.)
- Store complete transcripts with timestamps in Supabase

### 2.2 Claude 3.7 Integration
- API integration with proper authentication
- RAG system for building context-aware prompts
- JSON response handling and parsing
- Processing pipeline orchestration

### 2.3 Content Analysis Process
- **Individual Video Summarization**:
  - Include full transcript text in prompt
  - Generate summary and tags
  - Store results in Supabase

- **Cross-Video Theme Analysis**:
  - Compile all video summaries and tags
  - Identify recurring themes and discussion points
  - Store theme analysis for later use

- **Noteworthy Excerpt Identification**:
  - Process each transcript with full context
  - Identify precise timestamp ranges for compelling excerpts
  - Store excerpts with detailed timestamp information

- **Final Script Generation**:
  - Generate ordered list of clips with precise start/end timestamps
  - Include video source name for each clip
  - Export as structured format for manual editing

## 3. Output Formats and Export Options

### 3.1 MVP Export Formats
- **Structured Edit List (CSV)** - Compatible with standard editing workflows
- **iMovie-Compatible Format** - For easy import into preferred editing tool
- **JSON Export** - Complete data for potential future integrations
- **Human-Readable Script** - Formatted document for manual reference

### 3.2 OTP Studio Potential (Post-MVP)
If OTP Studio integration proves valuable after MVP testing:

- **Direct API Integration** - Automated project creation in OTP Studio
- **EDL Export Format** - Edit Decision List format compatible with OTP Studio
- **Embedded Interface** - Potential embedding of OTP Studio within the application
- **Collaboration Features** - Leveraging OTP Studio's team editing capabilities

### 3.3 Additional Export Options for Future Consideration
- **Final Cut Pro XML** - For more advanced editing capabilities
- **Adobe Premiere Project Files** - For professional editing workflows
- **Podcast Format** - Audio-only exports with chapter markers
- **YouTube Chapter Markers** - Format for direct upload with chapters
- **Transcript Export** - SRT or VTT files for captioning
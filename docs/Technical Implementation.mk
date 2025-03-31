# Real Talk Philosophy - Technical Implementation Details

## Assembly.ai Integration

### High-Precision Transcription
- Configure for maximum timestamp precision (0.1s intervals)
- Use the following Assembly.ai features:
  - Diarization for speaker identification
  - Word-level timestamps for precise editing points
  - Punctuation and formatting for readable transcripts
- API implementation with proper error handling and retries
- Cache transcription results in Supabase to avoid redundant processing

### Speaker Mapping Interface
- UI component for manually assigning names to diarized speakers
- Simple drag-and-drop or dropdown interface
- Persistence of speaker mappings across project sessions
- Option to correct diarization errors manually

## Claude 3.7 Integration

### API Configuration
- Secure storage for Claude API credentials
- Rate limiting and batching for efficient processing
- Error handling with appropriate fallbacks
- Token usage optimization for large transcripts

### Prompt Management System
- Templating system with variable interpolation
- Context management for large document processing
- Chunking strategy for transcripts exceeding context limits
- Structured validation of JSON responses

### RAG Implementation
- Storage of processed content in structured format
- Retrieval strategies optimized for different processing stages
- Metadata enrichment for context enhancement
- Vector embedding option for future enhancement

## Supabase Implementation

### Data Structure
- Projects table (id, title, description, created_at, updated_at)
- Videos table (id, project_id, title, file_path, duration, created_at)
- Speakers table (id, video_id, name, diarization_label)
- Transcripts table (id, video_id, full_text, timestamps_json)
- Analyses table (id, video_id, analysis_type, result_json)
- Compilations table (id, project_id, script_json, created_at)

### File Storage
- Local file system for MVP video storage
- File path references stored in Supabase
- Option to integrate with Supabase Storage in future versions
- Backup strategy for important data

## User Interface

### Project Dashboard
- List of projects with basic metadata
- Creation and editing of project details
- Status indicators for processing stages
- Quick actions for common tasks

### Video Management
- Upload interface with progress indicators
- Basic playback functionality
- Speaker assignment interface
- Processing status and actions

### Analysis Viewer
- View generated summaries and themes
- Explore identified excerpts
- Review final compilation script
- Export options for edit list
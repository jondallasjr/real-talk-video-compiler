# Real Talk Philosophy - Detailed Processing Workflow

## 1. Recording Setup and Upload
- User creates a new project in the system
- User uploads Zoom recording files (MP4) to the system
- Files are stored locally with references saved in Supabase
- Basic metadata is captured (upload date, file size, duration)

## 2. Speaker Information
- User enters names of all speakers in each video
- System interface allows mapping names to detected speakers from diarization
- Speaker information is stored with the recording metadata

## 3. Transcription Process
- Assembly.ai API is used for high-precision transcription
- Configured for maximum timestamp precision (0.1s accuracy)
- Speaker diarization is applied to distinguish between speakers
- Complete transcript with precise timestamps is stored in Supabase
- User can review the transcript for accuracy

## 4. AI Analysis Pipeline (Using Claude 3.7)

### a. Individual Video Summarization
```
Prompt Template:
"""
You are analyzing a philosophical discussion transcript. Summarize the key points and identify important themes.

TRANSCRIPT:
{{full_transcript_text}}

SPEAKERS:
{{speaker_names_list}}

Summarize this transcript. Write concisely but go into technical detail where relevant. 
Write 100-500 words. Focus on the philosophical content and interesting insights.

Respond in JSON with the following keys:
- "reasoning": Your thought process for creating this summary
- "summary": Your concise summary of the discussion
- "tags": A list of keywords, topics, people, and questions mentioned

Start your response with {
"""
```
- Each transcript is processed individually
- JSON response is parsed and stored in Supabase
- Tags are extracted for later use

### b. Cross-Video Theme Analysis
```
Prompt Template:
"""
You are analyzing multiple philosophical discussions on similar topics.
Review these summaries and identify connections, themes, and patterns.

VIDEO SUMMARIES:
{{all_video_summaries_json}}

TAGS ACROSS VIDEOS:
{{all_tags_compiled}}

PROJECT TITLE:
{{project_title}}

Identify recurring themes, discussion topics, questions, points of contention,
moments of vulnerability/empathy across these conversations.

Respond in JSON with the following keys:
- "reasoning": Your analysis process
- "mainThemes": Major themes spanning multiple videos
- "discussionPoints": Key discussion points across videos
- "contentionPoints": Areas where speakers disagree or present contrasting views
- "empathyMoments": Examples of vulnerability or deep personal sharing
- "connections": Unexpected connections between different speakers or ideas

Start your response with {
"""
```
- Compiles all video summaries and tags
- JSON response is parsed and stored
- Theme analysis becomes part of the context for later steps

### c. Noteworthy Excerpt Identification
```
Prompt Template:
"""
You are curating excerpts from a philosophical discussion for a compilation video.
Identify the most compelling, insightful, or thought-provoking segments.

FULL TRANSCRIPT WITH TIMESTAMPS:
{{full_transcript_with_timestamps}}

VIDEO SUMMARY:
{{video_summary}}

PROJECT THEME ANALYSIS:
{{theme_analysis}}

VIDEO NAME:
{{video_name}}

Identify 5-10 noteworthy excerpts from this transcript that would work well in a compilation.
Look for:
- Clear explanations of philosophical concepts
- Personal insights or experiences
- Disagreements or contrasting perspectives
- Emotionally resonant moments
- Statements that connect to the identified themes
- Novel ideas or fresh perspectives

Each excerpt should be 10-45 seconds long (approximately 25-120 words).

Respond in JSON with an array of excerpts, each containing:
- "startTimestamp": Precise start time (HH:MM:SS.S)
- "endTimestamp": Precise end time (HH:MM:SS.S)
- "speakerName": Name of the speaker
- "text": The excerpt text
- "reason": Brief explanation of why this excerpt is noteworthy
- "themesAddressed": Which themes from the project analysis this addresses
- "videoName": The name of the source video

Start your response with {
"""
```
- Processes each video transcript with full context
- Uses precise timestamps for accurate excerpt identification
- JSON response is parsed and stored with video reference

### d. Creative Direction Planning
```
Prompt Template:
"""
You are planning a philosophical compilation video from selected excerpts across multiple recordings.
Think deeply about how to create a compelling and cohesive narrative.

ALL NOTEWORTHY EXCERPTS:
{{all_noteworthy_excerpts_json}}

PROJECT THEME ANALYSIS:
{{theme_analysis}}

PROJECT TITLE:
{{project_title}}

Think through the creative challenge of arranging these excerpts into a compelling video.
Consider:
- How to create a narrative arc that explores the philosophical topic
- How to balance different speakers and perspectives
- How to organize excerpts thematically vs chronologically
- How to create emotional resonance and intellectual engagement
- How to ensure clarity and coherence for viewers new to the topic

Respond in JSON with the following keys:
- "reasoning": Your detailed thought process (can be extensive)
- "creativeApproach": Overall creative strategy
- "narrativeStructure": Description of proposed narrative flow
- "challengesAndSolutions": Any potential issues and how to address them

Start your response with {
"""
```
- Provides space for Claude to think deeply about the creative approach
- JSON response is stored for reference in final compilation

### e. Final Script Generation
```
Prompt Template:
"""
You are creating the final script for a philosophical compilation video.
Based on your creative approach, arrange the excerpts into a cohesive sequence.

ALL AVAILABLE EXCERPTS:
{{all_noteworthy_excerpts_json}}

YOUR CREATIVE APPROACH:
{{creative_direction_json}}

PROJECT TITLE:
{{project_title}}

Create the final ordered compilation script. The script should:
- Form a cohesive philosophical exploration
- Balance different speakers and viewpoints
- Flow logically from one idea to the next
- Include appropriate transitions between conceptual sections
- Have a clear beginning, middle, and conclusion

Respond in JSON with an array of clip objects in sequence order, each containing:
- "videoName": Source video name
- "startTimestamp": Precise start time (HH:MM:SS.S)
- "endTimestamp": Precise end time (HH:MM:SS.S)
- "speakerName": Name of the speaker
- "text": The excerpt text
- "sectionTitle": Optional title for thematic sections
- "displayNotes": Any notes about how this should be displayed

Start your response with {
"""
```
- Generates the final ordered script with precise timestamps
- Includes video source name for each clip
- JSON is parsed and formatted for export

## 5. Output Generation
- Compile final script into downloadable format (JSON, CSV, FCPXML, etc.)
- Generate human-readable edit list with timecodes
- Option to export in format compatible with iMovie or other editing software
- Store final script in Supabase for future reference
// ============================================
// TONE OF VOICE ANALYSIS PROMPT
// Step 1: Analyze sample tweets to extract style
// ============================================
export const TONE_ANALYSIS_PROMPT = `You are an expert linguistic analyst specializing in social media writing styles.

Analyze the following sample tweets and extract the author's unique voice characteristics.

<sample_tweets>
{{SAMPLE_TWEETS}}
</sample_tweets>

Provide a detailed analysis in the following JSON format:

{
  "formality": 0.0-1.0,        // 0 = very casual, 1 = very formal
  "humor": 0.0-1.0,            // 0 = serious, 1 = highly humorous
  "energy": 0.0-1.0,           // 0 = calm/measured, 1 = high energy/enthusiastic
  "directness": 0.0-1.0,       // 0 = indirect/nuanced, 1 = blunt/direct
  "emoji_usage": "none|rare|moderate|frequent",
  "avg_sentence_length": "short|medium|long",
  "vocabulary_level": "simple|conversational|sophisticated|technical",
  "signature_phrases": ["phrase1", "phrase2"],  // Up to 5 recurring patterns
  "punctuation_style": "minimal|standard|expressive",  // !!! vs .
  "capitalization": "standard|emphasis|shouting",
  "paragraph_breaks": true/false,  // Uses line breaks for emphasis
  "hashtag_style": "none|minimal|moderate|heavy",
  "question_frequency": "rare|occasional|frequent",
  "call_to_action_style": "none|subtle|direct",
  "key_themes": ["theme1", "theme2"],  // Main topics
  "writing_summary": "A 2-3 sentence summary of this voice"
}

Return ONLY valid JSON, no markdown or explanation.`;

// ============================================
// CONTENT GENERATION PROMPT
// Step 2: Generate content matching the voice
// ============================================
export const GENERATION_PROMPT = `You are a viral Twitter/X content creator.

Your task: Generate a tweet based on the provided context that matches the specified tone of voice.

<tone_profile>
{{TONE_PROFILE}}
</tone_profile>

<reference_examples>
{{SAMPLE_TWEETS}}
</reference_examples>

<source_content>
{{SOURCE_CONTENT}}
</source_content>

<user_instructions>
{{USER_INSTRUCTIONS}}
</user_instructions>

Requirements:
1. Match the voice characteristics EXACTLY (formality, humor, energy, etc.)
2. Use similar sentence structures and vocabulary
3. Include signature phrases naturally if they fit
4. Stay under 280 characters unless thread mode is requested
5. Make it ENGAGING - use hooks, create curiosity, drive interaction
6. If the tone uses emojis, include them appropriately
7. Mirror the punctuation and capitalization style

Output format:
- Single tweet: Return just the tweet text
- Thread mode: Return each tweet on a new line, numbered (1/, 2/, etc.)

Generate the tweet now:`;

// ============================================
// VIRAL SCORING PROMPT
// Analyze generated content for engagement potential
// ============================================
export const VIRAL_SCORING_PROMPT = `You are a social media engagement analyst.

Analyze this tweet for viral potential:

<tweet>
{{TWEET_CONTENT}}
</tweet>

Score each dimension 0-100 and provide brief reasoning:

{
  "overall": 0-100,
  "breakdown": {
    "hook_strength": {
      "score": 0-100,
      "reasoning": "Why this score"
    },
    "readability": {
      "score": 0-100,
      "reasoning": "Sentence length, clarity, scanability"
    },
    "whitespace": {
      "score": 0-100,
      "reasoning": "Visual breaks, line usage, not wall-of-text"
    },
    "emotional_pull": {
      "score": 0-100,
      "reasoning": "Curiosity, controversy, relatability, FOMO"
    },
    "cta_clarity": {
      "score": 0-100,
      "reasoning": "Clear next action for reader (engage, share, click)"
    },
    "uniqueness": {
      "score": 0-100,
      "reasoning": "Novel take vs generic advice"
    }
  },
  "suggestions": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2"
  ]
}

Return ONLY valid JSON.`;

// ============================================
// YOUTUBE CONTENT EXTRACTION PROMPT
// Extract tweetable insights from transcripts
// ============================================
export const YOUTUBE_EXTRACTION_PROMPT = `You are a content strategist extracting viral tweet opportunities from video content.

<transcript>
{{TRANSCRIPT}}
</transcript>

<video_metadata>
Title: {{TITLE}}
Channel: {{CHANNEL}}
</video_metadata>

Extract 5-7 "golden nuggets" - insights that would make excellent standalone tweets.

For each nugget, provide:
{
  "nuggets": [
    {
      "insight": "The core insight in 1-2 sentences",
      "quote": "Direct quote if available (or null)",
      "timestamp": "Approximate timestamp if detectable",
      "tweet_angle": "How to frame this as a tweet",
      "hook_suggestion": "A compelling opening line"
    }
  ],
  "video_summary": "2-3 sentence summary of the video",
  "main_themes": ["theme1", "theme2", "theme3"]
}

Focus on:
- Counterintuitive insights
- Actionable advice
- Quotable moments
- Controversial takes
- Data points or statistics

Return ONLY valid JSON.`;

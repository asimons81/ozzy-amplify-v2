import { google } from 'googleapis';

const youtube = google.youtube('v3');

interface TranscriptResult {
  success: boolean;
  transcript?: string;
  metadata?: {
    title: string;
    channel: string;
    duration: string;
    publishedAt: string;
  };
  error?: string;
  method: 'api' | 'fallback';
}

// Extract video ID from various URL formats
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Primary: YouTube Data API with captions
export async function getYouTubeTranscript(
  videoUrl: string
): Promise<TranscriptResult> {
  const videoId = extractVideoId(videoUrl);
  
  if (!videoId) {
    return { success: false, error: 'Invalid YouTube URL', method: 'api' };
  }

  try {
    // Get video metadata
    const videoResponse = await youtube.videos.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ['snippet' as any, 'contentDetails' as any],
      id: [videoId],
    });

    const video = videoResponse.data.items?.[0];
    if (!video) {
      return { success: false, error: 'Video not found', method: 'api' };
    }

    const metadata = {
      title: video.snippet?.title || 'Unknown',
      channel: video.snippet?.channelTitle || 'Unknown',
      duration: video.contentDetails?.duration || 'Unknown',
      publishedAt: video.snippet?.publishedAt || 'Unknown',
    };

    // Try to get captions
    // Note: Downloading captions requires OAuth, so we use fallback for transcript content
    const transcript = await fetchTranscriptFallback(videoId);
    return {
      success: true,
      transcript,
      metadata,
      method: 'fallback',
    };

  } catch (error) {
    console.error('YouTube API error:', error);
    
    // Attempt fallback
    try {
      const transcript = await fetchTranscriptFallback(videoId);
      return {
        success: true,
        transcript,
        method: 'fallback',
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: 'Failed to extract transcript',
        method: 'fallback',
      };
    }
  }
}

// Fallback: Use youtube-transcript library
async function fetchTranscriptFallback(videoId: string): Promise<string> {
  const { YoutubeTranscript } = await import('youtube-transcript');
  
  const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
  
  return transcriptItems
    .map((item) => item.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

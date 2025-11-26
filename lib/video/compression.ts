/**
 * Video Compression Utilities
 *
 * Client-side video compression before upload to reduce:
 * - Upload time
 * - Storage costs
 * - AI analysis time
 *
 * Refinement.md:54-63 - Added video compression to improve performance
 */

/**
 * Video compression configuration
 */
export const VIDEO_CONFIG = {
  MAX_FILE_SIZE_MB: 50, // Maximum file size after compression
  MAX_DURATION_SECONDS: 300, // 5 minutes max
  TARGET_WIDTH: 1280, // 720p width
  TARGET_HEIGHT: 720,
  TARGET_BITRATE: 1500000, // 1.5 Mbps
  TARGET_FRAMERATE: 30,
  AUDIO_BITRATE: 128000, // 128 kbps
} as const;

/**
 * Check if video meets requirements without compression
 */
export function checkVideoRequirements(file: File): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file type
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
  if (!validTypes.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Please use MP4, WebM, or MOV format.`);
  }

  // Check file size (100MB hard limit before compression)
  const maxSizeBytes = 100 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 100MB.`);
  } else if (file.size > VIDEO_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
    warnings.push(
      `File is large (${(file.size / 1024 / 1024).toFixed(1)}MB). We'll compress it to under ${VIDEO_CONFIG.MAX_FILE_SIZE_MB}MB.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get video metadata (duration, dimensions)
 */
export async function getVideoMetadata(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
  size: number;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
      });
    };

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Compress video file using browser APIs (WebCodecs)
 *
 * Note: This is a placeholder for future implementation.
 * For now, we'll use file size validation and recommend users to compress manually.
 *
 * Full implementation would require:
 * - WebCodecs API (Chrome 94+)
 * - or FFmpeg.wasm for broader compatibility
 * - or integration with cloud transcoding service
 */
export async function compressVideo(
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  // Check if compression is needed
  const metadata = await getVideoMetadata(file);

  if (metadata.duration > VIDEO_CONFIG.MAX_DURATION_SECONDS) {
    throw new Error(
      `Video too long: ${Math.ceil(metadata.duration / 60)} minutes. Maximum is ${VIDEO_CONFIG.MAX_DURATION_SECONDS / 60} minutes.`
    );
  }

  // If file is already small enough, return as-is
  if (file.size <= VIDEO_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
    onProgress?.(100);
    return file;
  }

  // TODO: Implement actual compression
  // For now, reject files that are too large
  throw new Error(
    `Video file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). ` +
      `Please compress it to under ${VIDEO_CONFIG.MAX_FILE_SIZE_MB}MB using a tool like HandBrake or CloudConvert before uploading.`
  );

  /* Future implementation with FFmpeg.wasm:

  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  // Write file to FFmpeg virtual filesystem
  ffmpeg.FS('writeFile', file.name, await fetchFile(file));

  // Compress with H.264 codec
  await ffmpeg.run(
    '-i', file.name,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-vf', `scale=${VIDEO_CONFIG.TARGET_WIDTH}:${VIDEO_CONFIG.TARGET_HEIGHT}`,
    '-r', String(VIDEO_CONFIG.TARGET_FRAMERATE),
    '-c:a', 'aac',
    '-b:a', String(VIDEO_CONFIG.AUDIO_BITRATE),
    'output.mp4'
  );

  // Read compressed file
  const data = ffmpeg.FS('readFile', 'output.mp4');
  const compressedFile = new File([data.buffer], file.name, {
    type: 'video/mp4',
  });

  return compressedFile;
  */
}

/**
 * Estimate compressed file size
 */
export function estimateCompressedSize(
  originalSize: number,
  duration: number
): number {
  // Rough estimate: (bitrate * duration) / 8
  const videoBitrate = VIDEO_CONFIG.TARGET_BITRATE;
  const audioBitrate = VIDEO_CONFIG.AUDIO_BITRATE;
  const totalBitrate = videoBitrate + audioBitrate;

  const estimatedBytes = (totalBitrate * duration) / 8;

  // Add 10% overhead for container format
  return Math.ceil(estimatedBytes * 1.1);
}

/**
 * Generate video thumbnail from video file
 */
export async function generateThumbnail(
  file: File,
  seekTo: number = 1.0
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    video.onloadedmetadata = () => {
      // Seek to specific time
      video.currentTime = Math.min(seekTo, video.duration);
    };

    video.onseeked = () => {
      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);

      // Cleanup
      window.URL.revokeObjectURL(video.src);

      resolve(thumbnail);
    };

    video.onerror = () => {
      reject(new Error('Failed to generate thumbnail'));
    };

    video.src = URL.createObjectURL(file);
    video.load();
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

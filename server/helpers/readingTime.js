function estimateReadingTime(post) {
  // Assuming average reading speed is 200 words per minute
  const wordsPerMinute = 250;

  // Calculate number of words in the post
  const wordCount = post.split(/\s+/).length;

  // Calculate reading time in minutes
  const readingTimeInMinutes = wordCount / wordsPerMinute;

  // Convert reading time to seconds
  const readingTimeInSeconds = Math.ceil(readingTimeInMinutes * 60);

  return readingTimeInSeconds;
}

module.exports = estimateReadingTime;
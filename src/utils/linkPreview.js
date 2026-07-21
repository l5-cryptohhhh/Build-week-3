const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov)(\?.*)?$/i
const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/i

export function getLinkType(url) {
  if (!url) return null
  if (url.startsWith('data:image/')) return 'image'
  if (url.startsWith('data:video/')) return 'video'
  if (IMAGE_EXTENSIONS.test(url)) return 'image'
  if (VIDEO_EXTENSIONS.test(url)) return 'video'
  if (YOUTUBE_REGEX.test(url)) return 'youtube'
  return 'link'
}

export function getYoutubeEmbedUrl(url) {
  const match = url.match(YOUTUBE_REGEX)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

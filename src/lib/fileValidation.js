export const MAX_IMAGE_MB = 5
export const MAX_VIDEO_MB = 50

// svg는 이미지 MIME이지만 내부에 <script>를 담을 수 있어 제외한다(저장소 도메인 저장형 XSS 방지).
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

// 이미지/동영상 업로드 전 형식·용량 체크. 문제 없으면 null, 있으면 사용자에게 보여줄 메시지를 반환한다.
export function validateMediaFile(file) {
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  if (!isVideo && !isImage) {
    return `${file.name}은(는) 지원하지 않는 파일 형식이에요. (jpg/png/gif/webp, mp4/webm/mov만 가능)`
  }
  const maxMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB
  if (file.size > maxMB * 1024 * 1024) {
    return `${file.name} 파일이 너무 커요. (최대 ${maxMB}MB)`
  }
  return null
}

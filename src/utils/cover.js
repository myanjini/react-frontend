const ALLOWED_EXT = ['.jpg', '.jpeg', '.png'];
const MAX_BYTES = 2 * 1024 * 1024;

// 업로드 전에 브라우저에서 미리 확인합니다. 사용자 편의를 위한 검사이며
// 최종 판단(415, 413, 422)은 백엔드가 합니다.
export function precheckCover(file) {
  const name = file.name.toLowerCase();
  if (!ALLOWED_EXT.some((ext) => name.endsWith(ext))) return 'jpg, jpeg, png 파일만 올릴 수 있습니다.';
  if (file.size === 0) return '빈 파일입니다.';
  if (file.size > MAX_BYTES) return '2MB 이하 파일만 올릴 수 있습니다.';
  return null;
}

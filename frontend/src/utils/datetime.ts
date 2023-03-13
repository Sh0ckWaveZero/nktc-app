export function calculateTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSeconds < 60) {
    return "เมื่อสักครู่นี้";
  } else if (diffMinutes < 60) {
    return `เมื่อ ${diffMinutes} นาทีที่แล้ว`;
  } else if (diffHours < 24) {
    return `เมื่อ ${diffHours} ชั่วโมงที่แล้ว`;
  } else if (diffDays < 7) {
    return `เมื่อ ${diffDays} วันที่แล้ว`;
  } else {
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
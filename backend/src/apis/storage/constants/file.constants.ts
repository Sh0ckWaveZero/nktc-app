export enum AppMimeType {
  IMAGE_PNG = 'image/png',
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_WEBP = 'image/webp',
  IMAGE_GIF = 'image/gif',
  IMAGE_SVG = 'image/svg+xml',
}

export const ALLOWED_IMAGE_MIME_TYPES: AppMimeType[] = [
  AppMimeType.IMAGE_PNG,
  AppMimeType.IMAGE_JPEG,
  AppMimeType.IMAGE_WEBP,
  AppMimeType.IMAGE_GIF,
];
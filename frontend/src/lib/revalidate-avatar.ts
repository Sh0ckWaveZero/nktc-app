import { revalidateTag } from 'next/cache';

const REVALIDATE_PROFILE = 'max';

/**
 * Revalidate avatar cache
 *
 * Use this function in Server Actions or Route Handlers to invalidate
 * cached avatar images when they are updated.
 *
 * Reference: https://nextjs.org/docs/app/getting-started/caching-and-revalidating
 *
 * @param avatarPath - Optional specific avatar path to revalidate. If not provided, revalidates all avatars.
 */
export async function revalidateAvatarCache(avatarPath?: string) {
  if (avatarPath) {
    // Revalidate specific avatar
    revalidateTag(`avatar-${avatarPath}`, REVALIDATE_PROFILE);
  } else {
    // Revalidate all avatars
    revalidateTag('avatar', REVALIDATE_PROFILE);
  }
}

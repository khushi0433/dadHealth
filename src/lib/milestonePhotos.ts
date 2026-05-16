export const MILESTONE_PHOTO_BUCKET = "milestone-photos";
export const MILESTONE_PHOTO_MAX_EDGE = 1200;
export const MILESTONE_PHOTO_CLIENT_MAX_EDGE = 1600;
export const MILESTONE_PHOTO_CLIENT_MAX_MB = 2;
export const MILESTONE_STORAGE_LIMIT_BYTES = 500 * 1024 * 1024;
export const MILESTONE_STORAGE_WARN_BYTES = 450 * 1024 * 1024;

export function milestonePhotoPath(userId: string, milestoneId: string) {
  return `${userId}/${milestoneId}.jpg`;
}

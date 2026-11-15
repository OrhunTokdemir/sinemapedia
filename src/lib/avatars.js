// Built-in profile pictures (public/avatars). Users without their own image get one picked from their id.
export const DEFAULT_AVATARS = [
  { id: "popcorn", src: "/avatars/popcorn.svg", label: "Popcorn" },
  { id: "reel", src: "/avatars/reel.svg", label: "Film reel" },
  { id: "camera", src: "/avatars/camera.svg", label: "Movie camera" },
  { id: "glasses", src: "/avatars/glasses.svg", label: "3D glasses" },
];

export function isDefaultAvatar(src) {
  return DEFAULT_AVATARS.some((a) => a.src === src);
}

/** Stable default for a user id (simple string hash). */
export function defaultAvatarFor(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return DEFAULT_AVATARS[Math.abs(h) % DEFAULT_AVATARS.length].src;
}

/** The picture to show for a user: their own image, else their automatic default. */
export function avatarSrc(user) {
  return user?.image || defaultAvatarFor(user?.id ?? user?.username ?? "");
}

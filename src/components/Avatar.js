import { avatarSrc } from "@/lib/avatars";

/** Round profile picture; falls back to the user's automatic default avatar. */
export default function Avatar({ user, size = 36, className = "" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- user-provided URLs from any https host
    <img
      src={avatarSrc(user)}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full bg-surface object-cover ${className}`}
    />
  );
}

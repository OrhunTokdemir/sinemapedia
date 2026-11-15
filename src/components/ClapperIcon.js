/** Clapperboard icon: marks Sinemapedia (community) ratings. TMDB ratings use ★. */
export default function ClapperIcon({ className = "h-3.5 w-3.5", filled = true, title }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block shrink-0 align-[-0.125em] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* clapper stick with stripes */}
      <path d="M3.5 8.5 19.6 4.2l-.9-3.1L2.6 5.4z" fill={filled ? "currentColor" : "none"} transform="translate(0 1.6)" />
      {/* slate body */}
      <rect x="3" y="10" width="18" height="11" rx="1.5" fill={filled ? "currentColor" : "none"} />
    </svg>
  );
}

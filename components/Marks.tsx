export function XMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="X">
      <path
        d="M22 22 L78 78 M78 22 L22 78"
        stroke="currentColor"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
        pathLength={100}
        className="draw-stroke text-xcolor"
      />
    </svg>
  );
}

export function OMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="O">
      <circle
        cx="50"
        cy="50"
        r="29"
        stroke="currentColor"
        strokeWidth="13"
        fill="none"
        pathLength={100}
        className="draw-stroke text-ocolor"
      />
    </svg>
  );
}

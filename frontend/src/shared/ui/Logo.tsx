export function LogoIcon({ size = 38 }: { size?: number }) {
  const radius = size <= 28 ? 7 : 10;
  return (
    <div
      className="logo-icon"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
      }}
    >
      <svg
        width={size * 0.52}
        height={size * 0.52}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    </div>
  );
}

export function LogoWordmark({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <span className={`logo-wordmark logo-wordmark--${size}`}>Task Manager</span>
  );
}

export function Logo({ iconSize = 38, wordmarkSize = "lg" }: { iconSize?: number; wordmarkSize?: "lg" | "sm" }) {
  return (
    <div className="logo">
      <LogoIcon size={iconSize} />
      <LogoWordmark size={wordmarkSize} />
    </div>
  );
}

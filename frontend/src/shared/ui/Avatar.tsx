import { avatarColor, initialsFromName } from "../theme/design";

export function Avatar({
  name,
  seed,
  size = 30,
  className = "",
}: {
  name: string;
  seed?: string;
  size?: number;
  className?: string;
}) {
  const bg = avatarColor(seed ?? name);
  const fontSize = size <= 22 ? 8 : size <= 26 ? 10 : 11;

  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize,
      }}
      title={name}
    >
      {initialsFromName(name)}
    </div>
  );
}

import { useMemo, useState } from "react";
import { toAssetUrl } from "../../utils/assetUrl";

type Props = {
  /** Can be absolute (https://...) or relative (/uploads/...) */
  src?: string | null;
  alt?: string;
  size?: number; // px
  className?: string;
  /** Local fallback inside your UI public/assets */
  fallbackSrc?: string; // e.g. "/images/default-avatar.png"
};

export default function Avatar({
  src,
  alt = "Avatar",
  size = 40,
  className = "",
  fallbackSrc = "/images/default-avatar.png",
}: Props) {
  const [failed, setFailed] = useState(false);

  const finalSrc = useMemo(() => {
    if (failed) return fallbackSrc;

    const v = (src || "").trim();
    if (!v) return fallbackSrc;

    // If it's /uploads/... make it absolute using API base
    return toAssetUrl(v) || fallbackSrc;
  }, [src, failed, fallbackSrc]);

  return (
    <img
      src={finalSrc}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

import React from "react";
import type { IconProps } from "./IconBusca";

const IconConcierge: React.FC<IconProps> = ({
  size = 56,
  className,
  title = "AI Concierge",
  color = "#060D1C",
  variant = "full",
  ariaHidden = false,
}) => {
  const viewBox = variant === "micro" ? "0 0 32 32" : "0 0 64 64";
  const s = variant === "micro" ? 32 : 64;
  const titleId = `icon-conc-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      aria-labelledby={titleId}
      aria-hidden={ariaHidden}
      className={className}
      role={ariaHidden ? undefined : "img"}
      xmlns="http://www.w3.org/2000/svg"
    >
      {!ariaHidden && <title id={titleId}>{title}</title>}
      <rect width={s} height={s} rx={s * 0.16} fill="#FFFFFF" stroke="rgba(6,13,28,0.04)" />
      <g transform={`translate(${s * 0.12}, ${s * 0.12}) scale(${(s * 0.76) / 24})`}>
        <rect x="4" y="3" width="16" height="11" rx="3" fill="#F4F7FA" />
        <circle cx="9" cy="8" r="1.3" fill={color} />
        <circle cx="15" cy="8" r="1.3" fill={color} />
        <path d="M8.2 12 Q12 14 15.8 12" stroke={color} strokeWidth="0.7" fill="none" />
        <path d="M3 8 C3 10 3 12 3 14 Q4 16 6 16" stroke={color} strokeWidth="1.2" fill="none" />
        <path d="M21 8 C21 10 21 12 21 14 Q20 16 18 16" stroke={color} strokeWidth="1.2" fill="none" />
        <rect x="9" y="17" width="6" height="3" rx="0.8" fill="#F0C72F" />
      </g>
    </svg>
  );
};

export default IconConcierge;

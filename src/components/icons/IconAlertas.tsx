import React from "react";
import type { IconProps } from "./IconBusca";

const IconAlertas: React.FC<IconProps> = ({
  size = 56,
  className,
  title = "Alertas inteligentes",
  color = "#4896C7",
  variant = "full",
  ariaHidden = false,
}) => {
  const viewBox = variant === "micro" ? "0 0 32 32" : "0 0 64 64";
  const s = variant === "micro" ? 32 : 64;
  const titleId = `icon-alertas-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      className={className}
      role={ariaHidden ? undefined : "img"}
      aria-hidden={ariaHidden}
      aria-labelledby={ariaHidden ? undefined : titleId}
      xmlns="http://www.w3.org/2000/svg"
    >
      {!ariaHidden && <title id={titleId}>{title}</title>}
      <rect width={s} height={s} rx={s * 0.16} fill="#FFFFFF" stroke="rgba(6,13,28,0.04)" />
      <g transform={`translate(${s * 0.12}, ${s * 0.12}) scale(${(s * 0.76) / 24})`}>
        <path d="M12 2 C8.5 2 6 5 6 8 L6 12 L4 14 L4 16 H20 L20 14 L18 12 L18 8 C18 5 15.5 2 12 2 Z" fill={color} />
        <circle cx="12" cy="18" r="2" fill="rgba(6,13,28,0.08)" />
        <circle cx="20" cy="4" r="3" fill="#F0C72F" />
      </g>
    </svg>
  );
};

export default IconAlertas;

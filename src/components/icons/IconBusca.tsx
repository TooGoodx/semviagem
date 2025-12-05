import React from "react";

export type IconProps = {
  size?: number;
  className?: string;
  title?: string;
  color?: string;
  variant?: "full" | "micro";
  ariaHidden?: boolean;
};

const IconBusca: React.FC<IconProps> = ({
  size = 56,
  className,
  title = "Busca de voos",
  color = "#F0C72F",
  variant = "full",
  ariaHidden = false,
}) => {
  const viewBox = variant === "micro" ? "0 0 32 32" : "0 0 64 64";
  const s = variant === "micro" ? 32 : 64;
  const titleId = `icon-busca-${Math.random().toString(36).slice(2, 8)}`;

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
      <rect x="0" y="0" width={s} height={s} rx={s * 0.16} fill="#FFFFFF" stroke="rgba(6,13,28,0.04)" />
      <g transform={`translate(${s * 0.06}, ${s * 0.06}) scale(${(s * 0.88) / 24})`}>
        <rect width="24" height="24" rx="4" fill="transparent" />
        <path d="M12 2 L15.2 9.4 L22 11.2 L15.2 13.1 L12 20 L10 13.1 L3.2 11.2 L10 9.4 Z" fill={color}/>
        <path d="M12 6 L13 9 L15.8 10 L13 11.2 L12 14 L11 11.2 L8.2 10 L11 9 Z" fill="rgba(6,13,28,0.06)" />
      </g>
    </svg>
  );
};

export default IconBusca;

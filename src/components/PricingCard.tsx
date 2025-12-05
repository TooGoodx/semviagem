import React from "react";
import IconBusca from "./icons/IconBusca";
import IconAlertas from "./icons/IconAlertas";
import IconConcierge from "./icons/IconConcierge";

interface CardProps {
  variant: "busca" | "alertas" | "concierge";
  title: string;
  price?: string;
  priceSub?: string;
  bullets: string[];
  badge?: string;
  ctaPrimary: { label: string; href?: string; onClick?: () => void };
  ctaSecondary?: { label: string; href?: string; onClick?: () => void };
}

export default function PricingCard({
  variant,
  title,
  price,
  priceSub,
  bullets,
  badge,
  ctaPrimary,
  ctaSecondary,
}: CardProps) {
  const Icon =
    variant === "busca"
      ? IconBusca
      : variant === "alertas"
      ? IconAlertas
      : IconConcierge;

  // Determinar se deve mostrar badge "EM BREVE" com estilo subdued
  const isComingSoon = badge === "EM BREVE";
  const badgeClasses = isComingSoon
    ? "text-[11.5px] px-[10px] py-[2px] rounded-[var(--ds-radius-sm)] bg-[rgba(240,199,47,0.18)] text-[var(--ds-brand-dark)] font-semibold"
    : "text-[12px] px-[var(--ds-spacing-sm)] py-[var(--ds-spacing-xs)] rounded-[var(--ds-radius-sm)] bg-[var(--ds-brand-yellow)] text-[var(--ds-brand-dark)] font-semibold";

  // Mostrar prova social APENAS no card "AI Agent Alertas"
  const showSocialProof = variant === "alertas";

  return (
    <article className="bg-[var(--ds-neutral-100)] rounded-[var(--ds-radius-lg)] shadow-[var(--ds-shadow-card)] p-[var(--ds-spacing-lg)] md:p-[var(--ds-spacing-xl)] flex flex-col h-full hover:shadow-[var(--ds-shadow-card-hover)] hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start gap-[var(--ds-spacing-sm)] mb-[var(--ds-spacing-md)]">
        <div className="w-16 h-16 p-[var(--ds-spacing-sm)] rounded-[var(--ds-radius-md)] bg-[var(--ds-neutral-100)] shadow-[var(--ds-shadow-sm)] flex items-center justify-center">
          <Icon size={40} ariaHidden />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-[var(--ds-spacing-sm)]">
            <h3 className="text-[clamp(18px,1.6vw,20px)] font-semibold text-[var(--ds-text-primary)]">
              {title}
            </h3>

            {badge && (
              <span className={badgeClasses}>
                {badge}
              </span>
            )}
          </div>

          {price && (
            <p
              className="text-[clamp(22px,3vw,28px)] font-bold text-[var(--ds-text-primary)]"
              style={{ marginTop: 'calc(var(--ds-spacing-xs) * 1.5)' }}
            >
              {price}{" "}
              <span className="text-[13px] text-[var(--ds-text-muted)]">{priceSub}</span>
            </p>
          )}
        </div>
      </div>

      <ul className="mt-[var(--ds-spacing-sm)] flex-1 space-y-[var(--ds-spacing-sm)] text-[13px] text-[var(--ds-text-muted)]">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start">
            <span className="w-[var(--ds-spacing-sm)] h-[var(--ds-spacing-sm)] mt-[var(--ds-spacing-xs)] mr-[var(--ds-spacing-sm)] rounded-full bg-[var(--ds-brand-yellow)] flex-shrink-0"></span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-[var(--ds-spacing-md)] flex gap-[var(--ds-spacing-sm)]">
        {ctaPrimary.href ? (
          <a
            href={ctaPrimary.href}
            target={ctaPrimary.href.startsWith('http') ? '_blank' : undefined}
            rel={ctaPrimary.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex-1 py-[var(--ds-spacing-sm)] rounded-[var(--ds-radius-md)] text-[var(--ds-neutral-100)] font-semibold bg-[var(--ds-brand-dark)] shadow-[var(--ds-shadow-card)] hover:shadow-[var(--ds-shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 text-center flex items-center justify-center"
          >
            {ctaPrimary.label}
          </a>
        ) : (
          <button
            onClick={ctaPrimary.onClick}
            className="flex-1 py-[var(--ds-spacing-sm)] rounded-[var(--ds-radius-md)] text-[var(--ds-neutral-100)] font-semibold bg-[var(--ds-brand-dark)] shadow-[var(--ds-shadow-card)] hover:shadow-[var(--ds-shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200"
          >
            {ctaPrimary.label}
          </button>
        )}

        {ctaSecondary && (
          <a
            href={ctaSecondary.href}
            target={ctaSecondary.href?.startsWith('http') ? '_blank' : undefined}
            rel={ctaSecondary.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="px-[var(--ds-spacing-md)] py-[var(--ds-spacing-sm)] rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-light)] text-[var(--ds-brand-dark)] hover:bg-[var(--ds-neutral-light)] transition-colors duration-200"
          >
            {ctaSecondary.label}
          </a>
        )}
      </div>

      {showSocialProof && (
        <p className="text-[13px] text-[var(--ds-text-muted)] mt-[var(--ds-spacing-sm)] text-center font-semibold" style={{ marginTop: '10px' }}>
          📈 +30.000 alertas enviados neste mês
        </p>
      )}
    </article>
  );
}

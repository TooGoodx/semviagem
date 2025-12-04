import React from 'react';

interface ProductCardProps {
  title: string;
  price?: string;
  priceLabel?: string;
  bullets: string[];
  icon: string;
  iconAlt: string;
  ctaText: string;
  ctaHref?: string;
  ctaAction?: () => void;
  badge?: string;
  comingSoon?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  price,
  priceLabel = 'a partir de',
  bullets,
  icon,
  iconAlt,
  ctaText,
  ctaHref,
  ctaAction,
  badge,
  comingSoon = false
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (ctaAction) {
      e.preventDefault();
      ctaAction();
    }
  };

  const CardContent = (
    <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 h-full flex flex-col">
      {/* Badge "MAIS POPULAR" */}
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
          {badge}
        </div>
      )}

      {/* Ícone */}
      <div className="flex justify-center mb-6">
        <img
          src={icon}
          alt={iconAlt}
          className="w-20 h-20 object-contain"
          loading="lazy"
        />
      </div>

      {/* Título */}
      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
        {title}
      </h3>

      {/* Preço ou "Em breve" */}
      {comingSoon ? (
        <div className="text-center mb-6">
          <p className="text-xl font-semibold text-gray-500 italic">Em breve</p>
        </div>
      ) : price ? (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">{priceLabel}</p>
          <p className="text-3xl font-bold text-gray-900">{price}</p>
        </div>
      ) : null}

      {/* Border accent amarelo */}
      <div className="w-16 h-1 bg-yellow-400 mx-auto mb-6 rounded-full"></div>

      {/* Lista de bullets com bolinhas amarelas */}
      <ul className="space-y-3 mb-8 flex-grow">
        {bullets.map((bullet, index) => (
          <li key={index} className="flex items-start">
            <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span className="text-gray-700 text-sm leading-relaxed">{bullet}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {ctaHref ? (
        <a
          href={ctaHref}
          target={ctaHref.startsWith('http') ? '_blank' : '_self'}
          rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg text-center block"
          aria-label={`${ctaText} - ${title}`}
        >
          {ctaText}
        </a>
      ) : (
        <button
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg"
          aria-label={`${ctaText} - ${title}`}
        >
          {ctaText}
        </button>
      )}
    </div>
  );

  return CardContent;
};

export default ProductCard;

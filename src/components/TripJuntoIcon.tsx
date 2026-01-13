import React from 'react';

interface TripJuntoIconProps {
  size?: number;
  className?: string;
}

const TripJuntoIcon: React.FC<TripJuntoIconProps> = ({ size = 40, className = "" }) => {
  return (
    <img
      src="/logo-icon.png"
      alt="TripJunto"
      className={className}
      style={{
        width: size,
        height: size
      }}
    />
  );
};

export default TripJuntoIcon;

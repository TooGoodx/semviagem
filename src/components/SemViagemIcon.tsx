import React from 'react';

interface SemViagemIconProps {
  size?: number;
  className?: string;
}

const SemViagemIcon: React.FC<SemViagemIconProps> = ({ size = 40, className = "" }) => {
  return (
    <img 
      src="/logo-icon.png" 
      alt="SemViagem" 
      className={className}
      style={{ 
        width: size,
        height: size
      }}
    />
  );
};

export default SemViagemIcon;

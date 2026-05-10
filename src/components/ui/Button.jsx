import React from 'react';

const Button = ({ children, onClick, className = '', variant = 'cyber', type = 'button', ...props }) => {
  
  // Estilos base para todos los botones
  const baseStyle = "relative inline-flex items-center justify-center px-6 py-3 font-bold rounded-xl transition-all duration-300 overflow-hidden";
  
  // Variantes de colores neón según tu diseño
  const variants = {
    cyber: "btn-cyber", // Usa el CSS que pusimos en styles.css
    cyan: "btn-cyan",
    outline: "border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 shadow-[inset_0_0_10px_rgba(99,102,241,0.2)] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]",
    ghost: "text-gray-300 hover:text-white hover:bg-white/5"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant] || variants.cyber} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
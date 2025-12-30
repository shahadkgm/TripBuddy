// src/components/shared/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'alert';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ variant = 'primary', size = 'md', className = "", children, ...props }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 shadow-md transform hover:scale-105";
  
  const variants = {
  primary: "bg-[#5537ee] text-white hover:bg-opacity-90",
  alert: "bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center", 
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
};

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
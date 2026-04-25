import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean;
}

export const Logo: FC<LogoProps> = ({ className = '', size = 'md', dark = false }) => {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl md:text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl md:text-5xl',
  };

  return (
    <div
      onClick={() => navigate('/')}
      className={`font-black tracking-tighter cursor-pointer select-none transition-all hover:opacity-80 active:scale-95 ${sizeClasses[size]} ${className}`}
    >
      <span className={dark ? 'text-white' : 'text-slate-900'}>Trip</span>
      <span className="text-indigo-600">Buddy</span>
    </div>
  );
};

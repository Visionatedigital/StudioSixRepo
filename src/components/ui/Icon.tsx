import { 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  name: 'check-circle' | 'alert-circle' | 'mail' | 'spinner';
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const icons = {
    'check-circle': CheckCircle,
    'alert-circle': AlertCircle,
    'mail': Mail,
    'spinner': Loader2,
  };

  const IconComponent = icons[name];

  return (
    <IconComponent 
      className={cn(
        'w-5 h-5',
        name === 'spinner' && 'animate-spin',
        className
      )} 
    />
  );
} 
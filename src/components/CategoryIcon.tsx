import React from 'react';
import { 
  CircleDot, 
  Zap, 
  Activity, 
  Target, 
  Flame, 
  Trophy, 
  Shield, 
  Dumbbell, 
  Layers, 
  Box,
  ShieldAlert,
  Swords,
  Footprints,
  Paperclip
} from 'lucide-react';

interface CategoryIconProps {
  iconName?: string;
  category?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, category, className = "w-5 h-5" }) => {
  const name = iconName || (category ? category.toLowerCase() : '');

  if (name.includes('basket') || name === 'circledot') {
    return <CircleDot className={className} />;
  }
  if (name.includes('badmin') || name === 'zap') {
    return <Zap className={className} />;
  }
  if (name.includes('volley') || name === 'activity') {
    return <Activity className={className} />;
  }
  if (name.includes('foot') || name.includes('soccer') || name === 'target') {
    return <Target className={className} />;
  }
  if (name.includes('tennis') || name.includes('ping') || name === 'flame') {
    return <Flame className={className} />;
  }
  if (name.includes('takraw') || name === 'trophy') {
    return <Trophy className={className} />;
  }
  if (name.includes('chess') || name === 'shield') {
    return <Shield className={className} />;
  }
  if (name.includes('box') || name.includes('combat') || name === 'dumbbell') {
    return <Dumbbell className={className} />;
  }
  if (name.includes('taekwondo') || name === 'shieldalert') {
    return <ShieldAlert className={className} />;
  }
  if (name.includes('arnis') || name === 'swords') {
    return <Swords className={className} />;
  }
  if (name.includes('athletic') || name === 'footprints') {
    return <Footprints className={className} />;
  }
  if (name.includes('office') || name === 'paperclip') {
    return <Paperclip className={className} />;
  }
  if (name === 'all' || name === 'layers') {
    return <Layers className={className} />;
  }

  return <Box className={className} />;
};

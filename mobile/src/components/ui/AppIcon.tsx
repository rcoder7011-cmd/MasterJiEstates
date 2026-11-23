import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Home,
  Search,
  Building,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Check,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Filter,
  Plus,
  Eye,
  EyeOff,
  Share2,
  Heart,
  Shield,
  Clock,
  HelpCircle,
  Bell,
  Bookmark,
  Key,
  Tag,
  Briefcase,
  Compass,
  MessageCircle,
  Layers,
  Sparkles,
  Bed,
  Maximize2,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Car,
  Calendar,
  Globe,
  Lock,
  Trash2,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Video,
  Camera,
  Upload,
  Star,
  LogIn,
  UserPlus,
  PlusCircle,
  TrendingUp,
  Users,
  ShieldCheck,
  Award,
  PhoneCall,
  CheckSquare,
  Square,
  Copy,
  Zap,
  Wind,
  LucideIcon,
  LucideProps,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';

export const ICON_MAP = {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Home,
  Search,
  Building,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Check,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Filter,
  Plus,
  Eye,
  EyeOff,
  Share2,
  Heart,
  Shield,
  Clock,
  HelpCircle,
  Bell,
  Bookmark,
  Key,
  Tag,
  Briefcase,
  Compass,
  MessageCircle,
  Layers,
  Sparkles,
  Bed,
  Maximize2,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Car,
  Calendar,
  Globe,
  Lock,
  Trash2,
  MessageSquare,
  FileText,
  Image: ImageIcon,
  Video,
  Camera,
  Upload,
  Star,
  LogIn,
  UserPlus,
  PlusCircle,
  TrendingUp,
  Users,
  ShieldCheck,
  Award,
  PhoneCall,
  CheckSquare,
  Square,
  Copy,
  Zap,
  Wind,
} as const;

export type IconName = keyof typeof ICON_MAP;
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AppIconProps extends Omit<LucideProps, 'size' | 'color'> {
  name: IconName;
  size?: IconSize | number;
  color?: keyof typeof colors | string;
  strokeWidth?: number;
}

const resolveSize = (size: IconSize | number): number => {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'xs':
      return layout.iconSizeXs;
    case 'sm':
      return layout.iconSizeSm;
    case 'lg':
      return layout.iconSizeLg;
    case 'xl':
      return layout.iconSizeXl;
    case 'md':
    default:
      return layout.iconSizeMd;
  }
};

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 'md',
  color = 'primary',
  strokeWidth = 2,
  ...rest
}) => {
  const IconComponent: LucideIcon | undefined = ICON_MAP[name];

  if (!IconComponent) {
    return null;
  }

  const resolvedColor = (colors as Record<string, string>)[color] || color;
  const numericSize = resolveSize(size);

  return (
    <IconComponent
      size={numericSize}
      color={resolvedColor}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
};

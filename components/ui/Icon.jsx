import { ArrowUpRight, ArrowRight, ArrowLeft, Sparkles, Orbit, Layers3, Waypoints, Gem, MessageCircle, Shapes, Eye, Users, WandSparkles, Crown, Lightbulb, Network, X, Plus, Minus, Check, Pause, Play, RotateCcw, MoveUpRight, Command, ScanLine, Hand } from 'lucide-react';
const icons = { ArrowUpRight, ArrowRight, ArrowLeft, Sparkles, Orbit, Layers3, Waypoints, Gem, MessageCircle, Shapes, Eye, Users, WandSparkles, Crown, Lightbulb, Network, X, Plus, Minus, Check, Pause, Play, RotateCcw, MoveUpRight, Command, ScanLine, Hand };
export default function Icon({ name, size = 20, ...props }) {
  const Glyph = icons[name] || Sparkles;
  return <Glyph size={size} strokeWidth={1.55} aria-hidden="true" {...props} />;
}

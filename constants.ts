import { Level } from './types';

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "連集合場",
    description: "新兵戰士，動作快一點！",
    requiredJumps: 20,
    bgColor: "bg-stone-400",
    bgImage: "https://images.unsplash.com/photo-1598556776374-297c0f16e458?q=80&w=1600&auto=format&fit=crop", // Concrete/Parade ground feel
    accentColor: "text-stone-100"
  },
  {
    id: 2,
    name: "大寢室",
    description: "棉被折那什麼樣子？繼續跳！",
    requiredJumps: 30,
    bgColor: "bg-emerald-900",
    bgImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1600&auto=format&fit=crop", // Hostel/Bunk bed feel
    accentColor: "text-emerald-100"
  },
  {
    id: 3,
    name: "連長室",
    description: "楊維中，你為什麼要掉筷子？",
    requiredJumps: 40,
    bgColor: "bg-amber-900",
    bgImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1600&auto=format&fit=crop", // Office desk
    accentColor: "text-amber-100"
  },
  {
    id: 4,
    name: "營長室",
    description: "營長在看你了，腿抬高！",
    requiredJumps: 50,
    bgColor: "bg-red-950",
    bgImage: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1600&auto=format&fit=crop", // Executive office
    accentColor: "text-red-100"
  },
  {
    id: 5,
    name: "伙房後面不可言說的空間",
    description: "..................",
    requiredJumps: 60,
    bgColor: "bg-gray-950",
    bgImage: "https://images.unsplash.com/photo-1517316718978-574f8364df29?q=80&w=1600&auto=format&fit=crop", // Dark gritty alley/kitchen back
    accentColor: "text-purple-400"
  }
];

export const MAX_LEVEL = LEVELS.length;
import { CharacterConfig, StageConfig } from "./types";

export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 576;
export const GRAVITY = 0.85; // Ninja gravity
export const GROUND_Y = CANVAS_HEIGHT - 96;

// Gameplay Constants
export const HIT_STUN = 20; 
export const INVINCIBILITY_WINDOW = 50; 
export const ATTACK_COOLDOWN = 400;
export const TAG_COOLDOWN = 3000;
export const BLOCK_COOLDOWN = 60; 
export const BLOCK_DURATION = 30; 
export const METER_GAIN_HIT = 12;
export const METER_GAIN_DAMAGE = 8;
export const SUPER_COST = 100;

export const ROSTER: CharacterConfig[] = [
  {
    id: 'naruto',
    name: 'Naruto',
    style: 'Nine-Tails Jinchuriki',
    backstory: 'Future Hokage.',
    color: '#f97316', 
    accentColor: '#38bdf8', // Blue Rasengan
    clothing: { skin: '#ffdbac', top: '#f97316', bottom: '#f97316', shoes: '#111', extra: '#111' }, // Black accents
    visualType: 'JUMPSUIT',
    width: 60, height: 115, speed: 8.5, jumpForce: -22, maxHealth: 110,
    specialMoveName: 'Rasengan'
  },
  {
    id: 'sasuke',
    name: 'Sasuke',
    style: 'Uchiha Survivor',
    backstory: 'Avenger.',
    color: '#6366f1',
    accentColor: '#a855f7', // Purple Chidori/Susanoo
    clothing: { skin: '#ffdbac', top: '#f8fafc', bottom: '#1e1b4b', shoes: '#111', extra: '#a855f7' }, // White top, navy pants, purple rope
    visualType: 'ROBE',
    width: 60, height: 115, speed: 9, jumpForce: -21, maxHealth: 100,
    specialMoveName: 'Chidori'
  },
  {
    id: 'sakura',
    name: 'Sakura',
    style: 'Medical Ninja',
    backstory: 'Strength of a hundred.',
    color: '#be123c',
    accentColor: '#bef264', // Green Healing/Impact
    clothing: { skin: '#ffe0bd', top: '#be123c', bottom: '#fce7f3', shoes: '#4b5563', extra: '#be123c' }, // Red top, pink skirt
    visualType: 'CASUAL',
    width: 55, height: 110, speed: 7, jumpForce: -20, maxHealth: 95,
    specialMoveName: 'Cherry Smash'
  },
  {
    id: 'kakashi',
    name: 'Kakashi',
    style: 'Copy Ninja',
    backstory: 'The Sixth Hokage.',
    color: '#16a34a', 
    accentColor: '#38bdf8', // Blue Lightning
    clothing: { skin: '#ffdbac', top: '#1e293b', bottom: '#1e293b', shoes: '#111', extra: '#15803d' }, // Navy suit, green vest
    visualType: 'FLAK_JACKET',
    width: 60, height: 118, speed: 8, jumpForce: -21, maxHealth: 100,
    specialMoveName: 'Lightning Blade'
  },
  {
    id: 'rock_lee',
    name: 'Rock Lee',
    style: 'Taijutsu Master',
    backstory: 'Handsome Devil.',
    color: '#15803d', 
    accentColor: '#22c55e', // Green Gates
    clothing: { skin: '#ffdbac', top: '#15803d', bottom: '#15803d', shoes: '#111', extra: '#f97316' }, // Green suit, orange warmers
    visualType: 'JUMPSUIT',
    width: 60, height: 115, speed: 10, jumpForce: -23, maxHealth: 105,
    specialMoveName: 'Primary Lotus'
  },
  {
    id: 'itachi',
    name: 'Itachi',
    style: 'Akatsuki',
    backstory: 'Shadow of the clan.',
    color: '#991b1b', 
    accentColor: '#ef4444', // Red Fire/Eyes
    clothing: { skin: '#ffdbac', top: '#000', bottom: '#000', shoes: '#fff', extra: '#991b1b' }, // Cloak
    visualType: 'AKATSUKI',
    width: 65, height: 120, speed: 7.5, jumpForce: -20, maxHealth: 85,
    specialMoveName: 'Fireball Jutsu'
  },
  {
    id: 'gaara',
    name: 'Gaara',
    style: 'Kazekage',
    backstory: 'Sand defense.',
    color: '#7f1d1d', 
    accentColor: '#d6d3d1', // Sand
    clothing: { skin: '#ffdbac', top: '#7f1d1d', bottom: '#7f1d1d', shoes: '#111', extra: '#d6d3d1' }, // Gourd
    visualType: 'SAND_GEAR',
    width: 60, height: 115, speed: 5, jumpForce: -18, maxHealth: 115,
    specialMoveName: 'Sand Coffin'
  },
  {
    id: 'hinata',
    name: 'Hinata',
    style: 'Byakugan Princess',
    backstory: 'Gentle Step.',
    color: '#a855f7', 
    accentColor: '#e9d5ff', // Gentle Fist Chakra
    clothing: { skin: '#ffe0bd', top: '#e9d5ff', bottom: '#1e1b4b', shoes: '#111', extra: '#fff' }, // Lavender/Navy
    visualType: 'CASUAL',
    width: 55, height: 110, speed: 7.5, jumpForce: -20, maxHealth: 90,
    specialMoveName: 'Twin Lion Fists'
  },
  {
    id: 'jiraiya',
    name: 'Jiraiya',
    style: 'Toad Sage',
    backstory: 'Legendary Sannin.',
    color: '#b91c1c',
    accentColor: '#fff', // Hair/Rasengan
    clothing: { skin: '#ffdbac', top: '#15803d', bottom: '#b91c1c', shoes: '#881337', extra: '#fff' }, // Green haori over red
    visualType: 'ROBE',
    width: 70, height: 125, speed: 6, jumpForce: -19, maxHealth: 110,
    specialMoveName: 'Gallant Rasengan'
  },
  {
    id: 'pain',
    name: 'Pain',
    style: 'Six Paths',
    backstory: 'This world shall know pain.',
    color: '#ea580c',
    accentColor: '#c084fc', // Rinnegan Purple
    clothing: { skin: '#ffdbac', top: '#000', bottom: '#000', shoes: '#000', extra: '#ea580c' }, // Akatsuki
    visualType: 'AKATSUKI',
    width: 65, height: 120, speed: 6.5, jumpForce: -21, maxHealth: 100,
    specialMoveName: 'Almighty Push'
  }
];

export const STAGES: StageConfig[] = [
  {
    id: 'konoha',
    name: 'Konoha Gate',
    description: 'The entrance to the Hidden Leaf.',
    colors: ['#22c55e', '#15803d'], 
    floorColor: '#eab308'
  },
  {
    id: 'valley',
    name: 'Valley of End',
    description: 'Statues of legends.',
    colors: ['#1e40af', '#3b82f6'], 
    floorColor: '#64748b'
  },
  {
    id: 'exams',
    name: 'Chunin Arena',
    description: 'A place to prove your worth.',
    colors: ['#78350f', '#451a03'], 
    floorColor: '#a8a29e'
  },
  {
    id: 'akatsuki',
    name: 'Hideout',
    description: 'Dark cave.',
    colors: ['#0f172a', '#1e293b'], 
    floorColor: '#334155'
  },
  {
    id: 'bridge',
    name: 'Tenchi Bridge',
    description: 'Meeting point.',
    colors: ['#15803d', '#84cc16'], 
    floorColor: '#713f12'
  }
];
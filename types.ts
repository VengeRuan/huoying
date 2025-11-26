export enum FighterState {
  IDLE,
  RUNNING,
  JUMPING,
  ATTACKING,
  TAKE_HIT,
  BLOCK,
  DEAD,
  VICTORY
}

export enum AttackType {
  LIGHT,   // J - Taijutsu
  HEAVY,   // K - Heavy Taijutsu / Weapon
  SPECIAL, // L - Ninjutsu (Projectile/Skill)
  SUPER    // I - Ultimate Jutsu
}

export type VisualType = 'JUMPSUIT' | 'FLAK_JACKET' | 'AKATSUKI' | 'ROBE' | 'SAND_GEAR' | 'CASUAL';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Box {
  position: Position;
  width: number;
  height: number;
}

export interface ClothingConfig {
    skin: string;
    top: string; 
    bottom: string; 
    shoes: string;
    extra?: string; // For headbands, vests, sashes
}

export interface CharacterConfig {
  id: string;
  name: string;
  style: string;
  backstory: string;
  color: string; // UI Theme color
  accentColor: string; // Chakra/Effect color
  clothing: ClothingConfig; 
  visualType: VisualType;
  width: number;
  height: number;
  speed: number;
  jumpForce: number;
  maxHealth: number;
  specialMoveName: string;
}

export interface StageConfig {
  id: string;
  name: string;
  description: string;
  colors: string[];
  floorColor: string;
}

export interface HitWindow {
  start: number;
  end: number;
}

export interface AIState {
    decisionCooldown: number;
    currentAction: 'CHASE' | 'RETREAT' | 'ATTACK' | 'WAIT';
    reactionTimer: number;
}

export interface FighterData {
  config: CharacterConfig;
  position: Position;
  velocity: Velocity;
  health: number;
  meter: number;
  state: FighterState;
  attackType: AttackType; 
  attackBox: {
    position: Position;
    offset: Position;
    width: number;
    height: number;
  };
  isAttacking: boolean;
  isBlocking: boolean;
  blockCooldown: number;
  direction: 1 | -1;
  framesCurrent: number;
  framesElapsed: number;
  framesHold: number;
  hasHit: boolean;
  hitWindow: HitWindow;
  invincibleFrames: number;
  ai?: AIState; // New field for AI logic
}

export interface Projectile {
  position: Position;
  velocity: Velocity;
  ownerId: string;
  ownerColor: string;
  damage: number;
  width: number;
  height: number;
  isPlayer1: boolean;
  toBeRemoved?: boolean;
  type: 'ENERGY_BALL' | 'FIREBALL' | 'SHURIKEN' | 'SAND' | 'LIGHTNING';
}

export interface HitEffect {
    x: number;
    y: number;
    color: string;
    radius: number;
    life: number;
    maxLife: number;
    type: 'SPARK' | 'BLOOD' | 'CHAKRA';
}

export interface ScreenShake {
    magnitude: number;
    duration: number;
}

export interface GameResult {
  winner: string;
  loser: string;
  winnerHealth: number;
  duration: number;
  winningTeamNames: string[];
}
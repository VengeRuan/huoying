import { FighterData, FighterState, Box, CharacterConfig, AttackType } from "../types";
import { GRAVITY, GROUND_Y } from "../constants";

// Helper for rectangle collision
export function rectangularCollision({ rect1, rect2 }: { rect1: Box; rect2: Box }) {
  return (
    rect1.position.x + rect1.width >= rect2.position.x &&
    rect1.position.x <= rect2.position.x + rect2.width &&
    rect1.position.y + rect1.height >= rect2.position.y &&
    rect1.position.y <= rect2.position.y + rect2.height
  );
}

export function createFighter(config: CharacterConfig, x: number, direction: 1 | -1): FighterData {
  return {
    config,
    position: { x, y: 0 },
    velocity: { x: 0, y: 0 },
    health: config.maxHealth,
    meter: 0,
    state: FighterState.IDLE,
    attackType: AttackType.LIGHT,
    attackBox: {
      position: { x, y: 0 },
      offset: { x: direction === 1 ? 0 : -50, y: 20 },
      width: 100, 
      height: 50
    },
    isAttacking: false,
    isBlocking: false,
    blockCooldown: 0,
    direction,
    framesCurrent: 0,
    framesElapsed: 0,
    framesHold: 5,
    hasHit: false,
    hitWindow: { start: 0, end: 0 },
    invincibleFrames: 0,
    ai: { decisionCooldown: 0, currentAction: 'WAIT', reactionTimer: 0 }
  };
}

export function updateFighter(fighter: FighterData, canvasWidth: number): FighterData {
  const updated: FighterData = { 
      ...fighter, 
      position: { ...fighter.position }, 
      velocity: { ...fighter.velocity },
      attackBox: { 
          ...fighter.attackBox,
          position: { ...fighter.attackBox.position },
          offset: { ...fighter.attackBox.offset }
      },
      ai: fighter.ai ? { ...fighter.ai } : undefined
  };

  if (updated.invincibleFrames > 0) {
      updated.invincibleFrames--;
  }

  if (updated.state === FighterState.DEAD) {
    if (updated.position.y + updated.config.height < GROUND_Y) {
       updated.position.y += updated.velocity.y;
       updated.velocity.y += GRAVITY;
    } else {
        updated.position.y = GROUND_Y - updated.config.height;
    }
    return updated;
  }

  updated.position.y += updated.velocity.y;
  updated.position.x += updated.velocity.x;

  if (updated.position.y + updated.config.height + updated.velocity.y >= GROUND_Y) {
    updated.velocity.y = 0;
    updated.position.y = GROUND_Y - updated.config.height;
    if (updated.state === FighterState.JUMPING) {
        updated.state = FighterState.IDLE;
    }
  } else {
    updated.velocity.y += GRAVITY;
  }

  if (updated.position.x < 0) updated.position.x = 0;
  if (updated.position.x + updated.config.width > canvasWidth) updated.position.x = canvasWidth - updated.config.width;

  // Attack box follows position, direction logic handled in GameCanvas
  if (updated.direction === 1) {
       updated.attackBox.position.x = updated.position.x + (updated.config.width / 2); 
  } else {
       updated.attackBox.position.x = updated.position.x - 60; 
  }
  updated.attackBox.position.y = updated.position.y + updated.attackBox.offset.y;

  return updated;
}
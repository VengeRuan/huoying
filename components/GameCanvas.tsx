import React, { useRef, useEffect, memo } from 'react';
import { 
    CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, 
    METER_GAIN_HIT, METER_GAIN_DAMAGE, SUPER_COST, 
    TAG_COOLDOWN, HIT_STUN, INVINCIBILITY_WINDOW,
    BLOCK_COOLDOWN, BLOCK_DURATION
} from '../constants';
import { FighterData, FighterState, GameResult, CharacterConfig, StageConfig, AttackType, Projectile, HitEffect, ScreenShake } from '../types';
import { createFighter, updateFighter, rectangularCollision } from '../utils/gameLogic';
import { drawFighter, drawProjectile, drawHitEffect } from '../utils/renderUtils';

interface GameCanvasProps {
  gameStarted: boolean;
  p1TeamConfig: CharacterConfig[];
  p2TeamConfig: CharacterConfig[];
  stage: StageConfig;
  onGameOver: (result: GameResult) => void;
  updateStats: (
      p1Current: FighterData, 
      p2Current: FighterData, 
      timer: number, 
      p1Team: FighterData[], 
      p2Team: FighterData[]
  ) => void;
}

const getAttackStats = (charId: string, type: AttackType) => {
    // Ninja moves are generally faster
    let stats = { hold: 18, width: 80, dmg: 5, start: 4, end: 12 };
    
    // Heavy Characters (Jiraiya, Gaara)
    if (charId === 'jiraiya' || charId === 'gaara' || charId === 'pain') {
        stats.hold += 8;
        stats.width += 30;
        stats.dmg += 4;
        stats.start += 4; 
        stats.end += 4;
    } 
    // Speedsters (Lee, Minato-ish types)
    else if (charId === 'rock_lee' || charId === 'sasuke') {
        stats.hold -= 4;
        stats.start = 2;
        stats.end = 8;
    }

    switch(type) {
        case AttackType.LIGHT:
            break; // Default Taijutsu
        case AttackType.HEAVY:
            stats.hold = 25;
            stats.width = 110;
            stats.dmg = 12;
            stats.start = 6;
            stats.end = 18;
            break;
        case AttackType.SPECIAL:
            stats.hold = 35; // Ninjutsu Casting Time
            stats.width = 0; // Usually projectile or self-buff, hitbox handled separately or via projectile
            stats.dmg = 15; 
            stats.start = 12; 
            stats.end = 35;
            break;
        case AttackType.SUPER:
            stats.hold = 50; // Ultimate Jutsu
            stats.width = 200;
            stats.dmg = 35;
            stats.start = 10;
            stats.end = 40;
            break;
    }
    return stats;
};

const GameCanvasComponent: React.FC<GameCanvasProps> = ({ 
    gameStarted, 
    p1TeamConfig, 
    p2TeamConfig, 
    stage,
    onGameOver, 
    updateStats 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const initialized = useRef(false);
  
  const p1TeamRef = useRef<FighterData[]>([]);
  const p2TeamRef = useRef<FighterData[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const hitEffectsRef = useRef<HitEffect[]>([]); 

  const p1ActiveIdx = useRef<number>(0);
  const p2ActiveIdx = useRef<number>(0);
  
  const timerRef = useRef<number>(60);
  const isGameOverRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const lastTagTimeP1 = useRef<number>(0);

  const hitStopFrames = useRef<number>(0);
  const screenShake = useRef<ScreenShake>({ magnitude: 0, duration: 0 });

  const keys = useRef({
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false, time: 0 }, 
    s: { pressed: false },
    j: { pressed: false }, 
    k: { pressed: false }, 
    l: { pressed: false }, 
    i: { pressed: false } 
  });

  useEffect(() => {
    if (gameStarted && !initialized.current) {
      p1TeamRef.current = p1TeamConfig.map(c => createFighter(c, 150, 1));
      p2TeamRef.current = p2TeamConfig.map(c => createFighter(c, 750, -1));
      projectilesRef.current = [];
      hitEffectsRef.current = [];
      
      p1ActiveIdx.current = 0;
      p2ActiveIdx.current = 0;
      
      timerRef.current = 99;
      isGameOverRef.current = false;
      startTimeRef.current = Date.now();
      hitStopFrames.current = 0;
      screenShake.current = { magnitude: 0, duration: 0 };
      initialized.current = true;
      
      const timerId = setInterval(() => {
        if (timerRef.current > 0 && !isGameOverRef.current && hitStopFrames.current === 0) {
          timerRef.current--;
        }
      }, 1000);

      return () => {
          clearInterval(timerId);
          initialized.current = false;
      };
    }
  }, [gameStarted, p1TeamConfig, p2TeamConfig]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOverRef.current) return;
      const k = e.key.toLowerCase();
      
      const now = Date.now();
      if (now - lastTagTimeP1.current > TAG_COOLDOWN) {
        if (k === 'q') switchCharacter(p1TeamRef, p1ActiveIdx, -1);
        if (k === 'e') switchCharacter(p1TeamRef, p1ActiveIdx, 1);
      }

      const p1 = p1TeamRef.current[p1ActiveIdx.current];
      if (!p1 || p1.health <= 0) return;

      switch (k) {
        case 'd': keys.current.d.pressed = true; break;
        case 'a': keys.current.a.pressed = true; break;
        case 'w': 
            if (!keys.current.w.pressed) {
                keys.current.w.pressed = true;
                keys.current.w.time = Date.now();
            }
            break;
        case 's': 
            if (p1.state === FighterState.IDLE && p1.blockCooldown <= 0) {
                p1.state = FighterState.BLOCK;
                p1.framesCurrent = 0;
                p1.framesHold = BLOCK_DURATION;
                p1.blockCooldown = BLOCK_COOLDOWN; 
            }
            break;
        case 'j': performAttack(p1, AttackType.LIGHT); break;
        case 'k': performAttack(p1, AttackType.HEAVY); break;
        case 'l': performAttack(p1, AttackType.SPECIAL); break;
        case 'i': 
            if (p1.meter >= SUPER_COST) {
                 p1.meter -= SUPER_COST;
                 performAttack(p1, AttackType.SUPER);
            }
            break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const p1 = p1TeamRef.current[p1ActiveIdx.current];
      
      switch (k) {
        case 'd': keys.current.d.pressed = false; break;
        case 'a': keys.current.a.pressed = false; break;
        case 'w': 
            if (p1 && keys.current.w.pressed && p1.velocity.y === 0 && p1.state !== FighterState.TAKE_HIT && p1.state !== FighterState.BLOCK) {
                const duration = Date.now() - keys.current.w.time;
                p1.velocity.y = duration < 120 ? p1.config.jumpForce * 0.7 : p1.config.jumpForce; 
            }
            keys.current.w.pressed = false; 
            break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const performAttack = (fighter: FighterData, type: AttackType) => {
      if (!fighter.isAttacking && fighter.state !== FighterState.TAKE_HIT && fighter.state !== FighterState.BLOCK) {
          fighter.isAttacking = true;
          fighter.hasHit = false; 
          fighter.state = FighterState.ATTACKING;
          fighter.attackType = type;
          fighter.framesCurrent = 0; 
          
          const stats = getAttackStats(fighter.config.id, type);
          
          fighter.framesHold = stats.hold;
          fighter.attackBox.width = stats.width;
          fighter.hitWindow = { start: stats.start, end: stats.end };

          // Super Move Flash
          if (type === AttackType.SUPER) {
              screenShake.current = { magnitude: 10, duration: 20 };
              hitStopFrames.current = 20; // Cinematic pause
          }
       }
  };

  const switchCharacter = (teamRef: React.MutableRefObject<FighterData[]>, idxRef: React.MutableRefObject<number>, dir: number) => {
      let newIdx = idxRef.current;
      let checked = 0;
      while (checked < 3) {
          newIdx = (newIdx + dir + 3) % 3; 
          if (teamRef.current[newIdx].health > 0) {
              const oldPos = teamRef.current[idxRef.current].position;
              idxRef.current = newIdx;
              teamRef.current[newIdx].position.x = oldPos.x;
              teamRef.current[newIdx].position.y = -200; 
              teamRef.current[newIdx].velocity.y = 10;
              teamRef.current[newIdx].invincibleFrames = INVINCIBILITY_WINDOW; 
              lastTagTimeP1.current = Date.now();
              return;
          }
          checked++;
      }
  };

  const updateAI = (enemy: FighterData, target: FighterData) => {
     if (isGameOverRef.current || enemy.health <= 0 || enemy.state === FighterState.TAKE_HIT) {
         if (enemy.state === FighterState.TAKE_HIT) enemy.velocity.x *= 0.9;
         else enemy.velocity.x = 0;
         return;
     }

     if (!enemy.ai) enemy.ai = { decisionCooldown: 0, currentAction: 'WAIT', reactionTimer: 0 };
     
     // Reaction Timer decrement
     if (enemy.ai.decisionCooldown > 0) enemy.ai.decisionCooldown--;

     const dist = Math.abs(target.position.x - enemy.position.x);
     
     // 1. DEFENSE (High Priority)
     if (target.isAttacking && dist < 180 && enemy.state === FighterState.IDLE) {
         // Reaction chance based on distance (closer = harder to react)
         if (Math.random() > 0.4 && enemy.blockCooldown <= 0) {
             enemy.state = FighterState.BLOCK;
             enemy.framesHold = 20;
             enemy.blockCooldown = 60;
             enemy.velocity.x = 0;
             return; 
         }
     }
     
     if (enemy.state === FighterState.BLOCK) return; 
     
     // 2. DECISION MAKING
     if (enemy.ai.decisionCooldown <= 0) {
         const rand = Math.random();
         const isWinning = enemy.health > target.health;

         if (dist > 400) {
             enemy.ai.currentAction = 'CHASE'; // Close gap
         } else if (dist < 80) {
             enemy.ai.currentAction = 'ATTACK'; // Melee range
         } else {
             // Mid range logic
             if (isWinning && rand < 0.4) enemy.ai.currentAction = 'RETREAT';
             else if (rand < 0.7) enemy.ai.currentAction = 'CHASE';
             else enemy.ai.currentAction = 'WAIT';
         }
         enemy.ai.decisionCooldown = 20 + Math.floor(Math.random() * 20); // Recalculate frequently
     }

     // 3. EXECUTION
     if (enemy.ai.currentAction === 'CHASE') {
         const moveDir = target.position.x > enemy.position.x ? 1 : -1;
         enemy.velocity.x = moveDir * enemy.config.speed;
     } 
     else if (enemy.ai.currentAction === 'RETREAT') {
         const moveDir = target.position.x > enemy.position.x ? -1 : 1;
         enemy.velocity.x = moveDir * enemy.config.speed * 0.8; 
     } 
     else if (enemy.ai.currentAction === 'ATTACK') {
         enemy.velocity.x = 0;
         if (!enemy.isAttacking) {
             const atkRand = Math.random();
             if (atkRand < 0.4) performAttack(enemy, AttackType.LIGHT);
             else if (atkRand < 0.7) performAttack(enemy, AttackType.HEAVY);
             else if (enemy.meter >= SUPER_COST && atkRand > 0.9) {
                 enemy.meter -= SUPER_COST;
                 performAttack(enemy, AttackType.SUPER);
             } else if (atkRand > 0.8) {
                 performAttack(enemy, AttackType.SPECIAL);
             }
         }
     } 
     else {
         enemy.velocity.x = 0; // WAIT
     }

     // Jump Logic (Anti-Air or Random)
     if (target.position.y < GROUND_Y - 100 && enemy.velocity.y === 0 && Math.random() < 0.05) {
         enemy.velocity.y = enemy.config.jumpForce;
     }
  };

  const handleCollision = (attacker: FighterData, defender: FighterData, hitStop: React.MutableRefObject<number>) => {
      // Melee Hit Logic
      if (
          attacker.attackType !== AttackType.SPECIAL && // Specials are usually projectiles or specific hitboxes
          attacker.isAttacking &&
          !attacker.hasHit &&
          defender.invincibleFrames === 0
      ) {
          // Check if frame is active
          if (attacker.framesCurrent < attacker.hitWindow.start || attacker.framesCurrent > attacker.hitWindow.end) return;

          // Check Hitbox
          if (rectangularCollision({ rect1: attacker.attackBox, rect2: { position: defender.position, width: defender.config.width, height: defender.config.height } })) {
              attacker.hasHit = true; 
              applyHit(attacker, defender, hitStop);
          }
      }
  };

  const applyHit = (attacker: FighterData, defender: FighterData, hitStop: React.MutableRefObject<number>) => {
      const stats = getAttackStats(attacker.config.id, attacker.attackType);
      let finalDamage = stats.dmg;
      let isBlock = defender.state === FighterState.BLOCK;

      if (isBlock) {
          finalDamage = 0;
          defender.state = FighterState.IDLE; 
          defender.framesHold = 0;
      } else {
          defender.state = FighterState.TAKE_HIT;
          defender.framesHold = HIT_STUN;
      }

      hitEffectsRef.current.push({
          x: defender.position.x + defender.config.width/2,
          y: defender.position.y + 40,
          color: isBlock ? '#38bdf8' : '#fbbf24', 
          radius: 15,
          life: 15,
          maxLife: 15,
          type: isBlock ? 'CHAKRA' : 'SPARK'
      });

      if (!isBlock) {
          defender.health = Math.max(0, defender.health - finalDamage);
          attacker.meter = Math.min(100, attacker.meter + METER_GAIN_HIT);
          defender.meter = Math.min(100, defender.meter + METER_GAIN_DAMAGE);

          if (attacker.attackType === AttackType.HEAVY || attacker.attackType === AttackType.SUPER) {
              screenShake.current = { magnitude: 15, duration: 8 };
          } else {
              screenShake.current = { magnitude: 4, duration: 4 };
          }
      }
      
      defender.isAttacking = false;
      const pushDir = attacker.position.x < defender.position.x ? 1 : -1;
      defender.velocity.x = pushDir * (isBlock ? 8 : 15); 
      defender.velocity.y = isBlock ? 0 : -3; 
      
      hitStop.current = isBlock ? 6 : 10; 
  };

  const animate = (time: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Shake
    let shakeX = 0, shakeY = 0;
    if (screenShake.current.duration > 0) {
        const mag = screenShake.current.magnitude;
        shakeX = (Math.random() * mag) - (mag / 2);
        shakeY = (Math.random() * mag) - (mag / 2);
        screenShake.current.duration--;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, stage.colors[0]); 
    gradient.addColorStop(1, stage.colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(-50, -50, CANVAS_WIDTH + 100, CANVAS_HEIGHT + 100);
    ctx.fillStyle = stage.floorColor;
    ctx.fillRect(-50, GROUND_Y, CANVAS_WIDTH + 100, CANVAS_HEIGHT - GROUND_Y + 50);

    if (!gameStarted || !initialized.current) {
        ctx.restore();
        requestRef.current = requestAnimationFrame(animate);
        return;
    }

    let p1 = p1TeamRef.current[p1ActiveIdx.current];
    let p2 = p2TeamRef.current[p2ActiveIdx.current];

    // --- GAME LOGIC ---
    if (hitStopFrames.current > 0) {
        hitStopFrames.current--;
        // Still draw but don't update physics
        projectilesRef.current.forEach(p => drawProjectile(ctx, p));
        hitEffectsRef.current.forEach(e => drawHitEffect(ctx, e));
        drawFighter(ctx, p1, true);
        drawFighter(ctx, p2, true);
        ctx.restore();
        requestRef.current = requestAnimationFrame(animate);
        return;
    }

    // Check KO
    if (p1.health <= 0) {
        let found = false;
        for(let i=0; i<3; i++) {
            if (p1TeamRef.current[i].health > 0) {
                p1ActiveIdx.current = i;
                p1 = p1TeamRef.current[i]; 
                p1.position.x = 0; p1.position.y = -200;
                p1.invincibleFrames = INVINCIBILITY_WINDOW;
                found = true;
                break;
            }
        }
        if (!found && !isGameOverRef.current) endGame(false);
    }
    if (p2.health <= 0) {
         let found = false;
         for(let i=0; i<3; i++) {
             if (p2TeamRef.current[i].health > 0) {
                 p2ActiveIdx.current = i;
                 p2 = p2TeamRef.current[i]; 
                 p2.position.x = CANVAS_WIDTH - 50; p2.position.y = -200;
                 p2.invincibleFrames = INVINCIBILITY_WINDOW;
                 found = true;
                 break;
             }
         }
         if (!found && !isGameOverRef.current) endGame(true);
    }

    // --- UPDATE FIGHTERS ---
    const processFighter = (f: FighterData, input: any, opponent: FighterData) => {
        if (f.health <= 0) return;
        if (f.blockCooldown > 0) f.blockCooldown--;

        // Determine Direction: ALWAYS face opponent unless dead/special state
        const dx = opponent.position.x - f.position.x;
        if (dx !== 0) f.direction = dx > 0 ? 1 : -1;

        if (f.state !== FighterState.TAKE_HIT && f.state !== FighterState.BLOCK) {
            f.velocity.x = 0;
            // Movement Logic
            if (input.a && f.position.x > 0) f.velocity.x = -f.config.speed;
            if (input.d && f.position.x < CANVAS_WIDTH - f.config.width) f.velocity.x = f.config.speed;
            // Note: Direction is decoupled from velocity now for better animations
        } else {
             f.velocity.x *= 0.9; 
        }

        // Projectile Spawning
        if (f.isAttacking) {
            f.framesCurrent++;
            if (f.attackType === AttackType.SPECIAL && f.framesCurrent === f.hitWindow.start && !f.hasHit) {
                f.hasHit = true; 
                let pType: Projectile['type'] = 'ENERGY_BALL';
                let pSpeed = 15;
                let pDmg = 15;
                
                // Customize Projectile based on ID
                if (f.config.id === 'itachi' || f.config.id === 'sasuke') pType = 'FIREBALL';
                if (f.config.id === 'gaara') { pType = 'SAND'; pSpeed = 10; }
                if (f.config.id === 'kakashi') pType = 'LIGHTNING';

                projectilesRef.current.push({
                    position: { x: f.position.x + (f.direction === 1 ? 60 : -20), y: f.position.y + 30 },
                    velocity: { x: f.direction * pSpeed, y: 0 },
                    ownerId: f.config.id,
                    ownerColor: f.config.accentColor,
                    damage: pDmg,
                    width: 40,
                    height: 40,
                    isPlayer1: f === p1TeamRef.current[p1ActiveIdx.current],
                    type: pType
                });
            }

            if (f.framesCurrent >= f.framesHold) {
                f.isAttacking = false;
                f.state = FighterState.IDLE;
                f.framesCurrent = 0;
            }
        } else if (f.state !== FighterState.TAKE_HIT && f.state !== FighterState.BLOCK) {
            f.framesCurrent = (f.framesCurrent + 1) % 60; 
        }
    };

    if (p1.health > 0) {
        processFighter(p1, { a: keys.current.a.pressed, d: keys.current.d.pressed }, p2);
        p1TeamRef.current[p1ActiveIdx.current] = updateFighter(p1, CANVAS_WIDTH);
    }
    if (p2.health > 0) {
        updateAI(p2, p1); // AI sets velocity directly
        processFighter(p2, { a: false, d: false }, p1); // Inputs ignored for AI as it sets velocity
        p2TeamRef.current[p2ActiveIdx.current] = updateFighter(p2, CANVAS_WIDTH);
    }

    const p1State = p1TeamRef.current[p1ActiveIdx.current];
    const p2State = p2TeamRef.current[p2ActiveIdx.current];

    // --- COLLISIONS ---
    projectilesRef.current.forEach((proj) => {
        proj.position.x += proj.velocity.x;
        const target = proj.isPlayer1 ? p2State : p1State;
        const attacker = proj.isPlayer1 ? p1State : p2State;
        
        if (proj.position.x < -100 || proj.position.x > CANVAS_WIDTH + 100) {
            proj.toBeRemoved = true;
            return;
        }

        if (target.health > 0 && target.invincibleFrames === 0 && rectangularCollision({
            rect1: { position: { x: proj.position.x - 20, y: proj.position.y - 20 }, width: 40, height: 40 },
            rect2: { position: target.position, width: target.config.width, height: target.config.height }
        })) {
             const fakeAttacker = { ...attacker, attackType: AttackType.SPECIAL };
             applyHit(fakeAttacker, target, hitStopFrames);
             proj.toBeRemoved = true;
        }
    });
    projectilesRef.current = projectilesRef.current.filter(p => !p.toBeRemoved);

    if (p1State.health > 0 && p2State.health > 0) {
        handleCollision(p1State, p2State, hitStopFrames);
        handleCollision(p2State, p1State, hitStopFrames);
    }

    [p1State, p2State].forEach(f => {
        if (f.state === FighterState.TAKE_HIT || f.state === FighterState.BLOCK) {
            if (f.state === FighterState.BLOCK) {
                if (f.framesCurrent < f.framesHold) f.framesCurrent++;
                else { f.state = FighterState.IDLE; f.framesCurrent = 0; }
            } else {
                 if (f.framesHold > 0) f.framesHold--; 
                 else {
                     f.invincibleFrames = INVINCIBILITY_WINDOW;
                     f.state = FighterState.IDLE;
                 }
            }
        }
    });

    // --- DRAWING ---
    projectilesRef.current.forEach(p => drawProjectile(ctx, p));
    
    hitEffectsRef.current.forEach(e => {
        drawHitEffect(ctx, e);
        e.life--;
    });
    hitEffectsRef.current = hitEffectsRef.current.filter(e => e.life > 0);

    drawFighter(ctx, p1State, true);
    drawFighter(ctx, p2State, true);
    
    ctx.restore(); 

    updateStats({...p1State}, {...p2State}, timerRef.current, [...p1TeamRef.current], [...p2TeamRef.current]);

    if (timerRef.current <= 0 && !isGameOverRef.current) {
        const p1Total = p1TeamRef.current.reduce((acc, c) => acc + Math.max(0, c.health), 0);
        const p2Total = p2TeamRef.current.reduce((acc, c) => acc + Math.max(0, c.health), 0);
        endGame(p1Total >= p2Total);
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  const endGame = (p1Wins: boolean) => {
      isGameOverRef.current = true;
      onGameOver({
          winner: p1Wins ? 'Team 1' : 'Team 2',
          loser: p1Wins ? 'Team 2' : 'Team 1',
          winnerHealth: p1Wins ? p1TeamRef.current.reduce((a,b)=>a+Math.max(0, b.health),0) : p2TeamRef.current.reduce((a,b)=>a+Math.max(0, b.health),0),
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
          winningTeamNames: p1Wins ? p1TeamConfig.map(c=>c.name) : p2TeamConfig.map(c=>c.name)
      });
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameStarted, onGameOver]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="w-full h-full object-contain bg-black shadow-2xl rounded-lg border-4 border-gray-800"
    />
  );
};

export const GameCanvas = memo(GameCanvasComponent);
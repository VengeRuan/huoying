import { FighterData, FighterState, AttackType, VisualType, HitEffect, Projectile } from '../types';
import { GROUND_Y } from '../constants';

// --- ANIME VECTOR RENDERER ---

function drawPath(ctx: CanvasRenderingContext2D, points: {x: number, y: number}[], color: string, stroke?: string) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = color;
    ctx.fill();
}

// Draws a limb with a joint
function drawLimb(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, angle: number, color: string, isPants: boolean = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Shadow/Shading
    const gradient = ctx.createLinearGradient(-w/2, 0, w/2, 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColor(color, -20)); // darker edge
    ctx.fillStyle = gradient;

    if (isPants) {
        // Pants flair out a bit
        ctx.beginPath();
        ctx.moveTo(-w/2, 0);
        ctx.lineTo(w/2, 0);
        ctx.lineTo(w/2 + 2, h);
        ctx.lineTo(-w/2 - 2, h);
        ctx.fill();
    } else {
        // Rounded limb
        ctx.beginPath();
        ctx.roundRect(-w/2, 0, w, h, w/2);
        ctx.fill();
    }
    
    // Outline for style
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
}

function adjustColor(color: string, amount: number) {
    return color; // Simple pass-through for now
}

function drawHead(ctx: CanvasRenderingContext2D, x: number, y: number, fighter: FighterData) {
    const { id, clothing } = fighter.config;
    // NOTE: All drawing assumes facing RIGHT because we scale(-1, 1) in drawFighter

    ctx.save();
    ctx.translate(x, y);

    // Face Shape
    ctx.fillStyle = clothing.skin;
    ctx.beginPath();
    ctx.moveTo(-11, -5); // Jaw left
    ctx.quadraticCurveTo(0, 5, 11, -5); // Chin
    ctx.lineTo(12, -25); 
    ctx.quadraticCurveTo(0, -28, -12, -25);
    ctx.fill();

    // MASK (Kakashi)
    if (id === 'kakashi') {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(-11, -12);
        ctx.quadraticCurveTo(0, 5, 11, -12);
        ctx.lineTo(11, -8);
        ctx.quadraticCurveTo(0, 8, -11, -8);
        ctx.fill();
    }

    // HEADBAND
    const bandColor = (id === 'jiraiya') ? '#1e293b' : '#1e293b'; 
    const plateColor = '#cbd5e1';
    
    // Forehead Protector
    if (id !== 'sakura') { 
        ctx.fillStyle = bandColor;
        ctx.fillRect(-13, -28, 26, 6);
        ctx.fillStyle = plateColor;
        ctx.fillRect(-8, -27, 16, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(-2, -26, 4, 2);
    }
    if (id === 'sakura') {
         ctx.fillStyle = '#be123c';
         ctx.fillRect(-12, -30, 24, 5);
    }

    // HAIR
    ctx.fillStyle = getHairColor(id);
    
    if (id === 'naruto') {
        // Spiky Top
        const spikes = [
            {x: -12, y: -26}, {x: -18, y: -38}, {x: -8, y: -32},
            {x: 0, y: -42}, {x: 8, y: -32}, {x: 18, y: -38},
            {x: 12, y: -26}
        ];
        drawPath(ctx, spikes, ctx.fillStyle);
        // Sideburns
        drawPath(ctx, [{x:-12,y:-25}, {x:-14,y:-10}, {x:-10,y:-18}], ctx.fillStyle);
        drawPath(ctx, [{x:12,y:-25}, {x:14,y:-10}, {x:10,y:-18}], ctx.fillStyle);
        // Whiskers
        ctx.fillStyle = '#000';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(-9, -8, 5, 0.5); ctx.fillRect(-9, -6, 5, 0.5); ctx.fillRect(-9, -4, 5, 0.5);
        ctx.fillRect(4, -8, 5, 0.5); ctx.fillRect(4, -6, 5, 0.5); ctx.fillRect(4, -4, 5, 0.5);
        ctx.globalAlpha = 1.0;

    } else if (id === 'sasuke') {
        const spikes = [
             {x: -12, y: -25}, {x: -16, y: -15}, {x: -14, y: -35},
             {x: 0, y: -30}, {x: 14, y: -35}, {x: 16, y: -15}, {x: 12, y: -25}
        ];
        drawPath(ctx, spikes, ctx.fillStyle);
        ctx.beginPath();
        ctx.moveTo(-8, -26); ctx.lineTo(-4, -10); ctx.lineTo(0, -26); ctx.lineTo(4, -10); ctx.lineTo(8, -26);
        ctx.fill();

    } else if (id === 'sakura') {
        ctx.beginPath();
        ctx.moveTo(-12, -30);
        ctx.quadraticCurveTo(-16, -10, -10, -5); 
        ctx.lineTo(-8, -20); 
        ctx.lineTo(8, -20);
        ctx.lineTo(10, -5);
        ctx.quadraticCurveTo(16, -10, 12, -30); 
        ctx.fill();

    } else if (id === 'kakashi') {
        const spikes = [
            {x: -10, y: -25}, {x: -15, y: -35}, {x: -5, y: -45}, {x: 5, y: -35}, {x: 12, y: -25}
        ];
        drawPath(ctx, spikes, ctx.fillStyle);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-4, -28); ctx.lineTo(-4, -15); ctx.stroke();
    } else if (id === 'gaara' || id === 'rock_lee') {
         ctx.beginPath(); ctx.arc(0, -28, 12, Math.PI, 0); ctx.fill();
         if (id === 'rock_lee') {
             ctx.fillStyle = 'rgba(255,255,255,0.2)';
             ctx.fillRect(-8, -32, 4, 4);
         }
    } else {
        drawPath(ctx, [{x:-12,y:-25}, {x:0,y:-35}, {x:12,y:-25}], ctx.fillStyle);
    }

    // EYES
    if (fighter.state === FighterState.TAKE_HIT) {
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-6, -14); ctx.lineTo(-2, -10); ctx.moveTo(-2, -14); ctx.lineTo(-6, -10);
        ctx.moveTo(2, -14); ctx.lineTo(6, -10); ctx.moveTo(6, -14); ctx.lineTo(2, -10);
        ctx.stroke();
    } else {
        const eyeColor = getEyeColor(id);
        const eyeX = 2; // Right eye
        const eyeX2 = 7; // Further right

        if (id !== 'kakashi') {
             drawEye(ctx, eyeX, -13, eyeColor);
             drawEye(ctx, eyeX2, -13, eyeColor);
        } else {
             drawEye(ctx, -3, -13, '#000'); 
             drawEye(ctx, 3, -13, '#ef4444'); 
        }
    }

    ctx.restore();
}

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x, y, 2.5, 2, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fill();
}

function getHairColor(id: string) {
    if (id === 'naruto') return '#facc15';
    if (id === 'sasuke' || id === 'itachi') return '#1e293b';
    if (id === 'sakura') return '#ec4899';
    if (id === 'kakashi' || id === 'jiraiya') return '#e2e8f0';
    if (id === 'gaara') return '#991b1b';
    if (id === 'hinata') return '#312e81';
    if (id === 'pain') return '#ea580c';
    return '#000';
}

function getEyeColor(id: string) {
    if (id === 'sasuke' || id === 'itachi') return '#ef4444';
    if (id === 'hinata') return '#e2e8f0';
    if (id === 'pain') return '#c084fc';
    if (id === 'naruto') return '#3b82f6';
    if (id === 'sakura') return '#15803d';
    return '#000';
}

export const drawFighter = (ctx: CanvasRenderingContext2D, fighter: FighterData, isActive: boolean) => {
    if (!isActive) return;

    if (fighter.invincibleFrames > 0) {
        ctx.globalAlpha = Math.floor(fighter.invincibleFrames / 4) % 2 === 0 ? 0.4 : 1.0;
    } else {
        ctx.globalAlpha = 1.0;
    }

    const { x, y } = fighter.position;
    const { width, height, clothing, visualType, id } = fighter.config;
    const dir = fighter.direction; // 1 or -1
    
    const time = Date.now() / 150; 
    const isIdle = fighter.state === FighterState.IDLE;
    const isJumping = fighter.position.y + height < GROUND_Y - 5;
    const isAttacking = fighter.isAttacking;
    const breathe = isIdle ? Math.sin(time) * 1.5 : 0;
    
    // MOVEMENT DETECTION (RelativeTo Facing)
    // Moving Forward: Velocity matches Direction (running towards opponent)
    // Moving Backward: Velocity opposes Direction (backing away/guarding)
    const isMovingForward = (fighter.velocity.x * dir) > 0.5;
    const isMovingBackward = (fighter.velocity.x * dir) < -0.5;

    // Center point logic
    const cx = x + width / 2;
    const cy = y + height - 35; // Hips position

    ctx.save();
    // 1. Move to Center of Fighter
    ctx.translate(cx, cy);
    // 2. SCALE X by direction. This flips EVERYTHING horizontally.
    // Now we can just draw assuming the character faces RIGHT (positive X).
    ctx.scale(dir, 1);
    // 3. Translate back slightly so pivot is correct
    ctx.translate(0, 0); // (Effective 0,0 is now hips)

    // --- ANIMATION POSE CALCULATION ---
    let torsoAngle = 0;
    let headAngle = 0;
    let armL_Angle = 0;
    let armR_Angle = 0;
    let legL_Angle = 0;
    let legR_Angle = 0;

    if (isJumping) {
        torsoAngle = 0.2;
        legL_Angle = 0.5;
        legR_Angle = -0.5;
        armL_Angle = -2.5;
        armR_Angle = -2.5; 
    } else if (isMovingForward) {
        // NARUTO RUN (Forward)
        torsoAngle = 0.8; // Lean heavy forward
        legL_Angle = Math.sin(time * 3) * 1.0;
        legR_Angle = Math.sin(time * 3 + Math.PI) * 1.0;
        armL_Angle = -1.8; // Arms flung back
        armR_Angle = -1.8;
        headAngle = -0.5; // Head up looking forward
    } else if (isMovingBackward) {
        // TACTICAL RETREAT (Backward)
        torsoAngle = -0.1; // Lean slightly back
        legL_Angle = Math.sin(time * 2) * 0.5;
        legR_Angle = Math.sin(time * 2 + Math.PI) * 0.5;
        armL_Angle = 1.0; // Guard up (Front arm)
        armR_Angle = 0.5; // Guard up (Back arm)
    } else if (isAttacking) {
        torsoAngle = 0.1;
        legL_Angle = 0.4;
        legR_Angle = -0.4;
        if (fighter.attackType === AttackType.SPECIAL) {
             armL_Angle = -1.5; armR_Angle = -1.5;
        } else {
             armL_Angle = -1.5; armR_Angle = 0.5;
        }
    } else {
        // IDLE
        torsoAngle = 0;
        legL_Angle = 0.1;
        legR_Angle = -0.1;
        armL_Angle = Math.sin(time) * 0.1 + 0.2;
        armR_Angle = Math.sin(time + Math.PI) * 0.1 - 0.2;
    }

    // DRAW BODY (Layers organized back to front)

    // Back Leg
    drawLimb(ctx, 0, 0, 14, 38, legR_Angle, clothing.bottom, true);
    // Back Shoe
    ctx.save();
    ctx.translate(Math.sin(legR_Angle)*35, Math.cos(legR_Angle)*35);
    drawRoundedRect(ctx, -6, 0, 14, 8, 3, clothing.shoes);
    ctx.restore();

    // AKATSUKI CLOAK (Back)
    if (visualType === 'AKATSUKI') {
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(-15, -20); ctx.lineTo(15, -20);
        ctx.lineTo(25, 40); ctx.lineTo(-25, 40);
        ctx.fill();
    }

    // Back Arm
    // Calculate shoulder pivot relative to torso
    const shoulderY = -45 + breathe;
    // We need to apply torso rotation to find true shoulder point if we want perfect accuracy,
    // but for this simple 2D style, we usually just rotate the limb at the shoulder socket
    
    // Draw Back Arm first
    ctx.save();
    ctx.translate(0, shoulderY);
    // Actually apply torso rotation offset roughly
    ctx.rotate(torsoAngle);
    drawLimb(ctx, 0, 0, 11, 28, armR_Angle - torsoAngle, clothing.top); 
    // Hand
    ctx.translate(Math.sin(armR_Angle - torsoAngle)*25, Math.cos(armR_Angle - torsoAngle)*25);
    drawRoundedRect(ctx, -5, 0, 10, 10, 4, clothing.skin);
    ctx.restore();


    // TORSO
    ctx.save();
    ctx.translate(0, -5 + breathe);
    ctx.rotate(torsoAngle);
    
    ctx.fillStyle = clothing.top;
    ctx.beginPath();
    ctx.moveTo(-14, -45); 
    ctx.lineTo(14, -45); 
    ctx.lineTo(12, 5);  
    ctx.lineTo(-12, 5);  
    ctx.fill();

    if (visualType === 'FLAK_JACKET') {
        ctx.fillStyle = clothing.extra!; 
        ctx.fillRect(-15, -45, 30, 25);
        ctx.fillRect(-14, -50, 28, 6);
        ctx.fillStyle = '#111'; ctx.fillRect(-1, -45, 2, 25);
    } 
    else if (visualType === 'JUMPSUIT') {
         ctx.fillStyle = '#111';
         ctx.beginPath(); ctx.moveTo(-2, -45); ctx.lineTo(2, -45); ctx.lineTo(0, 0); ctx.fill();
         ctx.fillStyle = '#111';
         ctx.fillRect(-13, -48, 26, 6);
    }
    else if (visualType === 'ROBE') {
        ctx.fillStyle = '#1e1b4b'; 
        ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(-5, 0); ctx.lineTo(5, 0); ctx.fill();
        if (clothing.extra) {
            ctx.fillStyle = clothing.extra;
            ctx.fillRect(-14, 0, 28, 8);
            ctx.beginPath(); ctx.arc(0, 4, 6, 0, Math.PI*2); ctx.fill();
        }
    }
    else if (visualType === 'CASUAL' && id === 'sakura') {
        ctx.fillStyle = clothing.bottom; 
        ctx.beginPath();
        ctx.moveTo(-13, 0); ctx.lineTo(13, 0);
        ctx.lineTo(18, 20); ctx.lineTo(-18, 20);
        ctx.fill();
    }

    // HEAD
    ctx.rotate(headAngle); // Look direction
    drawHead(ctx, 0, -48, fighter);

    ctx.restore();

    // Front Leg
    drawLimb(ctx, 0, 0, 14, 38, legL_Angle, clothing.bottom, true);
    ctx.save();
    ctx.translate(Math.sin(legL_Angle)*35, Math.cos(legL_Angle)*35);
    drawRoundedRect(ctx, -6, 0, 14, 8, 3, clothing.shoes);
    ctx.restore();

    // Front Arm
    ctx.save();
    ctx.translate(0, shoulderY);
    ctx.rotate(torsoAngle);
    drawLimb(ctx, 0, 0, 11, 28, armL_Angle - torsoAngle, clothing.top);
    ctx.translate(Math.sin(armL_Angle - torsoAngle)*25, Math.cos(armL_Angle - torsoAngle)*25);
    drawRoundedRect(ctx, -5, 0, 10, 10, 4, clothing.skin);
    if (id === 'kakashi' || id === 'sakura') {
        drawRoundedRect(ctx, -5, -2, 10, 8, 2, '#333');
    }
    ctx.restore();

    // EFFECTS
    if (fighter.meter >= 100) {
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = fighter.config.accentColor;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = fighter.config.accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -20, 35, 60, 0, 0, Math.PI*2);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
    }

    ctx.restore(); // Restore scale/translate
    ctx.globalAlpha = 1.0;
};

export function drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile) {
    ctx.save();
    ctx.translate(p.position.x, p.position.y);
    
    if (p.type === 'SHURIKEN') {
        ctx.rotate(Date.now() / 50);
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        for(let i=0; i<4; i++) {
            ctx.rotate(Math.PI/2);
            ctx.moveTo(0,0); ctx.lineTo(15, 5); ctx.lineTo(0, 10);
        }
        ctx.fill();
        ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(0,0
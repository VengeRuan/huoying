import React, { useRef, useEffect } from 'react';
import { CharacterConfig, FighterData } from '../types';
import { createFighter } from '../utils/gameLogic';
import { drawFighter } from '../utils/renderUtils';

interface CharacterPreviewProps {
    config: CharacterConfig;
    isSelected: boolean;
}

export const CharacterPreview: React.FC<CharacterPreviewProps> = ({ config, isSelected }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    
    const dummyFighterRef = useRef<FighterData>(createFighter(config, 0, 1));

    useEffect(() => {
        dummyFighterRef.current = createFighter(config, 20, 1); 
        dummyFighterRef.current.position.x = 25; 
        dummyFighterRef.current.position.y = 20;
    }, [config]);

    const animate = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        drawFighter(ctx, dummyFighterRef.current, true);

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            width={100} 
            height={150} 
            className={`object-contain pointer-events-none ${isSelected ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'opacity-80'}`}
        />
    );
};
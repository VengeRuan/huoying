import React from 'react';
import { FighterData, CharacterConfig, StageConfig } from '../types';

interface UIOverlayProps {
  p1Current: FighterData | null;
  p2Current: FighterData | null;
  p1Team: FighterData[];
  p2Team: FighterData[];
  timer: number;
  winner: string | null;
  commentary: string;
  gameStarted: boolean;
  stage?: StageConfig;
  onRestart: () => void;
  isLoadingCommentary: boolean;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  p1Current,
  p2Current,
  p1Team,
  p2Team,
  timer,
  winner,
  commentary,
  gameStarted,
  stage,
  onRestart,
  isLoadingCommentary
}) => {
  const p1Max = p1Current ? p1Current.config.maxHealth : 100;
  const p2Max = p2Current ? p2Current.config.maxHealth : 100;

  // STRICT MATH: Clamp values to 0-100 to prevent overflow glitch
  const p1Val = p1Current?.health || 0;
  const p2Val = p2Current?.health || 0;
  
  const p1Percent = Math.min(100, Math.max(0, (p1Val / p1Max) * 100));
  const p2Percent = Math.min(100, Math.max(0, (p2Val / p2Max) * 100));

  // Small character icon generator
  const renderTeamIcons = (team: FighterData[], isLeft: boolean) => (
      <div className={`flex gap-1 mt-2 ${isLeft ? 'justify-start' : 'justify-end'}`}>
          {team.map((member, i) => (
              <div 
                key={i} 
                className={`w-8 h-8 border-2 ${member.health > 0 ? 'border-white bg-gray-700' : 'border-red-900 bg-red-900 opacity-50'} flex items-center justify-center`}
                style={{ backgroundColor: member.health > 0 ? member.config.color : undefined }}
              >
                  <span className="text-[10px] text-white font-bold">{member.config.name.substring(0,1)}</span>
              </div>
          ))}
      </div>
  );

  if (!gameStarted && !winner) return null; 

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
      {/* HUD */}
      <div className="flex flex-col w-full relative z-10">
          <div className="flex w-full items-start justify-between font-bold text-white uppercase tracking-widest">
            
            {/* P1 Health & Info */}
            <div className="relative w-full flex flex-col items-start px-4">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xl text-yellow-400 drop-shadow-md">{p1Current?.config.name}</span>
                    <span className="text-xs text-gray-400">{p1Current?.config.style}</span>
                </div>
                
                {/* Health Bar Container */}
                <div className="h-8 w-full bg-gray-900 border-2 border-white transform -skew-x-12 relative overflow-hidden mb-1">
                     {/* Damage Accumulation (White/Red Shadow) - Slow Decay */}
                    <div 
                        className="absolute top-0 left-0 h-full bg-red-800 transition-all duration-[800ms] ease-out delay-75"
                        style={{ width: `${p1Percent}%` }}
                    />
                    {/* Main Health - Instant Update */}
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-none"
                        style={{ width: `${p1Percent}%` }}
                    />
                </div>
                
                {/* Super Meter */}
                <div className="h-2 w-3/4 bg-gray-900 border border-gray-500 transform -skew-x-12 relative overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-75 ${p1Current?.meter === 100 ? 'bg-white animate-pulse' : 'bg-blue-500'}`}
                        style={{ width: `${p1Current?.meter}%` }}
                    />
                </div>

                {renderTeamIcons(p1Team, true)}
                <div className="mt-1 text-[10px] text-gray-300">
                    WASD: Move | J: Light | K: Heavy | L: Special | I: Super
                </div>
            </div>

            {/* Timer */}
            <div className="h-20 w-24 bg-gray-900 border-4 border-white flex flex-col items-center justify-center shrink-0 mx-2 transform shadow-lg z-20">
                <span className="text-4xl text-yellow-400 font-[Black Ops One]">{timer}</span>
            </div>

            {/* P2 Health & Info */}
            <div className="relative w-full flex flex-col items-end px-4">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs text-gray-400">{p2Current?.config.style}</span>
                    <span className="text-xl text-blue-400 drop-shadow-md">{p2Current?.config.name}</span>
                </div>
                
                {/* Health Bar Container */}
                <div className="h-8 w-full bg-gray-900 border-2 border-white transform skew-x-12 relative overflow-hidden mb-1">
                     {/* Damage Accumulation (White/Red Shadow) - Slow Decay */}
                    <div 
                        className="absolute top-0 right-0 h-full bg-red-800 transition-all duration-[800ms] ease-out delay-75"
                        style={{ width: `${p2Percent}%` }}
                    />
                    {/* Main Health - Instant Update */}
                    <div 
                        className="absolute top-0 right-0 h-full bg-gradient-to-l from-blue-500 to-cyan-300 transition-none"
                        style={{ width: `${p2Percent}%` }}
                    />
                </div>

                {/* Super Meter */}
                <div className="h-2 w-3/4 bg-gray-900 border border-gray-500 transform skew-x-12 relative overflow-hidden">
                     <div 
                        className={`h-full transition-all duration-75 ml-auto ${p2Current?.meter === 100 ? 'bg-white animate-pulse' : 'bg-red-500'}`}
                        style={{ width: `${p2Current?.meter}%` }}
                    />
                </div>

                {renderTeamIcons(p2Team, false)}
            </div>
        </div>
        
        {/* Stage Name */}
        {stage && (
            <div className="text-center mt-2 opacity-80">
                <span className="bg-black/50 px-3 py-1 text-xs text-white border border-gray-600 rounded">{stage.name}</span>
            </div>
        )}
      </div>

      {/* Game Over Screen */}
      {winner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 pointer-events-auto z-30">
          <div className="text-center max-w-2xl px-4 animate-in fade-in zoom-in duration-300">
            <h2 className="text-8xl text-red-600 font-[Black Ops One] mb-2 animate-bounce drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
              K.O.
            </h2>
            <h3 className="text-3xl text-white font-bold mb-6 uppercase tracking-widest">
              Winner: <span className="text-yellow-400">{winner}</span>
            </h3>
            
            {/* Commentary Box */}
            <div className="bg-blue-900/50 border-2 border-blue-400 p-6 rounded-lg mb-8 backdrop-blur-sm relative">
                <div className="absolute -top-3 left-4 bg-blue-500 text-xs px-2 py-1 uppercase font-bold text-white">
                    Announcer (Gemini AI)
                </div>
                {isLoadingCommentary ? (
                     <p className="text-cyan-200 animate-pulse">Analyzing match replay...</p>
                ) : (
                    <p className="text-cyan-100 text-lg italic leading-relaxed">"{commentary}"</p>
                )}
            </div>

            <button 
              onClick={onRestart}
              className="px-8 py-3 bg-white text-black font-bold text-lg uppercase hover:bg-gray-200 transition-colors transform skew-x-12 border-l-8 border-yellow-500"
            >
              Back to Select
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
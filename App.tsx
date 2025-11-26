import React, { useState, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { CharacterPreview } from './components/CharacterPreview';
import { GameResult, FighterData, CharacterConfig, StageConfig } from './types';
import { generateMatchCommentary } from './services/geminiService';
import { ROSTER, STAGES } from './constants';

export default function App() {
  const [gameState, setGameState] = useState<'SELECT' | 'FIGHT' | 'GAMEOVER'>('SELECT');
  
  // Selection State
  const [p1Team, setP1Team] = useState<CharacterConfig[]>([]);
  const [cpuTeam, setCpuTeam] = useState<CharacterConfig[]>([]); // Stable CPU Team State
  
  // Game State
  const [p1CurrentData, setP1CurrentData] = useState<FighterData | null>(null);
  const [p2CurrentData, setP2CurrentData] = useState<FighterData | null>(null);
  const [p1FullTeamData, setP1FullTeamData] = useState<FighterData[]>([]);
  const [p2FullTeamData, setP2FullTeamData] = useState<FighterData[]>([]);
  const [selectedStage, setSelectedStage] = useState<StageConfig>(STAGES[0]);

  const [timer, setTimer] = useState(60);
  const [winner, setWinner] = useState<string | null>(null);
  const [commentary, setCommentary] = useState<string>('');
  const [loadingCommentary, setLoadingCommentary] = useState(false);

  const toggleCharacterSelection = (char: CharacterConfig) => {
      if (p1Team.find(c => c.id === char.id)) {
          setP1Team(p1Team.filter(c => c.id !== char.id));
      } else {
          if (p1Team.length < 3) {
              setP1Team([...p1Team, char]);
          }
      }
  };

  const handleStartMatch = () => {
    if (p1Team.length !== 3) return;
    
    // Randomize CPU Team and STORE IT in state so it doesn't change on re-renders
    const shuffled = [...ROSTER].sort(() => 0.5 - Math.random());
    const newCpuTeam = shuffled.slice(0, 3);
    setCpuTeam(newCpuTeam);
    
    setWinner(null);
    setCommentary('');
    setGameState('FIGHT');
  };

  const handleGameOver = useCallback(async (result: GameResult) => {
    setWinner(result.winner);
    setLoadingCommentary(true);
    setGameState('GAMEOVER');
    
    const comment = await generateMatchCommentary(result);
    setCommentary(comment);
    setLoadingCommentary(false);
  }, []);

  const handleRestart = () => {
      setGameState('SELECT');
      setP1Team([]);
      setWinner(null);
  };

  const updateStats = useCallback((p1: FighterData, p2: FighterData, t: number, team1: FighterData[], team2: FighterData[]) => {
      setP1CurrentData(p1);
      setP2CurrentData(p2);
      setTimer(t);
      setP1FullTeamData(team1);
      setP2FullTeamData(team2);
  }, []);

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-zinc-900 overflow-hidden font-[Press Start 2P]">
        {/* Background Ambient Effects */}
        <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover opacity-30 blur-sm"></div>
        <div className="scanlines"></div>

        {/* --- CHARACTER SELECT SCREEN --- */}
        {gameState === 'SELECT' && (
             <div className="z-20 w-full max-w-4xl bg-black/90 p-8 border-4 border-yellow-600 rounded-lg shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <h1 className="text-4xl text-yellow-400 font-[Black Ops One] mb-2 uppercase text-center">Select Your Team</h1>
                <p className="text-white text-xs mb-6">Choose 3 Fighters</p>
                
                <div className="grid grid-cols-5 gap-4 mb-8">
                    {ROSTER.map(char => {
                        const isSelected = !!p1Team.find(c => c.id === char.id);
                        return (
                            <button
                                key={char.id}
                                onClick={() => toggleCharacterSelection(char)}
                                className={`
                                    relative w-32 h-40 flex flex-col items-center justify-end border-2 transition-all overflow-hidden
                                    ${isSelected ? 'border-yellow-400 bg-yellow-900/50 scale-105' : 'border-gray-600 bg-gray-800 hover:bg-gray-700'}
                                `}
                            >
                                {/* LIVE PREVIEW RENDERER */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CharacterPreview config={char} isSelected={isSelected} />
                                </div>
                                
                                <div className="relative z-10 w-full bg-black/60 p-1 text-center">
                                    <span className="block text-white text-[10px] uppercase font-bold">{char.name}</span>
                                    <span className="block text-gray-400 text-[8px]">{char.style}</span>
                                </div>
                                
                                {isSelected && (
                                    <div className="absolute top-1 right-1 bg-yellow-400 text-black font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs z-20">
                                        {p1Team.findIndex(c => c.id === char.id) + 1}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="flex gap-4 w-full justify-between items-end">
                    <div className="text-white text-xs">
                        <p className="mb-2">Stage Select:</p>
                        <div className="flex gap-2">
                            {STAGES.map(stage => (
                                <button 
                                    key={stage.id}
                                    onClick={() => setSelectedStage(stage)}
                                    className={`px-3 py-2 text-[10px] border ${selectedStage.id === stage.id ? 'bg-blue-600 border-white' : 'border-gray-600 text-gray-400'}`}
                                >
                                    {stage.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleStartMatch}
                        disabled={p1Team.length !== 3}
                        className={`
                            px-8 py-4 text-xl font-bold uppercase tracking-wider transform -skew-x-12 border-4
                            ${p1Team.length === 3 
                                ? 'bg-red-600 text-white border-white hover:bg-red-500 cursor-pointer animate-pulse' 
                                : 'bg-gray-800 text-gray-500 border-gray-600 cursor-not-allowed'}
                        `}
                    >
                        READY?
                    </button>
                </div>
             </div>
        )}

        {/* --- MAIN GAME --- */}
        {(gameState === 'FIGHT' || gameState === 'GAMEOVER') && (
            <div className="relative w-full max-w-[1024px] aspect-video shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 bg-black">
                <GameCanvas 
                    gameStarted={true} 
                    p1TeamConfig={p1Team}
                    p2TeamConfig={cpuTeam} 
                    stage={selectedStage}
                    onGameOver={handleGameOver}
                    updateStats={updateStats}
                />
                <UIOverlay 
                    p1Current={p1CurrentData}
                    p2Current={p2CurrentData}
                    p1Team={p1FullTeamData}
                    p2Team={p2FullTeamData}
                    timer={timer}
                    winner={winner}
                    commentary={commentary}
                    gameStarted={true}
                    stage={selectedStage}
                    onRestart={handleRestart}
                    isLoadingCommentary={loadingCommentary}
                />
            </div>
        )}

        <div className="absolute bottom-4 text-gray-500 text-[10px] font-mono">
            KOF: Gemini Arena © 2024 | Powered by Google Gemini API
        </div>
    </div>
  );
}
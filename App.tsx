
import React, { useState, useEffect, useRef } from 'react';
import { LEVELS, MAX_LEVEL } from './constants';
import { Soldier } from './components/Soldier';
import { PhotoEditor } from './components/PhotoEditor';
import { InteractiveProp } from './components/InteractiveProp';
import { Image as ImageIcon, Dumbbell, Volume2, VolumeX, Medal, Lock } from 'lucide-react';
import { initAudio, playJumpSound } from './utils/audio';

// Reliable public domain military march (John Philip Sousa)
const BGM_URL = "https://upload.wikimedia.org/wikipedia/commons/3/35/Sousa_-_The_Stars_and_Stripes_Forever.ogg";

export default function App() {
  // Global State
  const [gameStarted, setGameStarted] = useState(false);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'GAME' | 'EDITOR'>('GAME');

  // Game State
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [jumpsInLevel, setJumpsInLevel] = useState(0);
  const [totalJumps, setTotalJumps] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isConfinement, setIsConfinement] = useState(false);
  
  // Visual Effects State
  const [ripples, setRipples] = useState<{id: number, x: number, y: number}[]>([]);
  const [shake, setShake] = useState(false);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentLevel = LEVELS[currentLevelIndex];

  // Initialize Audio
  const startGame = () => {
    initAudio();
    setGameStarted(true);
    // Attempt to play BGM immediately on start
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  // Toggle Mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering jump
    setIsMuted(!isMuted);
    if (audioRef.current) {
      if (!isMuted) { // turning mute ON
        audioRef.current.pause();
      } else { // turning mute OFF
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  };

  // Confinement Logic: 5 Second Timeout
  useEffect(() => {
    // Only run timer if game is active, not in editor, not already confined
    if (!gameStarted || currentTab !== 'GAME' || isConfinement) return;

    const timer = setTimeout(() => {
      setIsConfinement(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [totalJumps, gameStarted, currentTab, isConfinement]);

  const handleRepent = () => {
    setIsConfinement(false);
    setJumpsInLevel(0);
    
    // Resume Audio if needed
    if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(() => {});
    }
  };

  // Game Logic: Handle Jump
  const handleJump = (e: React.MouseEvent) => {
    if (isAnimating || isConfinement) return; 
    
    // Add Click Ripple
    const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    // Audio Context
    initAudio();
    if (audioRef.current && audioRef.current.paused && !isMuted) {
       audioRef.current.play().catch(() => {});
    }
    
    // Play SFX
    if (!isMuted) {
      playJumpSound();
    }

    setIsAnimating(true);
    setJumpsInLevel((prev) => prev + 1);
    setTotalJumps((prev) => prev + 1);

    // Landing Effect (Screen Shake)
    setTimeout(() => {
      setIsAnimating(false);
      setShake(true);
      setTimeout(() => setShake(false), 200); // Short shake duration
    }, 600);
  };

  // Game Logic: Check Progression
  useEffect(() => {
    if (jumpsInLevel >= currentLevel.requiredJumps) {
      setTimeout(() => {
        if (currentLevelIndex < MAX_LEVEL - 1) {
          setCurrentLevelIndex(prev => prev + 1);
          setJumpsInLevel(0);
        } else {
          alert(`恭喜退伍！你總共跳了 ${totalJumps + 1} 下。現在，從頭開始你的下一輪人生吧！(循環輪迴)`);
          setCurrentLevelIndex(0);
          setJumpsInLevel(0);
          setTotalJumps(0);
        }
      }, 650);
    }
  }, [jumpsInLevel, currentLevel.requiredJumps, currentLevelIndex, totalJumps]);

  // --- Render Functions ---

  const renderStartScreen = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-stone-900 text-stone-100">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 animate-pulse"
            style={{ 
              backgroundImage: `url(${LEVELS[0].bgImage})`,
              animationDuration: '10s' 
            }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-transparent to-stone-900/80" />

        <div className="z-10 flex flex-col items-center text-center space-y-8 p-6 animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-green-800 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(22,101,52,0.6)] mb-4 border-4 border-yellow-600/50">
               <Medal className="w-12 h-12 text-yellow-500 drop-shadow-md" />
            </div>

            <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter drop-shadow-2xl text-yellow-500 stroke-black">
                    二兵楊維中
                </h1>
                <h2 className="text-3xl md:text-4xl font-bold tracking-[0.2em] drop-shadow-lg text-stone-200">
                    的軍旅生涯
                </h2>
            </div>
            
            <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border-l-4 border-green-600 max-w-xs">
              <p className="text-stone-300 text-sm font-mono leading-relaxed">
                  這是一個關於汗水、淚水與交互蹲跳的故事。<br/>
                  準備好面對連長的咆哮了嗎？
              </p>
            </div>

            <button 
                onClick={startGame}
                className="group relative px-10 py-4 bg-green-700 hover:bg-green-600 text-white font-bold text-xl rounded-sm shadow-[0_0_20px_rgba(21,128,61,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)] transition-all transform active:scale-95 border-2 border-green-500/30 mt-8"
            >
                <span className="flex items-center gap-3 tracking-widest">
                    入伍報到
                </span>
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/50 group-hover:border-white transition-colors" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/50 group-hover:border-white transition-colors" />
            </button>
        </div>
        
        <div className="absolute bottom-6 text-[10px] text-stone-600 font-mono tracking-widest">
            SIMULATION // RECRUIT // TRAINING
        </div>
    </div>
  );

  const renderConfinement = () => (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
        <div 
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, #111 40px, #111 50px)'
          }}
        />
        
        <div className="z-10 bg-stone-800 p-8 rounded-xl border-2 border-red-900 shadow-2xl max-w-sm w-full text-center space-y-6 transform scale-110">
            <div className="w-20 h-20 bg-red-950 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-900/50">
               <Lock className="w-10 h-10 text-red-500" />
            </div>
            
            <div>
              <h2 className="text-4xl font-black text-red-500 tracking-widest mb-2">禁閉室</h2>
              <p className="text-stone-400 font-medium">
                動作太慢！懷疑啊？<br/>
                超過五秒沒動作，直接關禁閉！
              </p>
            </div>

            <button 
              onClick={handleRepent}
              className="w-full py-4 bg-stone-700 hover:bg-stone-600 border border-stone-500 text-stone-200 font-bold rounded shadow-lg active:scale-95 transition-all"
            >
              寫悔過書 (重置本關)
            </button>
        </div>
    </div>
  );

  const renderGame = () => (
    <div 
      className={`relative w-full h-full flex flex-col items-center overflow-hidden`}
      onClick={handleJump}
    >
      {/* Dynamic Background Image with Shake Effect */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-in-out ${shake ? 'animate-shake' : ''}`}
        style={{ backgroundImage: `url(${currentLevel.bgImage})` }}
      />
      <div className={`absolute inset-0 opacity-70 transition-colors duration-1000 ${currentLevel.bgColor}`}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none"></div>

      {/* Interactive Background Prop */}
      <InteractiveProp levelId={currentLevel.id} />

      {/* Click Ripples */}
      {ripples.map(ripple => (
        <div 
          key={ripple.id}
          className="absolute rounded-full border-2 border-white/50 animate-scale-up-fade pointer-events-none z-40"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {isConfinement && renderConfinement()}

      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-black/60 transition-all"
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      <div className="z-10 w-full max-w-md mt-6 px-4 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center shadow-xl">
          <h1 className={`text-3xl font-black tracking-widest mb-1 drop-shadow-md ${currentLevel.accentColor}`}>
            {currentLevel.name}
          </h1>
          <p className="text-white/90 text-sm font-medium mb-4 shadow-black drop-shadow-sm">
            {currentLevel.description}
          </p>
          
          <div className="w-full bg-black/60 h-3 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-yellow-400 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
              style={{ width: `${(jumpsInLevel / currentLevel.requiredJumps) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1 text-white/80 font-mono font-bold">
             <span>Level {currentLevel.id}/{MAX_LEVEL}</span>
             <span>{jumpsInLevel} / {currentLevel.requiredJumps} 次</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-0 cursor-pointer select-none tap-highlight-transparent pb-10">
        
        {totalJumps === 0 && !isAnimating && !isConfinement && (
          <div className="absolute top-10 animate-bounce text-yellow-400 text-lg font-bold tracking-wider pointer-events-none drop-shadow-md bg-black/50 px-4 py-1 rounded-full border border-yellow-400/50">
             點擊螢幕開始跳躍！
          </div>
        )}
        
        {isAnimating && (
           <div className="absolute top-10 animate-ping text-white/50 text-xl font-bold tracking-wider pointer-events-none drop-shadow-md">
             {totalJumps % 2 === 0 ? "二！" : "一！"}
           </div>
        )}

        <Soldier isJumping={isAnimating} totalJumps={totalJumps} />
        
        <div className="mt-4 text-7xl font-black text-white/20 select-none pointer-events-none font-mono drop-shadow-lg">
           {totalJumps}
        </div>
      </div>

      <div className="z-20 w-full p-4 pb-8 pointer-events-none">
         <p className="text-center text-white/50 text-xs mb-2 drop-shadow-sm">
            二兵楊維中，交互蹲跳預備！
         </p>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-stone-900">
      <audio ref={audioRef} src={BGM_URL} loop />

      {!gameStarted ? (
        renderStartScreen()
      ) : (
        <>
          <div className="flex-1 relative overflow-hidden">
            {currentTab === 'GAME' ? renderGame() : <PhotoEditor />}
          </div>

          <div className="h-16 bg-stone-950 border-t border-stone-800 flex items-center justify-around z-30 shrink-0 safe-area-bottom">
            <button 
              onClick={() => setCurrentTab('GAME')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentTab === 'GAME' ? 'text-yellow-400 bg-stone-900' : 'text-stone-500 hover:text-stone-300'}`}
            >
              <Dumbbell className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-wide">交互蹲跳</span>
            </button>
            
            <div className="w-[1px] h-8 bg-stone-800"></div>

            <button 
              onClick={() => setCurrentTab('EDITOR')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentTab === 'EDITOR' ? 'text-green-400 bg-stone-900' : 'text-stone-500 hover:text-stone-300'}`}
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-wide">軍旅回憶</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

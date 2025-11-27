import React, { useState, useEffect, useRef } from "react";
import { LEVELS, MAX_LEVEL } from "./constants";
import { Soldier } from "./components/Soldier";
import { InteractiveProp } from "./components/InteractiveProp";
import {
  Image as ImageIcon,
  Dumbbell,
  Volume2,
  VolumeX,
  Medal,
  Lock,
  Skull,
  Pickaxe,
  Gavel,
} from "lucide-react";
import { initAudio, playJumpSound, playPantSound } from "./utils/audio";

// Reliable public domain military march (John Philip Sousa)
const BGM_URL = "bg.m4a";

const INSULTS = [
  "來點會的好不好？",
  "兄弟啊，是不是兄弟就看這把了！",
  "跳高點！",
  "沒吃飯啊？",
  "爛兵！",
  "懷疑啊？",
  "再偷懶試試看！",
  "腳抬高！",
  "太慢了！",
  "軟腳蝦！",
  "想放假？作夢！",
  "慢慢來勒！",
  "你最好是慢慢來！",
  "再混啊！",
  "講也講不聽，聽也聽不懂，懂也不去做，做又做不好！",
  "你是來度假的嗎？",
  "這樣也叫交互蹲跳？",
  "你媽媽知道你這麼廢嗎？",
  "動作像烏龜！",
  "這速度我都睡著了！",
  "連長都看不下去了！",
  "你是來搞笑的嗎？",
];

interface InsultBubble {
  id: number;
  text: string;
  x: number; // Percentage
  y: number; // Percentage
  rot: number; // Rotation deg
}

export default function App() {
  // Global State
  const [gameStarted, setGameStarted] = useState(false);

  // Game State
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [jumpsInLevel, setJumpsInLevel] = useState(0);
  const [totalJumps, setTotalJumps] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isConfinement, setIsConfinement] = useState(false);
  const [isEnding, setIsEnding] = useState(false); // New state for special ending
  const [punishmentCount, setPunishmentCount] = useState(0); // Track failures

  // Visual Effects State
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  const [shake, setShake] = useState(false);
  const [insults, setInsults] = useState<InsultBubble[]>([]);

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
      audioRef.current
        .play()
        .catch((e) => console.log("Audio play failed:", e));
    }
  };

  // Toggle Mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering jump
    setIsMuted(!isMuted);
    if (audioRef.current) {
      if (!isMuted) {
        // turning mute ON
        audioRef.current.pause();
      } else {
        // turning mute OFF
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play failed:", e));
      }
    }
  };

  // Confinement Logic: 5 Second Timeout
  useEffect(() => {
    // Only run timer if game is active, not in editor, not already confined
    if (!gameStarted || isConfinement || isEnding) return;

    const timer = setTimeout(() => {
      setIsConfinement(true);
      setPunishmentCount((prev) => prev + 1);
    }, 5000);

    return () => clearTimeout(timer);
  }, [totalJumps, gameStarted, isConfinement, isEnding]);

  // Panting Sound Logic: Trigger when animation ends
  useEffect(() => {
    if (
      !isAnimating &&
      totalJumps > 0 &&
      !isConfinement &&
      !isEnding &&
      !isMuted &&
      gameStarted
    ) {
      // Only play pant sound if we haven't just finished the level (to avoid overlap with victory/transition)
      // Note: jumpsInLevel is already incremented by handleJump, so if it equals requiredJumps, we are done.
      if (jumpsInLevel < currentLevel.requiredJumps) {
        // 70% chance to play groan to avoid being too repetitive
        if (Math.random() > 0.3) {
          playPantSound();
        }
      }
    }
  }, [
    isAnimating,
    isConfinement,
    isEnding,
    isMuted,
    gameStarted,
    jumpsInLevel,
    currentLevel.requiredJumps,
    totalJumps,
  ]);

  const handleRepent = () => {
    if (isEnding) {
      // Hard reset game from True Ending
      setIsEnding(false);
      setIsConfinement(false);
      setCurrentLevelIndex(0);
      setJumpsInLevel(0);
      setTotalJumps(0);
      setPunishmentCount(0);
    } else if (punishmentCount >= 4) {
      // Hard reset game from Court Martial (Game Over)
      setIsConfinement(false);
      setCurrentLevelIndex(0);
      setJumpsInLevel(0);
      setTotalJumps(0);
      setPunishmentCount(0);
    } else {
      // Soft reset level for Confinement/Mingde
      setIsConfinement(false);
      setJumpsInLevel(0);
    }

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
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
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

    // --- Generate Heckling Insult ---
    const insultText = INSULTS[Math.floor(Math.random() * INSULTS.length)];
    const newInsult: InsultBubble = {
      id: Date.now(),
      text: insultText,
      x: 10 + Math.random() * 80, // Random 10-90% width
      y: 20 + Math.random() * 40, // Random 20-60% height (around head area)
      rot: Math.random() * 20 - 10, // -10 to 10 deg
    };
    setInsults((prev) => [...prev, newInsult]);
    setTimeout(() => {
      setInsults((prev) => prev.filter((i) => i.id !== newInsult.id));
    }, 1000);

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
          setCurrentLevelIndex((prev) => prev + 1);
          setJumpsInLevel(0);
        } else {
          // Final Level Completed -> Go to Confinement (True Ending)
          setIsEnding(true);
          setIsConfinement(true);
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
          animationDuration: "10s",
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
            這是一個關於汗水、淚水與交互蹲跳的故事。
            <br />
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

  const renderConfinement = () => {
    // Determine content based on Punishment Stage
    let title = "禁閉室";
    let description = "動作太慢！懷疑啊？\n超過五秒沒動作，\n直接關進來反省！";
    let btnText = "寫悔過書 (RETRY)";
    let Icon = Lock;
    let themeColor = "red"; // Tailwind color name base
    let borderColor = "border-red-800";
    let iconBg = "bg-red-950 ring-red-900";
    let iconColor = "text-red-500";
    let btnClass =
      "bg-red-900/20 border-red-800 text-red-500 hover:bg-red-900/40";

    // Special Ending (Game Clear but Confinement)
    if (isEnding) {
      title = "永無止盡";
      description =
        "以為跳完就結束了？\n太天真了。\n軍旅生涯是沒有盡頭的輪迴。";
      btnText = "重新輪迴 (RESTART)";
      Icon = Skull;
      themeColor = "stone";
      borderColor = "border-stone-700";
      iconBg = "bg-stone-800 ring-stone-700";
      iconColor = "text-stone-500";
      btnClass =
        "bg-stone-900 border-stone-700 text-stone-500 hover:text-stone-300";
    }
    // Progressive Punishments
    else if (punishmentCount >= 4) {
      title = "軍法審判";
      description = "抗命！敵前逃亡！\n嚴重違反軍紀！\n唯一死刑！";
      btnText = "接受判決 (GAME OVER)";
      Icon = Gavel;
      themeColor = "zinc";
      borderColor = "border-zinc-500";
      iconBg = "bg-black ring-zinc-500";
      iconColor = "text-zinc-200";
      btnClass = "bg-black border-zinc-500 text-zinc-200 hover:bg-zinc-900";
    } else if (punishmentCount === 3) {
      title = "明德班";
      description =
        "屢教不改！\n送去明德班進行感化教育！\n準備好磨掉一層皮了嗎？";
      btnText = "體能訓練 (RETRY)";
      Icon = Pickaxe;
      themeColor = "blue";
      borderColor = "border-blue-800";
      iconBg = "bg-slate-900 ring-blue-900";
      iconColor = "text-blue-500";
      btnClass =
        "bg-slate-900/50 border-blue-800 text-blue-400 hover:bg-slate-800";
    }

    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black animate-in fade-in duration-1000 overflow-hidden">
        {/* Gritty Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-30 pointer-events-none"></div>

        {/* Bars Gradient */}
        <div
          className="absolute inset-0 pointer-events-none opacity-80 z-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 15%, #000 15%, #050505 18%, #1a1a1a 19%, #000 21%)",
            backgroundSize: "100% 100%",
          }}
        />

        {/* Flickering Light Effect */}
        <div className="absolute inset-0 bg-yellow-900/10 animate-flicker pointer-events-none z-10"></div>

        <div className="z-30 flex flex-col items-center max-w-sm w-full p-6 space-y-8">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center ring-4 ring-offset-4 ring-offset-black ${iconBg} shadow-2xl`}
          >
            <Icon className={`w-12 h-12 ${iconColor}`} />
          </div>

          <div className="text-center space-y-4">
            <h2
              className={`text-5xl font-black tracking-widest ${iconColor} drop-shadow-[0_4px_4px_rgba(0,0,0,1)]`}
            >
              {title}
            </h2>

            <div
              className={`bg-black/80 p-4 border ${borderColor} rounded shadow-2xl backdrop-blur-sm`}
            >
              <p className="text-stone-300 font-mono text-lg whitespace-pre-line leading-relaxed">
                {description}
              </p>
            </div>

            {/* Status Indicator */}
            {!isEnding && (
              <div className="flex justify-center gap-2 mt-2">
                {/* 1st Strike */}
                <div
                  className={`w-3 h-3 rounded-full ${
                    punishmentCount >= 1
                      ? "bg-red-600 animate-pulse"
                      : "bg-stone-800"
                  }`}
                />
                {/* 2nd Strike */}
                <div
                  className={`w-3 h-3 rounded-full ${
                    punishmentCount >= 2
                      ? "bg-red-600 animate-pulse"
                      : "bg-stone-800"
                  }`}
                />
                {/* 3rd Strike (Mingde) */}
                <div
                  className={`w-3 h-3 rounded-full ${
                    punishmentCount >= 3
                      ? "bg-blue-500 animate-pulse"
                      : "bg-stone-800"
                  }`}
                />
                {/* 4th Strike (Court Martial) */}
                <div
                  className={`w-3 h-3 rounded-full ${
                    punishmentCount >= 4
                      ? "bg-white animate-pulse"
                      : "bg-stone-800"
                  }`}
                />
              </div>
            )}

            {isEnding && (
              <div className="text-stone-600 font-mono text-xs tracking-[0.5em] mt-4 opacity-50">
                DAY {Math.floor(Math.random() * 1000)} OF CONFINEMENT
              </div>
            )}
          </div>

          <button
            onClick={handleRepent}
            className={`w-full py-4 px-8 border-2 font-black text-xl tracking-widest uppercase transition-all transform active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.8)] ${btnClass}`}
          >
            {btnText}
          </button>
        </div>
      </div>
    );
  };

  const renderGame = () => (
    <div
      className={`relative w-full h-full flex flex-col items-center overflow-hidden`}
      onClick={handleJump}
    >
      {/* Dynamic Background Image with Shake Effect */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-in-out ${
          shake ? "animate-shake" : ""
        }`}
        style={{ backgroundImage: `url(${currentLevel.bgImage})` }}
      />
      <div
        className={`absolute inset-0 opacity-70 transition-colors duration-1000 ${currentLevel.bgColor}`}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none"></div>

      {/* Interactive Background Prop */}
      <InteractiveProp levelId={currentLevel.id} />

      {/* Click Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full border-2 border-white/50 animate-scale-up-fade pointer-events-none z-40"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: "20px",
            height: "20px",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Heckling Bubbles */}
      {insults.map((insult) => (
        <div
          key={insult.id}
          className="absolute z-40 pointer-events-none animate-pop-in-out"
          style={{
            left: `${insult.x}%`,
            top: `${insult.y}%`,
            ["--rot" as any]: `${insult.rot}deg`,
          }}
        >
          <div className="relative bg-white border-2 border-black px-3 py-2 rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] max-w-[150px]">
            <div className="text-black font-bold text-sm md:text-lg leading-tight text-center break-words">
              {insult.text}
            </div>
            {/* Bubble tail */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-black rotate-45"></div>
          </div>
        </div>
      ))}

      {isConfinement && renderConfinement()}

      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-black/60 transition-all"
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6" />
        ) : (
          <Volume2 className="w-6 h-6" />
        )}
      </button>

      <div className="z-10 w-full max-w-md mt-6 px-4 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center shadow-xl">
          <h1
            className={`text-3xl font-black tracking-widest mb-1 drop-shadow-md ${currentLevel.accentColor}`}
          >
            {currentLevel.name}
          </h1>
          <p className="text-white/90 text-sm font-medium mb-4 shadow-black drop-shadow-sm">
            {currentLevel.description}
          </p>

          <div className="w-full bg-black/60 h-3 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-yellow-400 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
              style={{
                width: `${(jumpsInLevel / currentLevel.requiredJumps) * 100}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1 text-white/80 font-mono font-bold">
            <span>
              Level {currentLevel.id}/{MAX_LEVEL}
            </span>
            <span>
              {jumpsInLevel} / {currentLevel.requiredJumps} 次
            </span>
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

        <Soldier
          isJumping={isAnimating}
          totalJumps={totalJumps}
          levelId={currentLevel.id}
        />

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
          <div className="flex-1 relative overflow-hidden">{renderGame()}</div>
        </>
      )}
    </div>
  );
}

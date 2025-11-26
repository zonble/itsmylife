
import React, { useState, useEffect, useCallback } from 'react';
import { playPropSound } from '../utils/audio';

interface InteractivePropProps {
  levelId: number;
}

type PropState = 'IDLE' | 'HIT' | 'HIDDEN';

export const InteractiveProp: React.FC<InteractivePropProps> = ({ levelId }) => {
  const [state, setState] = useState<PropState>('IDLE');
  const [position, setPosition] = useState({ top: '20%', left: '10%' });
  const [rotation, setRotation] = useState(0);

  // Define prop based on level
  const getPropData = () => {
    switch (levelId) {
      case 1: return { icon: '🐦', type: 'BIRD', label: 'Bird' }; // Parade
      case 2: return { icon: '🦟', type: 'BUG', label: 'Mosquito' }; // Dorm
      case 3: return { icon: '🪰', type: 'BUG', label: 'Fly' }; // Captain Office
      case 4: return { icon: '📄', type: 'PAPER', label: 'Document' }; // Colonel Office
      case 5: return { icon: '🪳', type: 'ROACH', label: 'Roach' }; // Kitchen
      default: return { icon: '✨', type: 'BUG', label: 'Sparkle' };
    }
  };

  const { icon, type } = getPropData();

  // Random movement loop
  useEffect(() => {
    if (state !== 'IDLE') return;

    const moveInterval = setInterval(() => {
      const top = Math.floor(Math.random() * 60) + 10; // 10% to 70%
      const left = Math.floor(Math.random() * 80) + 10; // 10% to 90%
      const rot = Math.floor(Math.random() * 60) - 30; // -30 to 30 deg
      
      setPosition({ top: `${top}%`, left: `${left}%` });
      setRotation(rot);
    }, 3000); // Move every 3 seconds

    return () => clearInterval(moveInterval);
  }, [state, levelId]);

  // Reset when level changes
  useEffect(() => {
    setState('IDLE');
    setPosition({ top: '20%', left: '10%' });
  }, [levelId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent jump
    
    playPropSound(type as any);
    setState('HIT');

    // Respawn logic
    setTimeout(() => {
      setState('HIDDEN');
      setTimeout(() => {
        setState('IDLE');
      }, 2000 + Math.random() * 3000); // Respawn after 2-5s
    }, 500); // Animation duration
  };

  if (state === 'HIDDEN') return null;

  return (
    <div
      onClick={handleClick}
      className={`absolute z-10 text-4xl cursor-pointer select-none transition-all duration-[3000ms] ease-in-out
        ${state === 'HIT' ? 'scale-150 opacity-0 duration-200' : 'scale-100 opacity-80 hover:scale-125 duration-[3000ms]'}
        ${type === 'BIRD' ? 'animate-bounce' : ''}
      `}
      style={{
        top: position.top,
        left: position.left,
        transform: `rotate(${rotation}deg) ${state === 'HIT' ? 'scale(1.5)' : ''}`,
        transitionProperty: state === 'HIT' ? 'all' : 'top, left, transform',
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
      }}
      aria-label="Interactive background prop"
    >
      {state === 'HIT' && (type === 'BUG' || type === 'ROACH') ? '💥' : icon}
    </div>
  );
};

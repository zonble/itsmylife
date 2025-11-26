import React from 'react';

interface SoldierProps {
  isJumping: boolean;
  totalJumps?: number;
}

export const Soldier: React.FC<SoldierProps> = ({ isJumping, totalJumps = 0 }) => {
  // Determine which leg is forward based on jump count.
  const isLeftLegForward = totalJumps % 2 === 0;

  return (
    <div className={`relative w-72 h-80 mx-auto transition-transform will-change-transform ${isJumping ? 'animate-jump' : ''}`}>
        {/* Adjusted ViewBox for better positioning of deep squat */}
        <svg viewBox="0 0 200 260" className="w-full h-full drop-shadow-2xl overflow-visible" fill="none">
            {/* --- Defs for Gradients/Patterns --- */}
            <defs>
              <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5d0b0" />
                <stop offset="100%" stopColor="#e5b090" />
              </linearGradient>
              <linearGradient id="shirtGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4f7716" />
                <stop offset="100%" stopColor="#36530f" />
              </linearGradient>
              <pattern id="camoPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <rect width="30" height="30" fill="#4b5320" />
                <path d="M0,0 C10,10 20,0 25,10 V15 H5 Z" fill="#2f3515" />
                <path d="M10,15 C15,25 25,15 30,20 V30 H10 Z" fill="#1a1c0d" />
                <circle cx="15" cy="15" r="3" fill="#3a401a" />
              </pattern>
            </defs>

            {/* --- LEGS & LOWER BODY --- */}
            <g transform="translate(0, 0)">
              {isJumping ? (
                 /* JUMPING LEGS (Mid-Air) - Both legs extended downwards */
                 <g id="legs-jump">
                    {/* Left Leg (Hanging) */}
                    <path d="M85 150 L 85 200 L 80 240" stroke="url(#camoPattern)" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Right Leg (Hanging) */}
                    <path d="M115 150 L 115 200 L 120 240" stroke="url(#camoPattern)" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Boots */}
                    <path d="M68 240 L 92 240 L 92 258 L 73 258 Z" fill="#111" />
                    <path d="M108 240 L 132 240 L 127 258 L 108 258 Z" fill="#111" />
                 </g>
              ) : isLeftLegForward ? (
                 /* DEEP LUNGE LEFT (Left leg forward, Right leg back) */
                 <g id="legs-lunge-left">
                    {/* Right Leg (Back) - KNEE VERY LOW, almost touching ground */}
                    {/* Thigh goes back and down. Shin goes back. */}
                    <path d="M115 170 L 155 220 L 175 220" stroke="url(#camoPattern)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Boot - Toe on ground */}
                    <path d="M165 220 L 185 220 L 185 235 L 170 235 Z" fill="#111" />

                    {/* Left Leg (Front) - Thigh Parallel to ground (Deep) */}
                    <path d="M85 170 L 50 170 L 50 220" stroke="url(#camoPattern)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Boot - Flat on ground */}
                    <path d="M35 220 L 65 220 L 65 235 L 35 235 Z" fill="#111" />
                 </g>
              ) : (
                 /* DEEP LUNGE RIGHT (Right leg forward, Left leg back) */
                 <g id="legs-lunge-right">
                    {/* Left Leg (Back) */}
                    <path d="M85 170 L 45 220 L 25 220" stroke="url(#camoPattern)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Boot */}
                    <path d="M15 220 L 35 220 L 35 235 L 20 235 Z" fill="#111" />

                    {/* Right Leg (Front) */}
                    <path d="M115 170 L 150 170 L 150 220" stroke="url(#camoPattern)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Boot */}
                    <path d="M135 220 L 165 220 L 165 235 L 135 235 Z" fill="#111" />
                 </g>
              )}
            </g>


            {/* --- TORSO --- */}
            {/* If landed (not jumping), lower the torso significantly for the deep squat effect */}
            <g transform={isJumping ? "translate(0,0)" : "translate(0, 30)"} className="transition-transform duration-100">
                <path d="M70 70 L 130 70 L 125 150 L 75 150 Z" fill="url(#shirtGrad)" /> 
                
                {/* Sweat stains on armpits */}
                <ellipse cx="78" cy="85" rx="8" ry="12" fill="#304a0b" opacity="0.6" />
                <ellipse cx="122" cy="85" rx="8" ry="12" fill="#304a0b" opacity="0.6" />

                {/* Belt */}
                <rect x="75" y="145" width="50" height="10" fill="#111" rx="2" />
                <rect x="95" y="145" width="10" height="10" fill="#888" rx="1" />


                {/* --- ARMS --- */}
                {/* Right Arm - Elbows pointing out */}
                <path d="M125 75 L 165 60 L 120 40" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M125 75 L 150 66" stroke="url(#shirtGrad)" strokeWidth="17" strokeLinecap="round" />

                {/* Left Arm */}
                <path d="M75 75 L 35 60 L 80 40" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M75 75 L 50 66" stroke="url(#shirtGrad)" strokeWidth="17" strokeLinecap="round" />


                {/* --- HEAD --- */}
                <g transform="translate(100, 50)">
                   {/* Neck */}
                   <rect x="-10" y="10" width="20" height="15" fill="url(#skinGrad)" />
                   
                   {/* Face Shape */}
                   <ellipse cx="0" cy="0" rx="23" ry="26" fill="url(#skinGrad)" />
                   
                   {/* Sweat drops */}
                   {!isJumping && (
                       <>
                         <circle cx="-15" cy="-10" r="1.5" fill="#aaddff" className="animate-ping" style={{animationDuration: '1.5s'}} />
                         <circle cx="18" cy="-5" r="2" fill="#aaddff" className="animate-ping" style={{animationDuration: '2s'}} />
                       </>
                   )}

                   {/* Ears */}
                   <circle cx="-23" cy="0" r="5" fill="url(#skinGrad)" />
                   <circle cx="23" cy="0" r="5" fill="url(#skinGrad)" />

                   {/* Hair (Buzz cut) */}
                   <path d="M-21 -10 Q 0 -36 21 -10 L 23 -5 Q 0 -29 -23 -5 Z" fill="#1a1a1a" />

                   {/* Glasses */}
                   <g stroke="#111" strokeWidth="1.5" fill="none">
                     <rect x="-19" y="-5" width="17" height="11" rx="2" fill="rgba(255,255,255,0.2)" />
                     <rect x="2" y="-5" width="17" height="11" rx="2" fill="rgba(255,255,255,0.2)" />
                     <line x1="-2" y1="0" x2="2" y2="0" />
                     <line x1="-19" y1="0" x2="-23" y2="-2" />
                     <line x1="19" y1="0" x2="23" y2="-2" />
                   </g>

                   {/* EXPRESSION */}
                   {isJumping ? (
                     // JUMPING: Focused, mouth open in 'O'
                     <g>
                        {/* Eyes Open */}
                        <circle cx="-8" cy="0" r="1.5" fill="#111" />
                        <circle cx="8" cy="0" r="1.5" fill="#111" />
                        <circle cx="0" cy="15" r="5" fill="#333" /> {/* Mouth */}
                     </g>
                   ) : (
                     // LANDED/LUNGE: PAINFUL
                     <g>
                        {/* Eyes Squeezed Shut (> <) */}
                        <path d="M-12 -2 L -6 2 M -12 2 L -6 -2" stroke="#111" strokeWidth="2" />
                        <path d="M6 -2 L 12 2 M 6 2 L 12 -2" stroke="#111" strokeWidth="2" />
                        
                        {/* Eyebrows deeply furrowed */}
                        <path d="M-14 -8 L -4 -5" stroke="#111" strokeWidth="1" />
                        <path d="M14 -8 L 4 -5" stroke="#111" strokeWidth="1" />

                        {/* Mouth: Gritted teeth / Gasping */}
                        <rect x="-6" y="12" width="12" height="6" rx="2" fill="#fff" stroke="#333" strokeWidth="1" />
                        <line x1="-6" y1="15" x2="6" y2="15" stroke="#333" strokeWidth="0.5" />
                        <line x1="-2" y1="12" x2="-2" y2="18" stroke="#333" strokeWidth="0.5" />
                        <line x1="2" y1="12" x2="2" y2="18" stroke="#333" strokeWidth="0.5" />
                     </g>
                   )}
                </g>
            </g>

        </svg>
        
        {/* Shadow */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/50 rounded-[100%] blur-md transition-all duration-300 will-change-transform"
          style={{ 
            width: isJumping ? '8rem' : '10rem',
            height: isJumping ? '1rem' : '1.5rem',
            opacity: isJumping ? 0.3 : 0.6,
          }}
        ></div>
    </div>
  );
};
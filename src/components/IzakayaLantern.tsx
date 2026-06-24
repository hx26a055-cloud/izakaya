import React from 'react';
import { motion } from 'motion/react';

interface IzakayaLanternProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  glowing?: boolean;
}

export default function IzakayaLantern({ text, size = 'md', glowing = true }: IzakayaLanternProps) {
  const sizeClasses = {
    sm: {
      lantern: 'w-10 h-14 text-xs font-bold px-1 py-2',
      topcap: 'w-6 h-1',
      bottomcap: 'w-4 h-1.5',
      tassel: 'h-2 w-0.5',
    },
    md: {
      lantern: 'w-16 h-24 text-sm font-bold px-2 py-4',
      topcap: 'w-10 h-2',
      bottomcap: 'w-6 h-3',
      tassel: 'h-4 w-1',
    },
    lg: {
      lantern: 'w-24 h-36 text-lg font-extrabold px-3 py-6',
      topcap: 'w-16 h-3',
      bottomcap: 'w-10 h-4.5',
      tassel: 'h-6 w-1.5',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center select-none">
      {/* Hanging string */}
      <div className="w-0.5 h-4 bg-stone-700" />
      
      {/* Top cap */}
      <div className={`${classes.topcap} bg-stone-900 rounded-t-sm`} />
      
      {/* Main Lantern body */}
      <motion.div
        className={`${classes.lantern} relative bg-red-600 rounded-2xl flex flex-col items-center justify-center text-center text-amber-100 shadow-lg border-2 border-red-700 leading-tight writing-mode-vertical`}
        animate={glowing ? {
          boxShadow: [
            '0 0 10px rgba(239, 68, 68, 0.4)',
            '0 0 25px rgba(239, 68, 68, 0.7)',
            '0 0 10px rgba(239, 68, 68, 0.4)'
          ],
          scale: [1, 1.02, 1],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'upright',
        }}
      >
        {/* Lantern ribs details (horizontal lines inside) */}
        <div className="absolute inset-y-0 left-1/4 w-px bg-red-800 opacity-40" />
        <div className="absolute inset-y-0 right-1/4 w-px bg-red-800 opacity-40" />
        <div className="absolute inset-x-0 top-1/4 h-px bg-red-800 opacity-30" />
        <div className="absolute inset-x-0 top-2/4 h-px bg-red-800 opacity-30" />
        <div className="absolute inset-x-0 top-3/4 h-px bg-red-800 opacity-30" />
        
        {/* The text character */}
        <span className="relative z-10 tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          {text}
        </span>
      </motion.div>
      
      {/* Bottom cap */}
      <div className={`${classes.bottomcap} bg-stone-900 rounded-b-sm`} />
      
      {/* Tassel */}
      <div className={`${classes.tassel} bg-red-700 mx-auto rounded-b`} />
    </div>
  );
}

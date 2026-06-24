/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import PlayScreen from './components/PlayScreen';
import GameOverScreen from './components/GameOverScreen';
import { Difficulty, GameStats, HistoryRecord } from './types';
import { setMute, getMuteStatus } from './utils/audio';

export default function App() {
  const [screen, setScreen] = useState<'welcome' | 'play' | 'gameover'>('welcome');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [playerName, setPlayerName] = useState<string>('');
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [gameHistory, setGameHistory] = useState<HistoryRecord[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(getMuteStatus());

  const handleStartGame = (selectedDiff: Difficulty, name: string) => {
    setDifficulty(selectedDiff);
    setPlayerName(name);
    setScreen('play');
  };

  const handleGameOver = (stats: GameStats, history: HistoryRecord[]) => {
    setGameStats(stats);
    setGameHistory(history);
    setScreen('gameover');
  };

  const handleRestart = () => {
    setScreen('play');
  };

  const handleGoToTitle = () => {
    setScreen('welcome');
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    setMute(nextMute);
  };

  return (
    <div className="bg-[#fcfaf2] min-h-screen text-[#1a1a1a] font-serif selection:bg-[#e63946] selection:text-white">
      {screen === 'welcome' && (
        <WelcomeScreen
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'play' && (
        <PlayScreen
          difficulty={difficulty}
          playerName={playerName}
          onGameOver={handleGameOver}
          onExit={handleGoToTitle}
        />
      )}

      {screen === 'gameover' && gameStats && (
        <GameOverScreen
          stats={gameStats}
          history={gameHistory}
          difficulty={difficulty}
          playerName={playerName}
          onRestart={handleRestart}
          onGoToTitle={handleGoToTitle}
        />
      )}
    </div>
  );
}


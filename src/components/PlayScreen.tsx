import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Difficulty, CustomerTable, GameStats, HistoryRecord } from '../types';
import { generateRandomTable, calculateBill } from '../utils/gameData';
import ReceiptSlip from './ReceiptSlip';
import { playSuccessSound, playFailureSound, playClickSound, playWoodBlockSound, playNewTableSound, startBgm, stopBgm, toggleBgm, isBgmActive } from '../utils/audio';
import { Heart, Trophy, DollarSign, Zap, CheckCircle, AlertTriangle, Clock, Keyboard, ArrowLeft, Music } from 'lucide-react';

interface PlayScreenProps {
  difficulty: Difficulty;
  playerName: string;
  onGameOver: (stats: GameStats, history: HistoryRecord[]) => void;
  onExit: () => void;
}

export default function PlayScreen({ difficulty, playerName, onGameOver, onExit }: PlayScreenProps) {
  // Game states
  const [tables, setTables] = useState<CustomerTable[]>([]);
  const [activeTableId, setActiveTableId] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isMobileInputOpen, setIsMobileInputOpen] = useState<boolean>(false);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [tablesServed, setTablesServed] = useState<number>(0);
  const [tablesFailed, setTablesFailed] = useState<number>(0);
  
  // Game limits & Timers
  const [timeLeft, setTimeLeft] = useState<number>(200); // 200 seconds game shift
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; visible: boolean } | null>(null);
  
  const historyRef = useRef<HistoryRecord[]>([]);
  const lastSpawnTime = useRef<number>(Date.now());
  const activeTableIdRef = useRef<string>('');
  activeTableIdRef.current = activeTableId;

  // Sound play guard
  const isCorrectingRef = useRef<boolean>(false);

  // BGM states
  const [isBgmOn, setIsBgmOn] = useState<boolean>(false);

  // Start BGM on mount, stop on unmount
  useEffect(() => {
    // Start BGM
    startBgm();
    setIsBgmOn(isBgmActive());

    return () => {
      stopBgm();
    };
  }, []);

  // Initialize first table
  useEffect(() => {
    const initialTables = [
      generateRandomTable(difficulty, 1),
      generateRandomTable(difficulty, 2)
    ];
    setTables(initialTables);
    setActiveTableId(initialTables[0].id);
    
    // Play start chime
    playWoodBlockSound();
  }, [difficulty]);

  // Play sound when a new table/slip is added
  const prevTablesLengthRef = useRef<number>(0);
  useEffect(() => {
    if (tables.length > prevTablesLengthRef.current) {
      if (prevTablesLengthRef.current > 0) {
        playNewTableSound();
      }
    }
    prevTablesLengthRef.current = tables.length;
  }, [tables.length]);

  // Close mobile input modal when switching active tables
  useEffect(() => {
    setIsMobileInputOpen(false);
  }, [activeTableId]);

  // Game main tick loop (Every 100ms for smooth patience animations)
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Decay shift time (by 0.1s)
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timer);
          triggerGameOver();
          return 0;
        }
        return Number((prev - 0.1).toFixed(1));
      });

      // 2. Decay patience of all waiting tables
      setTables((prevTables) => {
        let updated = prevTables.map((t) => {
          // Hard mode decays patience much faster!
          const decayRate = { easy: 0.8, normal: 1.4, hard: 2.0, master: 2.1, expert: 2.2 }[difficulty];
          const nextPatience = Math.max(0, t.patience - decayRate * 0.1);
          return { ...t, patience: nextPatience };
        });

        // Check if any table run out of patience
        const ranOut = updated.find((t) => t.patience <= 0);
        if (ranOut) {
          // Play fail sound & trigger penalties
          playFailureSound();
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              clearInterval(timer);
              triggerGameOver();
            }
            return nextL;
          });
          setCombo(0);
          setTablesFailed((f) => f + 1);

          // Push to history as missed
          const calc = calculateBill(difficulty, ranOut.guestCount, ranOut.orders, ranOut.coupon);
          historyRef.current.push({
            tableNumber: ranOut.tableNumber,
            guestCount: ranOut.guestCount,
            orders: ranOut.orders,
            coupon: ranOut.coupon || 'none',
            userAnswer: 0,
            correctAnswer: calc.total,
            isCorrect: false,
            timestamp: Date.now(),
          });

          // Show alert banner
          showFeedback(false, `${ranOut.tableNumber}番席のお客様がお怒りで帰られました... (お通し計算ミス扱い)`);

          // Remove table
          updated = updated.filter((t) => t.id !== ranOut.id);
          
          // Switch active table if the active one ran out
          if (activeTableIdRef.current === ranOut.id && updated.length > 0) {
            setActiveTableId(updated[0].id);
          }
        }

        return updated;
      });

      // 3. Spawn new tables periodically
      const now = Date.now();
      const spawnInterval = { easy: 11000, normal: 8500, hard: 6500, master: 6200, expert: 6000 }[difficulty];
      
      // Limit max concurrent waiting tables to 4
      if (now - lastSpawnTime.current > spawnInterval) {
        setTables((prev) => {
          if (prev.length < 4) {
            const nextIdx = prev.length + Math.floor(Math.random() * 10) + 3;
            const newTable = generateRandomTable(difficulty, nextIdx);
            lastSpawnTime.current = now;
            return [...prev, newTable];
          }
          return prev;
        });
      }
    }, 100);

    return () => clearInterval(timer);
  }, [difficulty]);

  // Handle game over trigger
  const triggerGameOver = () => {
    stopBgm();
    const finalStats: GameStats = {
      score,
      totalEarned,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      maxCombo,
      tablesServed,
      tablesFailed,
    };
    onGameOver(finalStats, historyRef.current);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        playClickSound();
        setInputValue((prev) => prev + e.key);
      } else if (e.key === 'Backspace') {
        playClickSound();
        setInputValue((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        playClickSound();
        setInputValue('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, tables, activeTableId]);

  const activeTable = tables.find((t) => t.id === activeTableId);

  // Handle checking the bill calculation
  const handleSubmit = () => {
    if (!activeTable) return;
    const cleanInput = parseInt(inputValue, 10);
    if (isNaN(cleanInput)) return;

    // Close mobile input modal if it was open
    setIsMobileInputOpen(false);

    const calc = calculateBill(difficulty, activeTable.guestCount, activeTable.orders, activeTable.coupon);
    const isCorrect = cleanInput === calc.total;

    if (isCorrect) {
      playSuccessSound();
      
      // Calculate score based on difficulty and speed (remaining patience)
      const basePoints = { easy: 100, normal: 200, hard: 350, master: 420, expert: 500 }[difficulty];
      const speedBonus = Math.floor(activeTable.patience / 10) * 5;
      
      // Combo boost
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((currentMax) => Math.max(currentMax, nextCombo));
      
      const comboMultiplier = 1 + (nextCombo - 1) * 0.1; // +10% per combo step
      const finalPoints = Math.round((basePoints + speedBonus) * comboMultiplier);
      
      setScore((s) => s + finalPoints);
      setTotalEarned((m) => m + calc.total);
      setCorrectCount((c) => c + 1);
      setTablesServed((s) => s + 1);

      // Restore a small bit of patience for OTHER tables as reward!
      setTables((prev) => 
        prev.map((t) => {
          if (t.id === activeTable.id) return t;
          return { ...t, patience: Math.min(t.maxPatience, t.patience + 15) };
        })
      );

      showFeedback(true, `毎度あり！ ${activeTable.tableNumber}番席のお会計 ${calc.total}円 正解です！ (+${finalPoints}pt)`);

      // Push history
      historyRef.current.push({
        tableNumber: activeTable.tableNumber,
        guestCount: activeTable.guestCount,
        orders: activeTable.orders,
        coupon: activeTable.coupon || 'none',
        userAnswer: cleanInput,
        correctAnswer: calc.total,
        isCorrect: true,
        timestamp: Date.now(),
      });

      // Remove this table from queue
      const nextTables = tables.filter((t) => t.id !== activeTable.id);
      setTables(nextTables);
      setInputValue('');

      // Auto-focus next table if exists
      if (nextTables.length > 0) {
        setActiveTableId(nextTables[0].id);
      } else {
        setActiveTableId('');
      }

    } else {
      playFailureSound();
      setWrongCount((w) => w + 1);
      setCombo(0); // Reset combo on mistake

      // Reduce this table's patience heavily as a penalty
      setTables((prev) =>
        prev.map((t) => {
          if (t.id === activeTable.id) {
            return { ...t, patience: Math.max(5, t.patience - 25) };
          }
          return t;
        })
      );

      showFeedback(false, `お会計が違います！ (お客様が少しイライラしています)`);
      setInputValue('');
    }
  };

  const showFeedback = (isCorrect: boolean, message: string) => {
    setFeedback({ isCorrect, message, visible: true });
    // Hide feedback after 3 seconds
    setTimeout(() => {
      setFeedback((f) => (f ? { ...f, visible: false } : null));
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf2] text-[#1a1a1a] flex flex-col p-4 font-serif select-none relative overflow-hidden">
      {/* Background Japanese tavern graphic flavor */}
      <div className="fixed -bottom-16 -right-16 text-[220px] font-black text-black/[0.015] pointer-events-none select-none z-0 leading-none whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
        大入満員
      </div>

      {/* HEADER SECTION */}
      <header className="relative z-10 bg-white border-2 border-[#1a1a1a] rounded-none p-4 flex flex-wrap gap-4 items-center justify-between mb-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        {/* Left header: info */}
        <div className="flex items-center gap-4">
          <button
            id="btn-exit"
            onClick={() => {
              playWoodBlockSound();
              onExit();
            }}
            className="p-2.5 bg-white hover:bg-[#f2ede4] text-[#1a1a1a] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] cursor-pointer transition-all"
            title="メニューに戻る"
          >
            <ArrowLeft className="w-4 h-4 text-[#e63946]" />
          </button>

          <button
            id="btn-bgm"
            onClick={() => {
              playClickSound();
              const bgmActive = toggleBgm();
              setIsBgmOn(bgmActive);
            }}
            className={`p-2.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] cursor-pointer transition-all flex items-center justify-center ${
              isBgmOn 
                ? 'bg-[#fdf0d5] hover:bg-[#fbdcb0] text-[#1a1a1a]' 
                : 'bg-white hover:bg-[#f2ede4] text-stone-400'
            }`}
            title="BGM 再生/一時停止"
          >
            <Music className={`w-4 h-4 ${isBgmOn ? 'text-[#e63946] animate-pulse' : 'text-stone-400'}`} />
          </button>
          
          <div>
            <div className="text-[10px] text-stone-500 font-sans font-bold">担当：{playerName}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-xs px-2.5 py-0.5 rounded-none font-bold font-sans ${
                difficulty === 'easy' ? 'bg-emerald-600 text-white' :
                difficulty === 'normal' ? 'bg-amber-500 text-[#1a1a1a]' :
                difficulty === 'hard' ? 'bg-[#e63946] text-white' :
                difficulty === 'master' ? 'bg-orange-600 text-white' :
                'bg-purple-600 text-white'
              }`}>
                {difficulty === 'easy' ? '初級' : difficulty === 'normal' ? '中級' : difficulty === 'hard' ? '上級' : difficulty === 'master' ? '極' : '超級'}
              </span>
            </div>
          </div>
        </div>

        {/* Center header: Stats display with animations */}
        <div className="flex items-center gap-4 md:gap-8 font-sans">
          {/* Score */}
          <div className="text-center">
            <div className="text-[9px] text-stone-500 font-bold flex items-center justify-center gap-0.5">
              <Trophy className="w-3 h-3 text-[#e63946]" /> 得点
            </div>
            <div className="text-xl font-black text-[#e63946] font-mono">
              {score}
            </div>
          </div>

          {/* Shift Profits */}
          <div className="text-center">
            <div className="text-[9px] text-stone-500 font-bold flex items-center justify-center gap-0.5">
              <DollarSign className="w-3 h-3 text-stone-600" /> 売上高
            </div>
            <div className="text-xl font-black text-stone-800 font-mono">
              ¥{totalEarned.toLocaleString()}
            </div>
          </div>

          {/* Combo */}
          <div className="text-center min-w-[60px]">
            <div className="text-[9px] text-stone-500 font-bold flex items-center justify-center gap-0.5">
              <Zap className="w-3 h-3 text-[#e63946]" /> COMBO
            </div>
            <div className="text-xl font-black text-[#e63946] flex items-center justify-center font-serif">
              {combo > 0 ? (
                <motion.span
                  key={combo}
                  initial={{ scale: 0.6, rotate: -15 }}
                  animate={{ scale: [1.3, 1], rotate: 0 }}
                  className="inline-block"
                >
                  {combo}<span className="text-xs font-bold">連撃</span>
                </motion.span>
              ) : (
                <span className="text-stone-300">-</span>
              )}
            </div>
          </div>

          {/* Remaining Lives */}
          <div className="text-center">
            <div className="text-[9px] text-stone-500 font-bold mb-1">お怒り耐性</div>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3].map((heartIdx) => {
                const isActive = heartIdx <= lives;
                return (
                  <motion.span
                    key={heartIdx}
                    animate={isActive ? { scale: 1 } : { scale: 0.8, opacity: 0.3 }}
                  >
                    <Heart className={`w-4 h-4 ${isActive ? 'text-[#e63946] fill-[#e63946]' : 'text-stone-300'}`} />
                  </motion.span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right header: Time shift limit */}
        <div className="flex items-center gap-2.5 bg-[#f2ede4] border-2 border-[#1a1a1a] px-3 py-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
          <Clock className="w-4 h-4 text-[#e63946]" />
          <div className="text-right font-sans">
            <div className="text-[9px] text-stone-500 font-bold">SHIFT TIME</div>
            <div className={`text-base font-black font-mono ${timeLeft < 15 ? 'text-[#e63946] animate-pulse' : 'text-[#1a1a1a]'}`}>
              {timeLeft.toFixed(1)}s
            </div>
          </div>
        </div>
      </header>

      {/* MAIN GAME INTERFACE */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-hidden">
        
        {/* LEFT COLUMN: Waiting Tables + Detailed Receipt (8 / 12 width) */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 h-full">
          {/* 会計待ち席 Section at the top */}
          <section className="bg-white border-2 border-[#1a1a1a] p-4 flex flex-col justify-start shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] shrink-0">
            <h3 className="text-xs font-black text-[#1a1a1a] pb-2 border-b-2 border-[#1a1a1a] uppercase tracking-wider mb-2.5 flex items-center justify-between font-sans shrink-0">
              <span>会計待ち席 ({tables.length})</span>
              <span className="text-[10px] text-stone-400 font-mono">MAX 4</span>
            </h3>

            <div className="flex flex-row gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {tables.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-2.5 text-stone-400 font-sans">
                  <p className="text-xs font-bold text-stone-500">🏮 現在お会計待ちはいません（しばらくすると会計コールが入ります）</p>
                </div>
              ) : (
                tables.map((table) => {
                  const isActive = table.id === activeTableId;
                  
                  // Color codes for patience levels matching theme
                  const getPatienceColor = (p: number) => {
                    const percentage = (p / table.maxPatience) * 100;
                    if (percentage > 50) return 'bg-[#1a1a1a]';
                    if (percentage > 25) return 'bg-amber-500';
                    return 'bg-[#e63946] animate-pulse';
                  };

                  const patiencePct = (table.patience / table.maxPatience) * 100;

                  return (
                    <button
                      key={table.id}
                      id={`table-queue-item-${table.tableNumber}`}
                      onClick={() => {
                        playClickSound();
                        setActiveTableId(table.id);
                      }}
                      className={`flex-shrink-0 w-36 rounded-none p-2.5 border-2 transition-all text-left flex flex-col gap-1.5 relative cursor-pointer ${
                        isActive
                          ? 'bg-[#f2ede4] border-[#e63946] shadow-[3px_3px_0px_0px_rgba(230,57,70,1)]'
                          : 'bg-[#fcfaf2]/50 border-[#1a1a1a] hover:bg-[#f2ede4] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-sans">
                        <span className="font-black text-xs text-[#1a1a1a] flex items-center gap-1">
                          <span className="text-xs">{table.avatar}</span>
                          {table.tableNumber}
                        </span>
                        <span className="text-[9px] bg-[#1a1a1a] text-white px-1.5 py-0.5 font-bold">
                          {table.guestCount}名
                        </span>
                      </div>

                      {/* Patience Bar */}
                      <div className="w-full bg-[#f2ede4] rounded-none h-2 overflow-hidden border border-[#1a1a1a]">
                        <div
                          className={`h-full transition-all duration-100 ${getPatienceColor(table.patience)}`}
                          style={{ width: `${patiencePct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-sans">
                        <span className="text-stone-500 font-bold">
                          {table.coupon !== 'none' ? '🎟️ 特典割引' : '通常会計'}
                        </span>
                        <span className="font-bold text-[#e63946]">
                          {Math.ceil(table.patience)}秒
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* 伝票 Section at the bottom */}
          <section className="flex-1 bg-white border-2 border-[#1a1a1a] p-4 flex flex-col justify-between items-center relative min-h-0 h-full shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
            {activeTable ? (
              <div className="w-full flex-1 min-h-0 flex flex-col items-stretch justify-stretch">
                <ReceiptSlip 
                  table={activeTable} 
                  difficulty={difficulty} 
                  currentInput={inputValue} 
                  onTapInput={() => {
                    playClickSound();
                    setIsMobileInputOpen(true);
                  }}
                />
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-stone-400 space-y-3 font-sans">
                <span className="text-4xl">📄</span>
                <p className="text-sm font-black text-stone-700">お席を選択してください</p>
                <p className="text-xs max-w-xs text-stone-500">
                  お会計待ち一覧から、伝票を表示したいテーブルをクリックしてください。
                </p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: The Interactive Cash Register (4 / 12 width) */}
        <section className="lg:col-span-4 bg-[#f2ede4]/50 border-2 border-[#1a1a1a] p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] min-h-0 h-full">
          <div className="space-y-4 flex-1 flex flex-col min-h-0 justify-between">
            {/* Cash Register Display Screen */}
            <div className="bg-white border-2 border-[#1a1a1a] p-4 flex flex-col items-end justify-center min-h-[90px] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] relative shrink-0">
              <div className="text-stone-500 text-xs font-sans font-bold select-none">
                {activeTable ? `${activeTable.tableNumber}番席` : 'レジ待機中'}
              </div>
              <div className="text-3xl font-mono font-black text-[#1a1a1a] tracking-wider mt-1 select-none">
                ¥ {inputValue ? parseInt(inputValue, 10).toLocaleString() : '0'}
              </div>
            </div>

            {/* Keyboard input guidance */}
            <div className="bg-white border-2 border-[#1a1a1a] p-4 flex-grow flex flex-col justify-center items-center gap-2 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] text-center min-h-[180px] max-h-[260px]">
              <span className="text-[10px] font-black text-[#e63946] border border-[#e63946] px-2 py-0.5 rounded-none tracking-widest font-sans uppercase">
                キーボード入力対応
              </span>
              <p className="text-xs text-stone-600 font-sans font-bold leading-relaxed mt-1">
                お手元のキーボードまたはテンキーで<br />
                直接金額をご入力ください。
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-[10px] font-mono text-stone-500 text-left border-t border-stone-200 pt-2.5 w-full max-w-[180px] select-none">
                <div className="font-bold text-[#1a1a1a]">[0]〜[9]</div>
                <div>数字入力</div>
                <div className="font-bold text-[#1a1a1a]">[Backspace]</div>
                <div>1文字消す</div>
                <div className="font-bold text-[#1a1a1a]">[C] / [Esc]</div>
                <div>クリア</div>
                <div className="font-bold text-[#1a1a1a]">[Enter]</div>
                <div>会計を送信</div>
              </div>
            </div>
          </div>

          {/* Checkout Submit Button */}
          <button
            id="btn-submit-bill"
            onClick={handleSubmit}
            disabled={!activeTable || !inputValue}
            className={`w-full py-3.5 mt-3 font-black text-base rounded-none transition-all shadow-none text-center flex items-center justify-center gap-1.5 cursor-pointer select-none font-sans border-2 border-[#1a1a1a] ${
              activeTable && inputValue
                ? 'bg-[#e63946] text-white hover:bg-red-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]'
                : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
            }`}
          >
            <span>毎度あり！ (会計を送信)</span>
          </button>
        </section>
      </div>

      {/* FEEDBACK POPUP BANNER AT THE BOTTOM */}
      <AnimatePresence>
        {feedback && feedback.visible && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full px-4"
          >
            <div className={`p-4 rounded-none border-2 border-[#1a1a1a] flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] ${
              feedback.isCorrect
                ? 'bg-[#fcfaf2] text-[#1a1a1a]'
                : 'bg-red-50 text-red-950'
            }`}>
              {feedback.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[#e63946] shrink-0" />
              )}
              <span className="text-xs font-black leading-tight font-sans">{feedback.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE/TABLET DIRECT INPUT OVERLAY MODAL */}
      <AnimatePresence>
        {isMobileInputOpen && activeTable && (
          <div className="fixed inset-0 bg-[#1a1a1a]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-[#fcfaf2] border-4 border-[#1a1a1a] p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col gap-4 relative text-[#1a1a1a]"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  playClickSound();
                  setIsMobileInputOpen(false);
                }}
                className="absolute top-3 right-3 text-2xl font-black text-[#1a1a1a] hover:text-[#e63946] focus:outline-none cursor-pointer p-1"
              >
                ✕
              </button>

              <div className="text-center font-serif">
                <span className="text-[10px] font-black bg-[#e63946] text-white px-2 py-0.5 rounded-none font-sans uppercase tracking-widest">
                  お会計入力 (モバイル)
                </span>
                <h4 className="text-lg font-black text-[#1a1a1a] mt-3">
                  席 {activeTable.tableNumber} のお会計
                </h4>
                <p className="text-[10px] text-stone-500 font-sans font-bold mt-1">
                  （伝票の合計金額を暗算して入力してください）
                </p>
              </div>

              {/* Input container */}
              <div className="flex flex-col gap-1 mt-2">
                <div className="relative flex items-center justify-center">
                  <span className="absolute left-4 text-3xl font-black text-[#1a1a1a] select-none font-sans">¥</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit();
                      }
                    }}
                    className="w-full text-3xl font-black text-center bg-white border-2 border-[#1a1a1a] pl-10 pr-4 py-3 text-[#e63946] focus:ring-0 focus:outline-none tracking-wider font-mono shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
                    placeholder="金額"
                    autoFocus
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3 font-sans">
                <button
                  onClick={() => {
                    playClickSound();
                    setIsMobileInputOpen(false);
                  }}
                  className="bg-white hover:bg-stone-100 text-[#1a1a1a] border-2 border-[#1a1a1a] py-3 text-xs font-black rounded-none shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue}
                  className={`py-3 text-xs font-black rounded-none border-2 border-[#1a1a1a] cursor-pointer text-center ${
                    inputValue
                      ? 'bg-[#e63946] text-white hover:bg-red-500 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[1px] active:translate-y-[1px]'
                      : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
                  }`}
                >
                  会計を確定する
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

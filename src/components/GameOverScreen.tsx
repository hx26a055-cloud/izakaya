import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GameStats, HistoryRecord, Difficulty, HighScore } from '../types';
import { calculateBill } from '../utils/gameData';
import { playGameOverSound, playWoodBlockSound, playClickSound } from '../utils/audio';
import { Trophy, ArrowRight, DollarSign, RefreshCw, BarChart2, Check, X, ShieldAlert, Award } from 'lucide-react';

interface GameOverScreenProps {
  stats: GameStats;
  history: HistoryRecord[];
  difficulty: Difficulty;
  playerName: string;
  onRestart: () => void;
  onGoToTitle: () => void;
}

export default function GameOverScreen({
  stats,
  history,
  difficulty,
  playerName,
  onRestart,
  onGoToTitle,
}: GameOverScreenProps) {
  const [isHighScore, setIsHighScore] = useState(false);

  useEffect(() => {
    // Play Game Over sound
    playGameOverSound();

    // Check and save High Score
    const stored = localStorage.getItem('izakaya_high_scores');
    let currentScores: HighScore[] = [];
    if (stored) {
      try {
        currentScores = JSON.parse(stored);
      } catch (e) {
        currentScores = [];
      }
    }

    const newScore: HighScore = {
      name: playerName || '名無しバイト',
      score: stats.score,
      date: new Date().toLocaleDateString('ja-JP'),
      difficulty,
      correctCount: stats.correctAnswers,
    };

    // Find if this is better than any of the scores in the same difficulty
    const sameDiffScores = currentScores.filter((s) => s.difficulty === difficulty);
    const isBetter = sameDiffScores.length < 5 || sameDiffScores.some((s) => stats.score > s.score);

    if (isBetter) {
      setIsHighScore(true);
    }

    // Append and sort
    const updated = [...currentScores, newScore]
      .sort((a, b) => b.score - a.score);
    
    localStorage.setItem('izakaya_high_scores', JSON.stringify(updated));
  }, [stats, difficulty, playerName]);

  // Determine staff rank title
  const getRankTitle = () => {
    const s = stats.score;
    if (difficulty === 'easy') {
      if (s >= 1500) return { title: '優秀な新人バイト', desc: '手際よくお会計を回してくれました！中級に挑戦しよう！', badge: '🔰' };
      if (s >= 800) return { title: '見習いバイト', desc: '基本的なお会計はマスターできています。', badge: '📝' };
      return { title: 'お皿洗い担当', desc: 'もう少し素早い暗算を頑張りましょう！', badge: '🧽' };
    } else if (difficulty === 'normal') {
      if (s >= 3000) return { title: 'カリスマ店長代理', desc: 'お通し計算もバッチリ！完璧な暗算スキルです！', badge: '👑' };
      if (s >= 1800) return { title: '一人前ホールスタッフ', desc: 'お通しを忘れることなくスマートに会計できました。', badge: '🏃' };
      return { title: 'お冷や出しスタッフ', desc: 'お通し代を足し忘れていませんか？人数を確認しよう！', badge: '🍵' };
    } else if (difficulty === 'hard') {
      if (s >= 4000) return { title: '伝説 of どんちゃん料理人', desc: '消費税10%や割引の荒波をすべて脳内で捌いた奇跡の頭脳！', badge: '⚡' };
      if (s >= 2500) return { title: '敏腕レジ番長', desc: '複雑なパーセンテージ計算も軽々と解き明かす達人。', badge: '🎯' };
      return { title: 'お会計修行中の身', desc: '上級の消費税と10%割引はなかなか手強いですね。特訓しよう！', badge: '🏮' };
    } else if (difficulty === 'master') {
      if (s >= 4500) return { title: '超級レジマスター', desc: '小計が非表示の暗闇の中でも、正確無比な計算を重ねた達人！', badge: '💫' };
      if (s >= 2800) return { title: '超級レジ店員', desc: '小計を素早く脳内計算してスピーディに捌く敏腕スタッフ。', badge: '🥋' };
      return { title: '超級お会計修行僧', desc: '小計がないと部分計算を忘れてしまいがち。落ち着いて合算しましょう！', badge: '🍵' };
    } else {
      if (s >= 5000) return { title: '神速のどんちゃん覇王', desc: '商品名のみの過酷な伝票を、価格暗記で見事に無双！暗算の極地へようこそ！', badge: '🌌' };
      if (s >= 3000) return { title: '極み暗記レジマシーン', desc: 'おしながきを完璧に脳に叩き込み、一瞬の澱みもなく会計を終えた計算マニア。', badge: '🤖' };
      return { title: 'おしながき極み初心者', desc: 'メニューの値段（串130円、一品560円、お酒340円）をまずは完璧に覚えましょう！', badge: '📖' };
    }
  };

  const rank = getRankTitle();
  const accuracy = history.length > 0
    ? Math.round((stats.correctAnswers / history.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#fcfaf2] text-[#1a1a1a] flex flex-col items-center justify-start p-4 font-serif selection:bg-[#e63946] selection:text-white relative overflow-hidden">
      {/* Background Japanese tavern graphic flavor */}
      <div className="fixed -bottom-16 -left-16 text-[220px] font-black text-black/[0.015] pointer-events-none select-none z-0 leading-none whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
        千客万来
      </div>

      {/* Main container */}
      <main className="relative z-10 w-full max-w-4xl bg-[#f2ede4]/60 backdrop-blur-sm rounded-none border-2 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] p-6 md:p-8 my-4 flex flex-col gap-6">
        
        {/* Header decoration */}
        <div className="text-center">
          <span className="text-[10px] text-[#e63946] font-sans font-black tracking-widest block mb-1">
            SHIFT OVER • RECONCILIATION
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-[#1a1a1a]">
            本日の営業 終了！
          </h2>
          <p className="text-stone-600 text-xs mt-1 font-sans">
            お疲れ様でした！本日のレジ精算・売上精算報告です。
          </p>
        </div>

        {/* High Score Celebration */}
        {isHighScore && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [1.05, 1], opacity: 1 }}
            className="bg-[#e63946] text-white border-2 border-[#1a1a1a] rounded-none p-4 text-center flex items-center justify-center gap-3 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
          >
            <span className="text-2xl animate-bounce">🎉</span>
            <div className="font-sans">
              <p className="font-black text-base">ハイスコア更新！</p>
              <p className="text-xs opacity-90 font-bold">素晴らしい暗算スキルで、どんちゃん酒場の売上に大きく貢献しました！</p>
            </div>
            <span className="text-2xl animate-bounce">🎉</span>
          </motion.div>
        )}

        {/* Section 1: Main Stats cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-[#1a1a1a] p-4 rounded-none text-center shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
            <span className="text-[10px] text-stone-500 font-sans font-bold block mb-1">獲得スコア</span>
            <span className="text-2xl font-black font-mono text-[#e63946]">
              {stats.score}<span className="text-xs font-sans text-stone-500 ml-0.5">pt</span>
            </span>
          </div>
          
          <div className="bg-white border-2 border-[#1a1a1a] p-4 rounded-none text-center shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
            <span className="text-[10px] text-stone-500 font-sans font-bold block mb-1">本日の売上高</span>
            <span className="text-2xl font-black font-mono text-stone-800">
              ¥{stats.totalEarned.toLocaleString()}
            </span>
          </div>

          <div className="bg-white border-2 border-[#1a1a1a] p-4 rounded-none text-center shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] font-sans">
            <span className="text-[10px] text-stone-500 font-bold block mb-1">会計成功/お怒り退店</span>
            <span className="text-base font-black text-[#1a1a1a] block mt-1">
              {stats.correctAnswers} <span className="text-xs text-stone-500 font-normal">席</span> / <span className="text-[#e63946] font-mono font-black">{stats.tablesFailed}</span> <span className="text-xs text-stone-500 font-normal">席</span>
            </span>
          </div>

          <div className="bg-white border-2 border-[#1a1a1a] p-4 rounded-none text-center shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] font-sans">
            <span className="text-[10px] text-stone-500 font-bold block mb-1">最大コンボ / 正解率</span>
            <span className="text-base font-black text-[#1a1a1a] block mt-1">
              {stats.maxCombo} <span className="text-xs text-stone-500 font-normal">連撃</span> / <span className="text-[#e63946] font-mono font-black">{accuracy}%</span>
            </span>
          </div>
        </section>

        {/* Section 2: Rank Title */}
        <section className="bg-white border-2 border-[#1a1a1a] rounded-none p-5 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div className="w-14 h-14 rounded-none bg-[#f2ede4] border-2 border-[#1a1a1a] flex items-center justify-center text-3xl shrink-0 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            {rank.badge}
          </div>
          <div>
            <div className="text-[9px] text-[#e63946] font-sans font-black tracking-wider">称号獲得 (STAFF RANK)</div>
            <h4 className="text-lg font-black text-[#1a1a1a] mt-0.5">{rank.title}</h4>
            <p className="text-xs text-stone-600 mt-1 font-sans">{rank.desc}</p>
          </div>
        </section>

        {/* Section 3: Review / Detailed calculations checklist */}
        <section className="space-y-3">
          <h3 className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-[#1a1a1a] pb-2 font-sans">
            <BarChart2 className="w-4 h-4 text-[#e63946]" />
            <span>伝票別の内訳と答え合わせ</span>
          </h3>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6 font-sans">営業中の伝票処理記録はありませんでした。</p>
            ) : (
              history.map((record, index) => {
                const calculations = calculateBill(difficulty, record.guestCount, record.orders, record.coupon);
                const isMissed = record.userAnswer === 0;

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-none border-2 border-[#1a1a1a] text-xs flex flex-col md:flex-row justify-between gap-4 items-stretch bg-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]`}
                  >
                    {/* Left: Table details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#1a1a1a]">
                          {record.tableNumber}番席 ({record.guestCount}名様)
                        </span>
                        {record.isCorrect ? (
                          <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded-none font-sans font-bold text-[9px] flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> 正解
                          </span>
                        ) : isMissed ? (
                          <span className="px-1.5 py-0.5 bg-stone-800 text-white rounded-none font-sans font-bold text-[9px] flex items-center gap-0.5">
                            お怒り退店
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-[#e63946] text-white rounded-none font-sans font-bold text-[9px] flex items-center gap-0.5">
                            <X className="w-3 h-3" /> ミス
                          </span>
                        )}
                      </div>

                      {/* Item summaries list */}
                      <div className="text-[10.5px] text-stone-600 space-y-0.5 font-sans font-semibold">
                        {record.orders.map((line, oIdx) => {
                          const cleanName = difficulty === 'expert'
                            ? line.item.name.replace(/^【[^】]+】/, '')
                            : line.item.name;
                          return (
                            <div key={oIdx}>
                              ・{cleanName} {difficulty !== 'expert' && `(${line.item.price}円)`} × {line.quantity}
                            </div>
                          );
                        })}
                        {record.coupon !== 'none' && (
                          <div className="text-[#e63946] font-black">
                            🎫 クーポン: {
                              record.coupon === 'tenPercentOff' ? '10% OFF 割引券' :
                              record.coupon === 'beerHalfPrice' ? 'ビール半額券' :
                              'お通し代無料券'
                            }
                          </div>
                        )}
                      </div>

                      {/* Math breakdown toggle detail */}
                      <div className="bg-[#f2ede4] border border-[#1a1a1a] rounded-none p-2 text-[10px] text-stone-700 space-y-0.5">
                        <p className="font-black text-[#e63946] font-sans">📊 正しい計算式：</p>
                        {calculations.breakdown.map((b, bIdx) => (
                          <p key={bIdx} className="font-mono font-bold text-stone-800">{b}</p>
                        ))}
                      </div>
                    </div>

                    {/* Right: Answer comparison */}
                    <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-[#1a1a1a] pt-2 md:pt-0 md:pl-4 min-w-[120px] font-mono text-right">
                      <div>
                        <div className="text-[9px] text-stone-500 font-sans font-bold">あなたの回答</div>
                        <div className={`text-sm font-black ${isMissed ? 'text-stone-400' : record.isCorrect ? 'text-emerald-700' : 'text-[#e63946]'}`}>
                          {isMissed ? '無回答' : `¥${record.userAnswer.toLocaleString()}`}
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="text-[9px] text-stone-500 font-sans font-bold">正解金額</div>
                        <div className="text-base font-black text-[#1a1a1a]">
                          ¥{record.correctAnswer.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Section 4: Action Buttons */}
        <section className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            id="btn-restart-game"
            onClick={() => {
              playWoodBlockSound();
              onRestart();
            }}
            className="flex-1 bg-[#e63946] hover:bg-red-500 text-white font-black py-3.5 px-6 rounded-none text-center flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all font-sans"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>もう一度シフトに入る</span>
          </button>

          <button
            id="btn-goto-title"
            onClick={() => {
              playWoodBlockSound();
              onGoToTitle();
            }}
            className="flex-1 bg-white hover:bg-[#f2ede4] text-[#1a1a1a] font-bold py-3.5 px-6 rounded-none text-center flex items-center justify-center gap-2 border-2 border-[#1a1a1a] cursor-pointer shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all font-sans"
          >
            <span>タイトルへ戻る</span>
            <ArrowRight className="w-4 h-4 text-[#e63946]" />
          </button>
        </section>

      </main>
    </div>
  );
}

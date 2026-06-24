import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Difficulty, HighScore } from '../types';
import IzakayaLantern from './IzakayaLantern';
import { playClickSound, playWoodBlockSound } from '../utils/audio';
import { Volume2, VolumeX, ShieldAlert, BookOpen, Star, HelpCircle, Trophy } from 'lucide-react';

interface WelcomeScreenProps {
  onStartGame: (difficulty: Difficulty, playerName: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const DEFAULT_SCORES: HighScore[] = [
  { name: '新人バイト たろう', score: 1800, date: '2026/06/20', difficulty: 'easy', correctCount: 10 },
  { name: '計算おじさん', score: 1200, date: '2026/06/21', difficulty: 'easy', correctCount: 7 },
  { name: '電卓いらず', score: 800, date: '2026/06/22', difficulty: 'easy', correctCount: 5 },
  
  { name: '店長代理 さくら', score: 3200, date: '2026/06/18', difficulty: 'normal', correctCount: 12 },
  { name: 'そろばん検定1級', score: 2400, date: '2026/06/19', difficulty: 'normal', correctCount: 9 },
  { name: 'スピード計算マン', score: 1500, date: '2026/06/22', difficulty: 'normal', correctCount: 6 },
  
  { name: '暗算の神様 けん', score: 5400, date: '2026/06/15', difficulty: 'hard', correctCount: 15 },
  { name: 'そろばん十段', score: 4200, date: '2026/06/17', difficulty: 'hard', correctCount: 12 },
  { name: 'フラッシュ暗算プロ', score: 3000, date: '2026/06/21', difficulty: 'hard', correctCount: 9 },
  
  { name: '電卓の魔術師', score: 6200, date: '2026/06/16', difficulty: 'master', correctCount: 14 },
  { name: '暗算極めし者', score: 4800, date: '2026/06/18', difficulty: 'master', correctCount: 11 },
  { name: 'スピードマスター', score: 3500, date: '2026/06/22', difficulty: 'master', correctCount: 8 },

  { name: 'どんちゃん覇王', score: 7000, date: '2026/06/19', difficulty: 'expert', correctCount: 15 },
  { name: '記憶の達人', score: 5200, date: '2026/06/20', difficulty: 'expert', correctCount: 12 },
  { name: '神速のレジ係', score: 3800, date: '2026/06/23', difficulty: 'expert', correctCount: 9 },
];

export default function WelcomeScreen({ onStartGame, isMuted, onToggleMute }: WelcomeScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [playerName, setPlayerName] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('izakaya_high_scores');
    if (stored) {
      try {
        setHighScores(JSON.parse(stored));
      } catch (e) {
        setHighScores(DEFAULT_SCORES);
      }
    } else {
      localStorage.setItem('izakaya_high_scores', JSON.stringify(DEFAULT_SCORES));
      setHighScores(DEFAULT_SCORES);
    }
  }, []);

  const handleStart = () => {
    playWoodBlockSound();
    const finalName = playerName.trim() || '名無しバイト';
    onStartGame(difficulty, finalName);
  };

  const filteredScores = highScores
    .filter((s) => s.difficulty === difficulty)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#fcfaf2] text-[#1a1a1a] flex flex-col items-center justify-start p-4 font-serif selection:bg-[#e63946] selection:text-white relative overflow-hidden">
      {/* Background Watermarks */}
      <div className="fixed top-1/2 -right-12 -translate-y-1/2 text-[160px] font-black text-black/[0.02] pointer-events-none select-none z-0 leading-none whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
        いらっしゃいませ
      </div>
      <div className="fixed bottom-12 -left-12 text-[140px] font-black text-black/[0.02] pointer-events-none select-none z-0 leading-none whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
        千客万来
      </div>
      
      {/* Header with Lanterns and Title */}
      <header className="relative z-10 w-full max-w-4xl flex items-end justify-between mt-4 mb-6 pb-4 border-b-2 border-[#1a1a1a] px-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#e63946] text-white px-3 py-1.5 text-2xl font-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">匠</div>
          <div className="text-left">
            <span className="text-[10px] text-[#e63946] font-sans font-bold tracking-widest block">
              IZAKAYA MENTAL MATH CHAMPIONSHIP
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-[#1a1a1a]">
              居酒屋暗算マスター
            </h1>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              注文を素早く暗算！お通しや消費税、割引を正確に捌こう！
            </p>
          </div>
        </div>
        <div className="hidden sm:flex gap-4">
          <IzakayaLantern text="暗" size="sm" />
          <IzakayaLantern text="算" size="sm" />
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-4xl bg-[#f2ede4]/60 backdrop-blur-sm rounded-none border-2 border-[#1a1a1a] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-stretch my-2 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
        
        {/* Left Side: Game Setup & Enter Pub */}
        <section className="flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#1a1a1a] border-b border-[#1a1a1a] pb-2 flex items-center gap-2">
              <span className="bg-[#1a1a1a] text-white text-xs px-1.5 py-0.5 font-sans">STEP 01</span> 暖簾をくぐる準備
            </h2>

            {/* Player Name Input */}
            <div>
              <label className="block text-xs text-stone-600 mb-1 font-bold tracking-wider font-sans">
                スタッフの名前（ランキングに登録されます）
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="例: たろう"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                }}
                className="w-full bg-white border-2 border-[#1a1a1a] px-4 py-3 text-[#1a1a1a] text-base focus:border-[#e63946] focus:outline-none transition-colors placeholder:text-stone-400 font-sans font-bold"
              />
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="block text-xs text-stone-600 font-bold tracking-wider font-sans">
                難易度を選択
              </label>
              <div className="grid grid-cols-5 gap-1 md:gap-2">
                {(['easy', 'normal', 'hard', 'master', 'expert'] as const).map((diff) => {
                  const labels = { easy: '初級', normal: '中級', hard: '上級', master: '超級', expert: '極' };
                  const sublabels = { easy: 'お通し無', normal: 'お通し有', hard: 'お通し+税', master: '小計隠し', expert: '商品隠し' };
                  
                  const colors = {
                    easy: 'hover:border-emerald-600 hover:text-emerald-700 text-emerald-800 bg-white border-[#1a1a1a]',
                    normal: 'hover:border-amber-600 hover:text-amber-700 text-amber-800 bg-white border-[#1a1a1a]',
                    hard: 'hover:border-red-600 hover:text-red-700 text-red-800 bg-white border-[#1a1a1a]',
                    master: 'hover:border-orange-600 hover:text-orange-700 text-orange-800 bg-white border-[#1a1a1a]',
                    expert: 'hover:border-purple-600 hover:text-purple-700 text-purple-800 bg-white border-[#1a1a1a]',
                  };
                  const activeColors = {
                    easy: 'border-[#1a1a1a] bg-emerald-600 text-white shadow-none ring-0',
                    normal: 'border-[#1a1a1a] bg-amber-500 text-[#1a1a1a] shadow-none ring-0',
                    hard: 'border-[#1a1a1a] bg-[#e63946] text-white shadow-none ring-0',
                    master: 'border-[#1a1a1a] bg-orange-600 text-white shadow-none ring-0',
                    expert: 'border-[#1a1a1a] bg-purple-600 text-white shadow-none ring-0',
                  };

                  const isActive = difficulty === diff;

                  return (
                    <button
                      key={diff}
                      id={`btn-difficulty-${diff}`}
                      onClick={() => {
                        playClickSound();
                        setDifficulty(diff);
                      }}
                      className={`flex flex-col items-center justify-center p-1 md:p-2 rounded-none border-2 transition-all cursor-pointer font-sans shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] ${
                        isActive ? `${activeColors[diff]} translate-x-[1px] translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]` : `${colors[diff]}`
                      }`}
                    >
                      <span className="text-xs md:text-sm lg:text-base font-black leading-none">{labels[diff]}</span>
                      <span className="text-[7px] md:text-[8px] lg:text-[10px] opacity-90 mt-1 font-bold leading-none">{sublabels[diff]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Difficulty Spec Detail */}
            <div className="bg-white rounded-none p-3 border-2 border-[#1a1a1a] text-xs text-stone-700 space-y-1 font-sans">
              {difficulty === 'easy' && (
                <p>💡 <span className="font-bold text-emerald-700">初級 (お通しなし / 内税)</span>: 注文伝票に書かれた料理・ドリンクの合計金額のみを足せばOK。初めての練習に最適！</p>
              )}
              {difficulty === 'normal' && (
                <p>💡 <span className="font-bold text-amber-700">中級 (お通し 300円/人)</span>: 各テーブルの<span className="underline decoration-amber-600">人数分のお通し代（1人300円）</span>を暗算で足す必要があります！たまに割引券やお通し無料券が提示されます。</p>
              )}
              {difficulty === 'hard' && (
                <p>💡 <span className="font-bold text-red-600">上級 (お通し 350円/人 + 10%消費税)</span>: お通し代は1人350円。さらに割引適用後の合計額に<span className="underline decoration-red-600">外税10%をかけた金額（円未満切り捨て）</span>を足します！プロ級の暗算力が試されます。</p>
              )}
              {difficulty === 'master' && (
                <p>💡 <span className="font-bold text-orange-600">超級 (上級 + 小計隠し)</span>: 計算方法は上級と同じ（お通し350円＋外税10%）ですが、伝票から<span className="underline decoration-orange-600">各メニューの「小計」表示が消えます！</span>単価と個数から頭の中で部分小計を計算する、より高度な暗算力が求められます。</p>
              )}
              {difficulty === 'expert' && (
                <p>💡 <span className="font-bold text-purple-700">極 (上級 + お品書き暗記)</span>: 計算方法は上級と同じ（お通し350円＋外税10%）ですが、伝票から<span className="underline decoration-purple-600">「【一品】」などのカテゴリ名や、商品ごとの単価・小計表示がすべて消えます！</span> どんちゃん酒場のおしながき（串物130円、一品560円、お酒340円）を完全に暗記して挑む超高難度モードです！</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              id="btn-start-game"
              onClick={handleStart}
              className="w-full relative py-4 bg-[#e63946] hover:bg-red-500 text-white font-black text-lg rounded-none border-2 border-[#1a1a1a] transition-all shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] cursor-pointer text-center flex items-center justify-center overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2 tracking-widest">
                🏮 暖簾をくぐる (ゲーム開始)
              </span>
            </button>

            <div className="flex gap-2">
              <button
                id="btn-toggle-rules"
                onClick={() => {
                  playClickSound();
                  setShowRules(!showRules);
                }}
                className="flex-1 bg-white hover:bg-[#f2ede4] text-[#1a1a1a] font-bold py-2.5 px-4 rounded-none border-2 border-[#1a1a1a] text-xs flex items-center justify-center gap-1.5 cursor-pointer font-sans shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]"
              >
                <BookOpen className="w-4 h-4 text-[#e63946]" />
                ルール解説
              </button>
              
              <button
                id="btn-toggle-mute"
                onClick={() => {
                  onToggleMute();
                  if (isMuted) {
                    setTimeout(() => playClickSound(), 50);
                  }
                }}
                className="p-2.5 bg-white hover:bg-[#f2ede4] text-[#1a1a1a] rounded-none border-2 border-[#1a1a1a] cursor-pointer shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]"
                title={isMuted ? 'ミュート解除' : 'ミュート'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-[#e63946]" /> : <Volume2 className="w-4 h-4 text-[#e63946]" />}
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Scoreboards & Rules */}
        <section className="w-full md:w-[320px] bg-white rounded-none p-4 border-2 border-[#1a1a1a] flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div>
            <h3 className="text-xs font-bold text-[#1a1a1a] border-b border-stone-200 pb-2 flex items-center gap-1.5 mb-3 font-sans">
              <Trophy className="w-4 h-4 text-[#e63946]" /> 
              <span>ハイスコアランキング</span>
              <span className="text-[10px] bg-[#1a1a1a] text-white px-1 font-bold">
                {difficulty === 'easy' ? '初級' : difficulty === 'normal' ? '中級' : difficulty === 'hard' ? '上級' : difficulty === 'master' ? '超級' : '極'}
              </span>
            </h3>
            
            <div className="space-y-1 min-h-[180px] font-sans">
              {filteredScores.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-8">スコアがまだありません</p>
              ) : (
                filteredScores.map((score, index) => {
                  const medalColors = ['bg-[#e63946] text-white', 'bg-stone-200 text-stone-800', 'bg-amber-100 text-amber-800'];
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs p-2 rounded-none bg-[#fdfdfd] border border-stone-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold w-5 h-5 flex items-center justify-center text-[10px] ${index < 3 ? medalColors[index] : 'bg-stone-100 text-stone-500'}`}>
                          {index + 1}
                        </span>
                        <span className="font-bold text-stone-800 truncate max-w-[120px]">
                          {score.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-stone-400 text-[10px]">{score.correctCount}席</span>
                        <span className="font-black text-[#e63946]">{score.score}pt</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-200 text-stone-600 text-[11px] space-y-1.5 font-sans">
            <div className="flex items-center gap-1 text-[#1a1a1a] font-bold mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#e63946]" />
              <span>お会計ルール（要チェック！）</span>
            </div>
            <p className="font-bold text-[#e63946]">※価格：串物 130円 / 一品 560円 / お酒 340円</p>
            <p>※キーボードの数字キーやエンターキー入力に対応</p>
            <p>※連続正解で「連撃コンボ」が発生し獲得点がアップ！</p>
            <p>※制限時間がなくなると客が怒って退店（ライフ減）</p>
          </div>
        </section>
      </main>

      {/* Rules overlay Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border-4 border-[#1a1a1a] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 text-[#1a1a1a] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] relative rounded-none"
          >
            <h3 className="text-xl font-black text-[#1a1a1a] mb-4 pb-2 border-b-2 border-[#1a1a1a] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#e63946]" /> 居酒屋暗算マスター ルール
            </h3>
            
            <div className="space-y-4 text-sm leading-relaxed font-sans text-stone-700">
              <div className="bg-[#f2ede4] p-3 border border-[#1a1a1a]">
                <h4 className="font-bold text-[#1a1a1a] mb-1">1. 基本的な流れ</h4>
                <p className="text-xs text-stone-600">
                  居酒屋の会計スタッフとして、次々に会計を呼ぶお客様の「伝票」を正しく計算してレジに入力してください。
                  素早く正確に入力するほど高得点。ライフが0になるか、タイムアップで営業終了です。
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#1a1a1a]">2. 各難易度の計算式（重要）</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  <div className="bg-emerald-50 p-2 border border-emerald-300 text-xs text-emerald-950">
                    <span className="font-black text-emerald-800 text-xs block">初級</span>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-[11px]">
                      <li>料理代のみ加算</li>
                      <li>お通し代なし</li>
                      <li>消費税なし</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 p-2 border border-amber-300 text-xs text-amber-950">
                    <span className="font-black text-amber-800 text-xs block">中級</span>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-[11px]">
                      <li>お通し代: <span className="text-[#e63946] font-bold">1人300円</span>を合計に加算</li>
                      <li>消費税なし</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-2 border border-red-300 text-xs text-red-950">
                    <span className="font-black text-[#e63946] text-xs block">上級</span>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-[11px]">
                      <li>お通し代: <span className="font-bold text-[#e63946]">1人350円</span></li>
                      <li>最後に<span className="font-bold text-[#e63946]">外税10%</span>を加算</li>
                      <li>※円未満切り捨て</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-2 border border-orange-300 text-xs text-orange-950">
                    <span className="font-black text-orange-800 text-xs block">超級</span>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-[11px]">
                      <li>計算ルールは<span className="font-bold text-orange-700">上級と同じ</span></li>
                      <li>伝票から各メニューの<span className="font-bold text-orange-700">「小計」が非表示！</span></li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-2 border border-purple-300 text-xs text-purple-950">
                    <span className="font-black text-purple-800 text-xs block">極</span>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-[11px]">
                      <li>計算ルールは<span className="font-bold text-purple-700">上級と同じ</span></li>
                      <li>伝票の<span className="font-bold text-purple-700">カテゴリ名、単価、小計、メニュー価格が全非表示！</span>お品書きを暗記！</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-[#f2ede4] p-3 border border-stone-300">
                <h4 className="font-bold text-[#1a1a1a] mb-1">3. お得なクーポン割引</h4>
                <p className="text-xs text-stone-600 mb-1">
                  テーブルによっては、割引クーポンを提示してくることがあります。
                </p>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li><span className="font-bold text-[#e63946]">10% OFF 割引券</span>: お通しを含む全体から10%割引（円未満切り捨て）。※上級・超級・極では割引後に消費税をかけます。</li>
                  <li><span className="font-bold text-[#e63946]">お通し代 無料券</span>: その席の全員分のお通し代（中級300円/人、上級・超級・極350円/人）が0円になります。</li>
                  <li><span className="font-bold text-[#e63946]">ビール半額券</span>: 伝票の中の「生ビール」が、1杯340円の半額の「170円」として計算されます。</li>
                </ul>
              </div>

              {/* Tavern Menu Sheet Section */}
              <div className="bg-[#fcfaf2] border-2 border-dashed border-[#1a1a1a] p-4 font-serif relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                {/* Background red stamp flavor */}
                <div className="absolute -top-6 -right-6 text-red-500/10 text-8xl font-black rotate-12 select-none pointer-events-none">
                  どんちゃん
                </div>

                <div className="text-center mb-3">
                  <span className="text-[10px] text-stone-400 font-sans tracking-widest block font-bold">DONCHAN TAVERN PRICE LIST</span>
                  <h4 className="text-base font-black text-[#1a1a1a] border-b-2 border-[#1a1a1a] pb-1 inline-block">大衆酒場 どんちゃん おしながき</h4>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Category 1: Skewers */}
                  <div className="bg-white border border-[#1a1a1a] p-2.5 flex flex-col justify-between">
                    <div>
                      <div className="bg-[#1a1a1a] text-white text-center py-0.5 text-xs font-black tracking-widest mb-2">
                        串物 (全10種)
                      </div>
                      <div className="text-center font-black text-sm text-[#e63946] mb-2 border-b border-dashed border-stone-300 pb-1">
                        各 <span className="text-base">130</span> 円
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-sans text-stone-700 font-bold">
                        <div>🍢 ねぎま</div>
                        <div>🍢 とりかわ</div>
                        <div>🍢 つくね</div>
                        <div>🍢 ぼんじり</div>
                        <div>🍢 砂肝</div>
                        <div>🍢 レバー</div>
                        <div>🍢 ハツ</div>
                        <div>🍢 豚バラ串</div>
                        <div>🍢 もも塩</div>
                        <div>🍢 ししとう</div>
                      </div>
                    </div>
                  </div>

                  {/* Category 2: Dishes */}
                  <div className="bg-white border border-[#1a1a1a] p-2.5 flex flex-col justify-between">
                    <div>
                      <div className="bg-[#1a1a1a] text-white text-center py-0.5 text-xs font-black tracking-widest mb-2">
                        一品 (全5種)
                      </div>
                      <div className="text-center font-black text-sm text-[#e63946] mb-2 border-b border-dashed border-stone-300 pb-1">
                        各 <span className="text-base">560</span> 円
                      </div>
                      <div className="space-y-1 text-[10px] font-sans text-stone-700 font-bold pl-1">
                        <div>🍗 若鶏唐揚げ</div>
                        <div>🐟 刺身盛り合わせ</div>
                        <div>🍳 出し巻き卵</div>
                        <div>🍲 もつ煮込み</div>
                        <div>🍝 ソース焼きそば</div>
                      </div>
                    </div>
                  </div>

                  {/* Category 3: Drinks */}
                  <div className="bg-white border border-[#1a1a1a] p-2.5 flex flex-col justify-between">
                    <div>
                      <div className="bg-[#1a1a1a] text-white text-center py-0.5 text-xs font-black tracking-widest mb-2">
                        お酒 (全20種)
                      </div>
                      <div className="text-center font-black text-sm text-[#e63946] mb-2 border-b border-dashed border-stone-300 pb-1">
                        各 <span className="text-base">340</span> 円
                      </div>
                      <div className="max-h-[160px] overflow-y-auto space-y-1 text-[9px] font-sans text-stone-700 font-bold scrollbar-thin pr-1">
                        <div>🍺 生ビール <span className="text-[8px] bg-[#e63946] text-white px-0.5">半額対象</span></div>
                        <div>🍋 レモンサワー</div>
                        <div>🥃 角ハイボール</div>
                        <div>🍵 ウーロンハイ</div>
                        <div>🍵 緑茶ハイ</div>
                        <div>🍊 GFサワー</div>
                        <div>🍇 巨峰サワー</div>
                        <div>🥤 カルピスサワー</div>
                        <div>🥃 梅酒ロック</div>
                        <div>🥃 芋焼酎</div>
                        <div>🥃 麦焼酎</div>
                        <div>🍶 日本酒 辛口</div>
                        <div>🍋 ハイサワー</div>
                        <div>🍹 カシスオレンジ</div>
                        <div>🍵 カシスウーロン</div>
                        <div>🍵 ピーチウーロン</div>
                        <div>🍺 シャンディガフ</div>
                        <div>🥃 ジンジャーハイ</div>
                        <div>🥤 コークハイ</div>
                        <div>🍅 レッドアイ</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 border border-stone-200 text-xs">
                <h4 className="font-bold text-[#1a1a1a] mb-1">4. 連撃コンボとペナルティ</h4>
                <p className="text-stone-600">
                  連続で会計を正解するとコンボが繋がり、獲得ポイントが大幅にアップ！
                  計算を間違えるとコンボが途切れ、お客様の「お怒り（待ち時間）」が急減してしまいます。
                </p>
              </div>
            </div>

            <button
              id="btn-close-rules"
              onClick={() => {
                playClickSound();
                setShowRules(false);
              }}
              className="mt-6 w-full py-2.5 bg-[#1a1a1a] text-white hover:bg-stone-850 font-bold text-sm cursor-pointer border-none shadow-[2px_2px_0px_0px_rgba(230,57,70,1)] transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              閉じる
            </button>
          </motion.div>
        </div>
      )}

      {/* Footer subtle text */}
      <footer className="relative z-10 text-stone-400 text-[10px] mt-auto py-2 font-sans tracking-widest">
        居酒屋暗算マスター • 伝統の味・居酒屋 匠 • EST. 2026
      </footer>
    </div>
  );
}

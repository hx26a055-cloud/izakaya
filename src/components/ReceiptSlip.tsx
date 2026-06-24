import React from 'react';
import { CustomerTable, Difficulty } from '../types';
import { OTOSHI_PRICE } from '../utils/gameData';
import { Percent, Ticket, Beer, Users } from 'lucide-react';

interface ReceiptSlipProps {
  table: CustomerTable;
  difficulty: Difficulty;
  currentInput?: string;
  onTapInput?: () => void;
}

export default function ReceiptSlip({ table, difficulty, currentInput, onTapInput }: ReceiptSlipProps) {
  const getCouponBadge = () => {
    switch (table.coupon) {
      case 'tenPercentOff':
        return (
          <div className="bg-[#e63946] text-white border-2 border-[#1a1a1a] rounded-none p-2 flex items-center gap-2 mb-3 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <Percent className="w-5 h-5 shrink-0" />
            <div className="text-left font-sans">
              <p className="font-black text-xs">10% OFF 割引券利用</p>
              <p className="text-[10px] opacity-90 font-bold">合計金額（お通し代含む）から10%引き</p>
            </div>
          </div>
        );
      case 'beerHalfPrice':
        return (
          <div className="bg-amber-500 text-[#1a1a1a] border-2 border-[#1a1a1a] rounded-none p-2 flex items-center gap-2 mb-3 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <Beer className="w-5 h-5 shrink-0" />
            <div className="text-left font-sans">
              <p className="font-black text-xs">ビール半額券利用</p>
              <p className="text-[10px] opacity-90 font-bold">生ビールが1杯170円（通常340円）に！</p>
            </div>
          </div>
        );
      case 'otoshiFree':
        return (
          <div className="bg-emerald-600 text-white border-2 border-[#1a1a1a] rounded-none p-2 flex items-center gap-2 mb-3 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <Ticket className="w-5 h-5 shrink-0" />
            <div className="text-left font-sans">
              <p className="font-black text-xs">お通し代 無料券利用</p>
              <p className="text-[10px] opacity-90 font-bold">お通し代（人数分）が無料になります</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const otoshiRate = OTOSHI_PRICE[difficulty];

  return (
    <div className="relative bg-white text-[#1a1a1a] rounded-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] p-4 md:p-5 border-2 border-[#1a1a1a] max-w-sm w-full h-full mx-auto font-serif overflow-hidden select-none flex flex-col justify-between gap-1.5 md:gap-2">
      
      {/* Receipt header */}
      <div className="text-center border-b-2 border-dashed border-[#1a1a1a] pb-2 md:pb-3 shrink-0">
        <p className="text-[9px] text-[#e63946] font-black font-sans tracking-widest mb-0.5">WELCOME TO DONCHAN TAVERN</p>
        <h3 className="text-lg font-black text-[#1a1a1a] leading-tight">大衆酒場 どんちゃん</h3>
        <p className="text-[9px] text-stone-400 font-sans font-bold mt-0.5">伝票番号: #{table.id.split('_')[2]?.toUpperCase() || 'RECEIPT'}</p>
        
        {/* Table information */}
        <div className="mt-2 flex items-center justify-between bg-[#f2ede4] border border-[#1a1a1a] px-2.5 py-1.5 rounded-none text-xs font-bold text-[#1a1a1a] font-sans">
          <span className="flex items-center gap-1 font-black">
            <span className="text-[#e63946]">🪑</span> 席番: <span>{table.tableNumber}</span>
          </span>
          <span className="flex items-center gap-1 text-[#e63946] font-black">
            <Users className="w-3.5 h-3.5 text-[#1a1a1a]" /> 人数: {table.guestCount}名様
          </span>
        </div>
      </div>

      {/* Rules reminder banner (especially for Otoshi) */}
      {otoshiRate > 0 && (
        <div className="bg-[#f2ede4] text-[10px] text-[#1a1a1a] px-2 py-1 rounded-none text-center border border-[#1a1a1a] font-bold font-sans shrink-0">
          お通し：1人 <span className="font-black text-[#e63946]">{otoshiRate}円</span> × {table.guestCount}人
          {table.coupon === 'otoshiFree' ? ' ➔ 無料券適用で 0円' : ` ➔ +${otoshiRate * table.guestCount}円`}
        </div>
      )}

      {/* Coupon banner */}
      <div className="shrink-0">
        {getCouponBadge()}
      </div>

      {/* Ordered Items List - Flex-growable */}
      <div className="flex-grow min-h-[100px] flex flex-col border-b-2 border-dashed border-[#1a1a1a] pb-2 font-sans overflow-hidden">
        <div className="flex justify-between text-[10px] font-black text-stone-500 uppercase px-1 pb-1 border-b border-dashed border-[#1a1a1a]/20 mb-1 shrink-0">
          <span>品名</span>
          <div className="flex gap-4">
            {difficulty !== 'expert' && <span className="w-8 text-right">単価</span>}
            <span className="w-5 text-right">数</span>
            {difficulty !== 'expert' && difficulty !== 'master' && <span className="w-12 text-right">小計</span>}
          </div>
        </div>
        
        <div className="space-y-1 flex-1 overflow-y-auto pr-1 scrollbar-thin">
          {table.orders.map((line, idx) => {
            const isBeer = line.item.id === 'beer';
            const isHalfPriceBeer = isBeer && table.coupon === 'beerHalfPrice';
            const price = isHalfPriceBeer ? Math.floor(line.item.price / 2) : line.item.price;
            const cleanName = difficulty === 'expert' 
              ? line.item.name.replace(/^【[^】]+】/, '') 
              : line.item.name;

            return (
              <div key={idx} className="flex justify-between items-center text-[11px] font-bold text-[#1a1a1a]">
                <span className="flex items-center gap-1 truncate max-w-[130px]">
                  <span>{line.item.emoji}</span>
                  <span className="truncate">{cleanName}</span>
                </span>
                
                <div className="flex gap-4 font-mono">
                  {difficulty !== 'expert' && (
                    <span className={`w-8 text-right ${isHalfPriceBeer ? 'text-[#e63946] font-black line-through' : 'text-stone-600'}`}>
                      {line.item.price}
                    </span>
                  )}
                  <span className="w-5 text-right text-stone-600">
                    {line.quantity}
                  </span>
                  {difficulty !== 'expert' && difficulty !== 'master' && (
                    <span className="w-12 text-right font-black">
                      {price * line.quantity}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden total section with calculation prompt */}
      <div 
        onClick={onTapInput}
        className="text-center pt-2 pb-2 bg-[#f2ede4]/60 hover:bg-[#f2ede4]/90 border border-[#1a1a1a] rounded-none shrink-0 cursor-pointer transition-colors select-none group relative"
      >
        <div className="text-[9px] text-stone-500 font-bold tracking-widest font-sans">TOTAL AMOUNT DUE</div>
        <div className="my-1.5 flex items-center justify-center gap-1">
          <span className="text-2xl font-black">¥</span>
          <span className={`text-2xl font-black text-[#e63946] tracking-widest bg-white border border-[#1a1a1a] px-3 py-1 rounded-none shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] group-hover:shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] transition-all ${!currentInput ? 'animate-pulse' : ''}`}>
            {currentInput || '？？？？'}
          </span>
        </div>
        <div className="flex items-center justify-center gap-1.5 flex-wrap px-1">
          <p className="text-[9px] text-stone-700 font-bold font-sans">電卓を使わず暗算でレジに入力！</p>
          <span className="inline-flex items-center gap-0.5 text-[8px] px-1 py-0.5 bg-[#e63946] text-white font-sans font-black rounded-none shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] animate-bounce leading-none">
            📳 タップ入力
          </span>
        </div>
      </div>

      {/* Receipt footer barcode */}
      <div className="flex flex-col items-center opacity-80 shrink-0">
        <div className="h-4 w-40 bg-[repeating-linear-gradient(90deg,_#1a1a1a_0px,_#1a1a1a_2px,_transparent_2px,_transparent_4px)]" />
        <p className="text-[8px] font-mono text-stone-400 mt-0.5">*{table.id.toUpperCase()}*</p>
      </div>
    </div>
  );
}

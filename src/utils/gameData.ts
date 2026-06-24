import { MenuItem, OrderLine, Difficulty, CustomerTable } from '../types';

export const MENU_ITEMS: MenuItem[] = [
  // 串物 (10種類) - 各130円
  { id: 'yakitori_negima', name: '【串物】ねぎま', price: 130, emoji: '🍢', category: 'skewer' },
  { id: 'yakitori_kawa', name: '【串物】とりかわ', price: 130, emoji: '🍢', category: 'skewer' },
  { id: 'yakitori_tsukune', name: '【串物】つくね', price: 130, emoji: '🍢', category: 'skewer' },
  { id: 'yakitori_bonjiri', name: '【串物】ぼんじり', price: 130, emoji: '🍢', category: 'skewer' },
  { id: 'yakitori_sunagimo', name: '【串物】砂肝', price: 130, emoji: '🍢', category: 'skewer' },
  { id: 'yakitori_lever', name: '【串物】レバー', price: 130, emoji: '🍢', category: 'skewer' },
  { id: 'yakitori_hatsu', name: '【串物】ハツ', price: 130, emoji: '🍢', category: 'skewer' },
  { id: 'kushiyaki_butabara', name: '【串物】豚バラ串', price: 130, emoji: '🍢', category: 'skewer' },
  { id: 'kushiyaki_momoshio', name: '【串物】もも塩', price: 130, emoji: '🍢', category: 'skewer' },
  { id: 'kushiyaki_shishito', name: '【串物】ししとう串', price: 130, emoji: '🍢', category: 'skewer' },

  // 一品 (5種類) - 各560円
  { id: 'food_karaage', name: '【一品】若鶏唐揚げ', price: 560, emoji: '🍗', category: 'food' },
  { id: 'food_sashimi', name: '【一品】刺身盛り合わせ', price: 560, emoji: '🐟', category: 'food' },
  { id: 'food_tamagoyaki', name: '【一品】出し巻き卵', price: 560, emoji: '🍳', category: 'food' },
  { id: 'food_motsunika', name: '【一品】もつ煮込み', price: 560, emoji: '🍲', category: 'food' },
  { id: 'food_yakisoba', name: '【一品】ソース焼きそば', price: 560, emoji: '🍝', category: 'food' },

  // お酒 (20種類) - 各340円 (ビール半額適用対象のためIDを'beer'にする)
  { id: 'beer', name: '【お酒】生ビール', price: 340, emoji: '🍺', category: 'drink' },
  { id: 'drink_lemon_sour', name: '【お酒】レモンサワー', price: 340, emoji: '🍋', category: 'drink' },
  { id: 'drink_highball', name: '【お酒】角ハイボール', price: 340, emoji: '🥃', category: 'drink' },
  { id: 'drink_oolong_hai', name: '【お酒】ウーロンハイ', price: 340, emoji: '🍵', category: 'drink' },
  { id: 'drink_ryokucha_hai', name: '【お酒】緑茶ハイ', price: 340, emoji: '🍵', category: 'drink' },
  { id: 'drink_gf_sour', name: '【お酒】GFサワー', price: 340, emoji: '🍊', category: 'drink' },
  { id: 'drink_kyoho_sour', name: '【お酒】巨峰サワー', price: 340, emoji: '🍇', category: 'drink' },
  { id: 'drink_calpis_sour', name: '【お酒】カルピスサワー', price: 340, emoji: '🥤', category: 'drink' },
  { id: 'drink_umeshu', name: '【お酒】梅酒ロック', price: 340, emoji: '🥃', category: 'drink' },
  { id: 'drink_imo_shochu', name: '【お酒】芋焼酎', price: 340, emoji: '🥃', category: 'drink' },
  { id: 'drink_mugi_shochu', name: '【お酒】麦焼酎', price: 340, emoji: '🥃', category: 'drink' },
  { id: 'drink_sake_karakuchi', name: '【お酒】日本酒 辛口', price: 340, emoji: '🍶', category: 'drink' },
  { id: 'drink_hai_sour', name: '【お酒】ハイサワー', price: 340, emoji: '🍋', category: 'drink' },
  { id: 'drink_cassis_orange', name: '【お酒】カシスオレンジ', price: 340, emoji: '🍹', category: 'drink' },
  { id: 'drink_cassis_oolong', name: '【お酒】カシスウーロン', price: 340, emoji: '🍵', category: 'drink' },
  { id: 'drink_peach_oolong', name: '【お酒】ピーチウーロン', price: 340, emoji: '🍵', category: 'drink' },
  { id: 'drink_shandy_gaff', name: '【お酒】シャンディガフ', price: 340, emoji: '🍺', category: 'drink' },
  { id: 'drink_ginger_highball', name: '【お酒】ジンジャーハイ', price: 340, emoji: '🥃', category: 'drink' },
  { id: 'drink_coke_highball', name: '【お酒】コークハイ', price: 340, emoji: '🥤', category: 'drink' },
  { id: 'drink_redeye', name: '【お酒】レッドアイ', price: 340, emoji: '🍅', category: 'drink' },
];

export const OTOSHI_PRICE = {
  easy: 0,
  normal: 300,
  hard: 350,
  master: 350,
  expert: 350,
};

export interface BillCalculation {
  subtotal: number;
  otoshiTotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  breakdown: string[];
}

export function calculateBill(
  difficulty: Difficulty,
  guestCount: number,
  orders: OrderLine[],
  coupon: 'none' | 'tenPercentOff' | 'beerHalfPrice' | 'otoshiFree' = 'none'
): BillCalculation {
  const breakdown: string[] = [];
  
  // 1. Calculate item subtotal
  let itemTotal = 0;
  orders.forEach((line) => {
    let pricePerUnit = line.item.price;
    let nameModifier = '';
    
    // Check beer half price discount
    if (coupon === 'beerHalfPrice' && line.item.id === 'beer') {
      pricePerUnit = Math.floor(line.item.price / 2);
      nameModifier = ' (ビール半額適用)';
    }
    
    const lineCost = pricePerUnit * line.quantity;
    itemTotal += lineCost;
    
    const displayName = difficulty === 'expert'
      ? line.item.name.replace(/^【[^】]+】/, '')
      : line.item.name;

    breakdown.push(
      `${displayName}${nameModifier}: ${pricePerUnit}円 × ${line.quantity} = ${lineCost}円`
    );
  });
  
  // 2. Calculate Cover Charge (お通し)
  const otoshiRate = OTOSHI_PRICE[difficulty];
  let otoshiTotal = 0;
  
  if (otoshiRate > 0) {
    if (coupon === 'otoshiFree') {
      breakdown.push(`お通し代: ${otoshiRate}円 × ${guestCount}名 = 0円 (お通し無料適用)`);
    } else {
      otoshiTotal = otoshiRate * guestCount;
      breakdown.push(`お通し代: ${otoshiRate}円 × ${guestCount}名 = ${otoshiTotal}円`);
    }
  } else {
    breakdown.push(`お通し代: なし (0円)`);
  }
  
  const baseTotal = itemTotal + otoshiTotal;
  
  // 3. Apply general 10% discount if applicable
  let discountAmount = 0;
  if (coupon === 'tenPercentOff') {
    discountAmount = Math.floor(baseTotal * 0.1);
    breakdown.push(`10%割引適用: -${discountAmount}円 (元の合計: ${baseTotal}円)`);
  }
  
  const afterDiscount = baseTotal - discountAmount;
  
  // 4. Calculate Tax (消費税) - Hard/Master/Expert mode only has 10% external tax
  let taxAmount = 0;
  if (difficulty === 'hard' || difficulty === 'master' || difficulty === 'expert') {
    taxAmount = Math.floor(afterDiscount * 0.1);
    breakdown.push(`消費税(10%): +${taxAmount}円 (税別合計: ${afterDiscount}円)`);
  } else {
    breakdown.push(`消費税: 内税 (0円)`);
  }
  
  const finalTotal = afterDiscount + taxAmount;
  breakdown.push(`総合計金額: ${finalTotal}円`);
  
  return {
    subtotal: itemTotal,
    otoshiTotal,
    discountAmount,
    taxAmount,
    total: finalTotal,
    breakdown,
  };
}

// Generate a random customer table based on difficulty
export function generateRandomTable(difficulty: Difficulty, index: number): CustomerTable {
  const tableNumber = `T-${10 + index}`;
  const tableTypes: ('salaryman' | 'student' | 'family' | 'couple' | 'foreigner')[] = [
    'salaryman', 'student', 'family', 'couple', 'foreigner'
  ];
  const groupType = tableTypes[Math.floor(Math.random() * tableTypes.length)];
  
  // Avatars/Titles based on group type
  const avatars = {
    salaryman: '👔',
    student: '🎓',
    family: '👨‍👩‍👧‍👦',
    couple: '👩‍❤️‍👨',
    foreigner: '✈️',
  };
  
  const guestCountOptions = {
    easy: [1, 2, 3],
    normal: [2, 3, 4],
    hard: [2, 3, 4, 5, 6],
    master: [2, 3, 4, 5, 6],
    expert: [2, 3, 4, 5, 6],
  };
  const guests = guestCountOptions[difficulty][Math.floor(Math.random() * guestCountOptions[difficulty].length)];
  
  // Choose menu items
  const menuCountRange = {
    easy: { min: 2, max: 3 },
    normal: { min: 3, max: 4 },
    hard: { min: 4, max: 5 },
    master: { min: 4, max: 5 },
    expert: { min: 4, max: 5 },
  };
  
  const range = menuCountRange[difficulty];
  const itemCount = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  
  // Select unique random items
  const selectedItems: MenuItem[] = [];
  const tempItems = [...MENU_ITEMS];
  
  // Filter appropriate items based on group type occasionally for flavor,
  // but keep it random
  for (let i = 0; i < itemCount; i++) {
    if (tempItems.length === 0) break;
    const randIndex = Math.floor(Math.random() * tempItems.length);
    selectedItems.push(tempItems.splice(randIndex, 1)[0]);
  }
  
  const orders: OrderLine[] = selectedItems.map((item) => {
    // Quantity rules
    let maxQty = 3;
    if (item.category === 'drink') maxQty = guests; // usually equal or less than guests
    const quantity = Math.floor(Math.random() * maxQty) + 1;
    return { item, quantity };
  });
  
  // Coupons (more frequent on normal and hard/expert)
  let coupon: 'none' | 'tenPercentOff' | 'beerHalfPrice' | 'otoshiFree' = 'none';
  if (difficulty === 'normal' && Math.random() < 0.35) {
    const coupons: ('tenPercentOff' | 'beerHalfPrice' | 'otoshiFree')[] = ['tenPercentOff', 'otoshiFree'];
    coupon = coupons[Math.floor(Math.random() * coupons.length)];
  } else if ((difficulty === 'hard' || difficulty === 'master' || difficulty === 'expert') && Math.random() < 0.5) {
    const coupons: ('tenPercentOff' | 'beerHalfPrice' | 'otoshiFree')[] = ['tenPercentOff', 'beerHalfPrice', 'otoshiFree'];
    coupon = coupons[Math.floor(Math.random() * coupons.length)];
  }
  
  // Patience (hard has less starting patience, faster decay)
  const basePatience = {
    easy: 120,
    normal: 100,
    hard: 85,
    master: 85,
    expert: 80,
  }[difficulty];
  
  return {
    id: `table_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    tableNumber,
    guestCount: guests,
    orders,
    patience: basePatience,
    maxPatience: basePatience,
    avatar: avatars[groupType],
    groupType,
    coupon,
    createdAt: Date.now(),
  };
}

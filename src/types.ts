export type Difficulty = 'easy' | 'normal' | 'hard' | 'master' | 'expert';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: 'drink' | 'food' | 'skewer' | 'appetizer';
}

export interface OrderLine {
  item: MenuItem;
  quantity: number;
}

export interface CustomerTable {
  id: string;
  tableNumber: string;
  guestCount: number;
  orders: OrderLine[];
  patience: number; // 0 to 100
  maxPatience: number;
  avatar: string;
  groupType: 'salaryman' | 'student' | 'family' | 'couple' | 'foreigner';
  coupon?: 'none' | 'tenPercentOff' | 'beerHalfPrice' | 'otoshiFree';
  createdAt: number;
}

export interface GameStats {
  score: number;
  totalEarned: number;
  correctAnswers: number;
  wrongAnswers: number;
  maxCombo: number;
  tablesServed: number;
  tablesFailed: number;
}

export interface HistoryRecord {
  tableNumber: string;
  guestCount: number;
  orders: OrderLine[];
  coupon: 'none' | 'tenPercentOff' | 'beerHalfPrice' | 'otoshiFree';
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timestamp: number;
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
  difficulty: Difficulty;
  correctCount: number;
}

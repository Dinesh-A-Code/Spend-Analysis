import { type Category } from '../types/index.js';

export const VALID_CATEGORIES: Category[] = [
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Education',
  'Entertainment',
  'Health',
  'Investments',
  'Subscriptions',
  'Other'
];

interface CategorizationRule {
  category: Category;
  keywords: string[];
}

const CATEGORIZATION_RULES: CategorizationRule[] = [
  {
    category: 'Food',
    keywords: [
      'swiggy', 'zomato', 'restaurant', 'cafe', 'tea', 'coffee', 'grocer',
      'grocery', 'supermarket', 'star bazaar', 'canteen', 'bakery', 'dining',
      'mcdonald', 'domino', 'kfc', 'starbucks', 'chai', 'food'
    ]
  },
  {
    category: 'Shopping',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'apparel', 'clothing', 'electronics',
      'zara', 'h&m', 'retail', 'store', 'mall', 'ajio', 'nykaa', 'tata cliq',
      'shop'
    ]
  },
  {
    category: 'Transport',
    keywords: [
      'uber', 'ola', 'bus', 'metro', 'fuel', 'petrol', 'diesel', 'indian oil',
      'hpcl', 'bpcl', 'fastag', 'train', 'irctc', 'auto', 'cab', 'flight',
      'makemytrip', 'indigo', 'air india', 'rapido'
    ]
  },
  {
    category: 'Bills',
    keywords: [
      'bescom', 'electricity', 'water', 'gas', 'society', 'rent', 'maintenance',
      'broadband', 'wifi', 'airtel', 'jio', 'vi', 'vodafone', 'bill',
      'utility', 'dth', 'tneb', 'cesc'
    ]
  },
  {
    category: 'Education',
    keywords: [
      'tuition', 'course', 'udemy', 'coursera', 'books', 'college', 'school',
      'exam', 'university', 'classes', 'coaching', 'edtech'
    ]
  },
  {
    category: 'Entertainment',
    keywords: [
      'bookmyshow', 'movie', 'cinema', 'pvr', 'inox', 'gaming', 'steam',
      'concert', 'theatre', 'playstation', 'event'
    ]
  },
  {
    category: 'Health',
    keywords: [
      'pharmacy', 'apollo', '1mg', 'hospital', 'doctor', 'clinic', 'medplus',
      'medicine', 'dental', 'diagnostics', 'pharma', 'lab'
    ]
  },
  {
    category: 'Investments',
    keywords: [
      'zerodha', 'groww', 'mutual fund', 'sip', 'stocks', 'insurance', 'lic',
      'hdfc life', 'icici pru', 'upstox', 'smallcase', 'nps'
    ]
  },
  {
    category: 'Subscriptions',
    keywords: [
      'netflix', 'spotify', 'prime', 'youtube', 'hotstar', 'apple.com/bill',
      'icloud', 'google one', 'subscription', 'patreon', 'chatgpt'
    ]
  }
];

export class CategorizationService {
  /**
   * Deterministically assigns an approved category based on merchant name and description.
   */
  public static categorize(merchant: string, description: string = ''): Category {
    const combined = `${merchant} ${description}`.toLowerCase();

    for (const rule of CATEGORIZATION_RULES) {
      for (const keyword of rule.keywords) {
        if (combined.includes(keyword)) {
          return rule.category;
        }
      }
    }

    return 'Other';
  }

  /**
   * Validates if a given string is an approved Category.
   */
  public static isValidCategory(cat: string): cat is Category {
    return VALID_CATEGORIES.includes(cat as Category);
  }
}

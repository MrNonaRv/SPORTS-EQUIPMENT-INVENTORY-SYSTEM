export interface CategoryInfo {
  id: string;
  name: string;
  sport: string;
  iconName: string;
  color: string;
  accentBg: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  defaultItemsDescription: string;
  recommendedBundle?: {
    title: string;
    description: string;
    items: { itemNamePattern: string; quantity: number }[];
  };
}

export const SPORT_CATEGORIES: Record<string, CategoryInfo> = {
  'Basketball': {
    id: 'basketball',
    name: 'Basketball',
    sport: 'Basketball',
    iconName: 'CircleDot',
    color: 'text-amber-600',
    accentBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    description: 'Court gear, regulation balls, tournament nets, whistles, and practice jerseys.',
    defaultItemsDescription: 'Balls, Nets, Cones, Whistles, Training Vests',
    recommendedBundle: {
      title: 'Full Basketball Practice Kit',
      description: '1 Official Basketball, 1 Net (pair), 1 Whistle, 1 Cones Set',
      items: [
        { itemNamePattern: 'Basketball (Official', quantity: 1 },
        { itemNamePattern: 'Basketball Net', quantity: 1 },
        { itemNamePattern: 'Referee Whistle', quantity: 1 },
        { itemNamePattern: 'Training Cones', quantity: 1 }
      ]
    }
  },
  'Badminton': {
    id: 'badminton',
    name: 'Badminton',
    sport: 'Badminton',
    iconName: 'Zap',
    color: 'text-emerald-600',
    accentBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    description: 'Rackets, tournament nylon/feather shuttlecocks, regulation nets, and grip tapes.',
    defaultItemsDescription: 'Rackets, Shuttlecocks, Regulation Nets, Post Straps',
    recommendedBundle: {
      title: 'Badminton Doubles Match Set',
      description: '2 Carbon Pro Rackets, 1 Shuttlecock Tube, 1 Tournament Net',
      items: [
        { itemNamePattern: 'Badminton Racket', quantity: 2 },
        { itemNamePattern: 'Shuttlecock', quantity: 1 },
        { itemNamePattern: 'Badminton Net', quantity: 1 }
      ]
    }
  },
  'Volleyball': {
    id: 'volleyball',
    name: 'Volleyball',
    sport: 'Volleyball',
    iconName: 'Activity',
    color: 'text-blue-600',
    accentBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    description: 'Official composite volleyballs, heavy-duty nets, knee pads, and air pumps.',
    defaultItemsDescription: 'Volleyballs, Competition Nets, Knee Pads, Pumps',
    recommendedBundle: {
      title: 'Volleyball Game Bundle',
      description: '1 Official Volleyball, 1 Tournament Net, 2 Knee Pads',
      items: [
        { itemNamePattern: 'Volleyball (Official', quantity: 1 },
        { itemNamePattern: 'Volleyball Net', quantity: 1 },
        { itemNamePattern: 'Knee Pads', quantity: 2 }
      ]
    }
  },
  'Football': {
    id: 'football',
    name: 'Football',
    sport: 'Soccer & Football',
    iconName: 'Target',
    color: 'text-green-700',
    accentBg: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800',
    description: 'Field match soccer balls, goal nets, agility ladders, and protective shin guards.',
    defaultItemsDescription: 'Match Balls, Goal Nets, Agility Ladders, Shin Guards',
    recommendedBundle: {
      title: 'Soccer Training Bundle',
      description: '1 Match Soccer Ball, 1 Goal Net Pair, 1 Agility Ladder',
      items: [
        { itemNamePattern: 'Soccer / Football', quantity: 1 },
        { itemNamePattern: 'Soccer Goal Net', quantity: 1 },
        { itemNamePattern: 'Agility Ladder', quantity: 1 }
      ]
    }
  },
  'Table Tennis': {
    id: 'table-tennis',
    name: 'Table Tennis',
    sport: 'Table Tennis',
    iconName: 'Flame',
    color: 'text-rose-600',
    accentBg: 'bg-rose-50',
    borderColor: 'border-rose-200',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    description: 'Spin paddles/bats, 3-star tournament ping pong balls, and retractable net clamps.',
    defaultItemsDescription: 'Paddles / Bats, 3-Star Balls, Retractable Nets',
    recommendedBundle: {
      title: 'Table Tennis Singles/Doubles Set',
      description: '2 TT Paddles, 1 3-Star Balls Pack, 1 Retractable Net',
      items: [
        { itemNamePattern: 'Table Tennis Paddle', quantity: 2 },
        { itemNamePattern: 'Table Tennis Balls', quantity: 1 },
        { itemNamePattern: 'Table Tennis Retractable', quantity: 1 }
      ]
    }
  },
  'Sepak Takraw': {
    id: 'sepak-takraw',
    name: 'Sepak Takraw',
    sport: 'Sepak Takraw',
    iconName: 'Trophy',
    color: 'text-yellow-700',
    accentBg: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-800',
    description: 'Synthetic woven takraw balls, tournament posts nets, and ankle supports.',
    defaultItemsDescription: 'Synthetic Woven Balls, Tournament Nets',
    recommendedBundle: {
      title: 'Takraw Match Kit',
      description: '1 Synthetic Takraw Ball, 1 Regulation Takraw Net',
      items: [
        { itemNamePattern: 'Sepak Takraw Synthetic', quantity: 1 },
        { itemNamePattern: 'Sepak Takraw Regulation Net', quantity: 1 }
      ]
    }
  },
  'Chess': {
    id: 'chess',
    name: 'Chess',
    sport: 'Mind & Board Sports',
    iconName: 'Shield',
    color: 'text-purple-600',
    accentBg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    description: 'Weighted tournament chess pieces, roll-up vinyl boards, and digital chess timers.',
    defaultItemsDescription: 'Chess Sets, Roll-up Vinyl Boards, Digital Clocks',
    recommendedBundle: {
      title: 'Chess Tournament Match Set',
      description: '1 Tournament Chess Set, 1 Digital Chess Clock',
      items: [
        { itemNamePattern: 'Tournament Chess Set', quantity: 1 },
        { itemNamePattern: 'Digital Chess Clock', quantity: 1 }
      ]
    }
  },
  'Boxing': {
    id: 'boxing',
    name: 'Boxing',
    sport: 'Combat Sports & Conditioning',
    iconName: 'Dumbbell',
    color: 'text-red-700',
    accentBg: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
    description: '12oz training boxing gloves, punch focus mitts, and weighted speed jump ropes.',
    defaultItemsDescription: 'Boxing Gloves, Focus Mitts, Speed Jump Ropes',
    recommendedBundle: {
      title: 'Boxing Conditioning Kit',
      description: '1 Pair 12oz Gloves, 1 Pair Curved Focus Mitts, 1 Jump Rope',
      items: [
        { itemNamePattern: 'Boxing Gloves', quantity: 1 },
        { itemNamePattern: 'Focus Punching Mitts', quantity: 1 },
        { itemNamePattern: 'Jump Rope', quantity: 1 }
      ]
    }
  },
  'Taekwondo': {
    id: 'taekwondo',
    name: 'Taekwondo',
    sport: 'Martial Arts',
    iconName: 'ShieldAlert',
    color: 'text-teal-700',
    accentBg: 'bg-teal-50',
    borderColor: 'border-teal-200',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    description: 'Protective gear, body armors, kicking pads, and rubber matting.',
    defaultItemsDescription: 'Protective Gear, Body Armors, Mats',
    recommendedBundle: {
      title: 'Taekwondo Sparring Set',
      description: '1 Head Gear, 1 Body Armor, 1 Arm Guard, 1 Leg Guard',
      items: [
        { itemNamePattern: 'Head Gear', quantity: 1 },
        { itemNamePattern: 'Body Armor', quantity: 1 },
        { itemNamePattern: 'Arm Guard', quantity: 1 },
        { itemNamePattern: 'Leg Guard', quantity: 1 }
      ]
    }
  },
  'Arnis': {
    id: 'arnis',
    name: 'Arnis',
    sport: 'Martial Arts',
    iconName: 'Swords',
    color: 'text-orange-700',
    accentBg: 'bg-orange-50',
    borderColor: 'border-orange-200',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    description: 'Arnis sticks, padded body gear, and specialized head gear.',
    defaultItemsDescription: 'Sticks, Body Gear, Head Gear',
    recommendedBundle: {
      title: 'Arnis Combat Set',
      description: '2 Arnis Sticks, 1 Head Gear, 1 Body Gear',
      items: [
        { itemNamePattern: 'Arnis Stick', quantity: 2 },
        { itemNamePattern: 'Head Gear', quantity: 1 },
        { itemNamePattern: 'Body Gear', quantity: 1 }
      ]
    }
  },
  'Athletics': {
    id: 'athletics',
    name: 'Athletics',
    sport: 'Track & Field',
    iconName: 'Footprints',
    color: 'text-cyan-700',
    accentBg: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    description: 'Track spikes, batons, measuring tapes, and track field equipment.',
    defaultItemsDescription: 'Spike Shoes, Field Accessories',
  },
  'Office Supplies': {
    id: 'office-supplies',
    name: 'Office Supplies',
    sport: 'Administrative',
    iconName: 'Paperclip',
    color: 'text-slate-600',
    accentBg: 'bg-slate-50',
    borderColor: 'border-slate-200',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-800',
    description: 'Bond papers, masking tapes, staplers, and administrative supplies.',
    defaultItemsDescription: 'Tape, Paper, Staplers',
  }
};

export const getCategoryMeta = (categoryName: string): CategoryInfo => {
  if (SPORT_CATEGORIES[categoryName]) {
    return SPORT_CATEGORIES[categoryName];
  }
  // Try case-insensitive or partial match
  const matchedKey = Object.keys(SPORT_CATEGORIES).find(
    k => k.toLowerCase() === categoryName.toLowerCase()
  );
  if (matchedKey) {
    return SPORT_CATEGORIES[matchedKey];
  }

  // Fallback for custom added categories
  return {
    id: categoryName.toLowerCase().replace(/\s+/g, '-'),
    name: categoryName,
    sport: categoryName,
    iconName: 'Trophy',
    color: 'text-indigo-600',
    accentBg: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    description: `${categoryName} athletic equipment and gear collection.`,
    defaultItemsDescription: 'Sport Equipment & Accessories'
  };
};

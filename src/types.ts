export type SunExposure = 'low' | 'moderate' | 'high';

export type RoomDirection = 'north' | 'south' | 'east' | 'west' | 'none';

export type RoofStatus = 'top_uninsulated' | 'top_insulated' | 'middle';

export type Priority =
  | 'electricity'
  | 'budget'
  | 'quiet_smart'
  | 'extreme_heat';

export type UnitSystem = 'imperial' | 'metric';

export type DimUnit = 'ft' | 'm' | 'in';

export const ROOM_DIRECTIONS: { code: RoomDirection; labelKey: string }[] = [
  { code: 'none', labelKey: 'dirNone' },
  { code: 'north', labelKey: 'dirNorth' },
  { code: 'south', labelKey: 'dirSouth' },
  { code: 'east', labelKey: 'dirEast' },
  { code: 'west', labelKey: 'dirWest' },
];

export const ROOF_STATUSES: { code: RoofStatus; labelKey: string }[] = [
  { code: 'middle', labelKey: 'roofMiddle' },
  { code: 'top_insulated', labelKey: 'roofTopInsulated' },
  { code: 'top_uninsulated', labelKey: 'roofTopUninsulated' },
];

export const DIM_UNITS: { code: DimUnit; labelKey: string; shortKey: string }[] = [
  { code: 'ft', labelKey: 'unitFeet', shortKey: 'unitFt' },
  { code: 'm', labelKey: 'unitMeters', shortKey: 'unitM' },
  { code: 'in', labelKey: 'unitInches', shortKey: 'unitIn' },
];

export interface ACModel {
  id: string;
  brand: string;
  modelName: string;
  tonnage: number;
  energyRating: number;
  powerConsumptionKwhYear: number;
  inverter: boolean;
  estimatedPrice: number;
  keyFeature: string;
  pros: string;
  cons: string;
  starScore: number;
  priorities: Priority[];
}

export interface CalcResult {
  areaSqFt: number;
  volumeCuFt: number;
  baseBtu: number;
  occupancyBtu: number;
  sunExposureBtu: number;
  directionBtu: number;
  roofBtu: number;
  totalBtu: number;
  rawTonnage: number;
  recommendedTonnage: number;
  sunExposure: SunExposure;
  roomDirection: RoomDirection;
  roofStatus: RoofStatus;
  occupants: number;
  priority: Priority;
}

export interface UnitConfig {
  count: number;
  tonnagePerUnit: number;
  totalTonnage: number;
  label: string;
}

export interface TradeOffCriterion {
  key: string;
  label: string;
  optionA: string;
  optionB: string;
  winner: 'A' | 'B';
}

export interface MultiUnitAdvisor {
  showAdvisor: boolean;
  optionA: UnitConfig;
  optionB: UnitConfig;
  criteria: TradeOffCriterion[];
  recommendation: {
    winner: 'A' | 'B';
    text: string;
  };
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'CUSTOM', symbol: '', label: 'Custom' },
];

export interface ElectricitySettings {
  currencySymbol: string;
  ratePerKwh: number;
  dailyHours: number;
  operatingMonths: number;
}

export const DEFAULT_ELECTRICITY: ElectricitySettings = {
  currencySymbol: '₹',
  ratePerKwh: 8,
  dailyHours: 8,
  operatingMonths: 6,
};

export interface BillCalc {
  annualCost: number;
  monthlyCost: number;
  annualKwh: number;
}

export interface SavingsComparison {
  fiveStar: ACModel | null;
  threeStar: ACModel | null;
  fiveStarAnnualCost: number;
  threeStarAnnualCost: number;
  annualSavings: number;
  paybackYears: number | null;
  pricePremium: number;
}

export const STANDARD_TONNAGES = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];

export const SUN_EXPOSURE_LABELS: Record<SunExposure, string> = {
  low: 'Low / Shaded',
  moderate: 'Moderate',
  high: 'High Sunlight / Top Floor',
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; icon: string; description: string; brands: string[]; highlight: string }
> = {
  electricity: {
    label: 'Lowest Electricity Bill',
    icon: 'Zap',
    description: 'Focus on efficiency and maximum power savings',
    brands: ['Panasonic', 'Daikin'],
    highlight: 'High ISEER ratings for maximum power savings.',
  },
  budget: {
    label: 'Budget-Friendly / Best Value',
    icon: 'Wallet',
    description: 'Affordable pricing and easy service availability',
    brands: ['Voltas', 'Lloyd'],
    highlight: 'Affordable pricing and a broad service network.',
  },
  quiet_smart: {
    label: 'Super Quiet & Smart Features',
    icon: 'VolumeX',
    description: 'Low noise operation and smart app controls',
    brands: ['LG'],
    highlight: 'Dual Inverter technology, silent night operation, and Wi-Fi control.',
  },
  extreme_heat: {
    label: 'Extreme Heat & Durability',
    icon: 'Flame',
    description: 'Built for extreme temperatures and anti-corrosion',
    brands: ['Blue Star', 'Daikin'],
    highlight: 'Anti-corrosion copper coils with continuous cooling at 50°C+.',
  },
};

type BrandProfile = {
  name: string;
  feature: string;
  pros: string;
  cons: string;
  priorities: Priority[];
  starScore: number;
  priceFactor: number;
  powerFactor: number;
  rating: 3 | 5;
};

const BRAND_PROFILES: BrandProfile[] = [
  {
    name: 'Daikin',
    feature: 'Neo-Swing inverter compressor with anti-corrosion condenser',
    pros: 'Whisper-quiet operation; durable copper condenser; strong cooling',
    cons: 'Premium pricing; installation kit sold separately',
    priorities: ['electricity', 'extreme_heat'],
    starScore: 4.6,
    priceFactor: 1.08,
    powerFactor: 0.92,
    rating: 5,
  },
  {
    name: 'LG',
    feature: 'Dual Inverter + Wi-Fi with LG ThinQ smart controls',
    pros: 'Silent night mode; great smart app controls; fast cooling',
    cons: 'Plastic fan guard feels light; remote lacks backlight',
    priorities: ['quiet_smart', 'electricity'],
    starScore: 4.5,
    priceFactor: 1.04,
    powerFactor: 0.95,
    rating: 5,
  },
  {
    name: 'Voltas',
    feature: 'Adjustable inverter with high airflow and wide service network',
    pros: 'Best value pricing; easy service availability across cities',
    cons: 'Slightly higher power consumption; basic remote features',
    priorities: ['budget'],
    starScore: 4.2,
    priceFactor: 0.72,
    powerFactor: 1.18,
    rating: 3,
  },
  {
    name: 'Blue Star',
    feature: 'Anti-corrosion blue fins for harsh coastal climates',
    pros: 'Cools steadily at 50°C+; durable build for extreme heat',
    cons: 'Heavier unit; installation requires sturdy wall mounting',
    priorities: ['extreme_heat'],
    starScore: 4.3,
    priceFactor: 0.82,
    powerFactor: 1.2,
    rating: 3,
  },
  {
    name: 'Hitachi',
    feature: 'iSense intelligent inverter with follow-me airflow',
    pros: 'Powerful cooling; premium build; low noise at part load',
    cons: 'Higher price; limited service network in smaller cities',
    priorities: ['quiet_smart', 'electricity'],
    starScore: 4.5,
    priceFactor: 1.12,
    powerFactor: 0.9,
    rating: 5,
  },
  {
    name: 'Carrier',
    feature: 'Flexicool Hybrid-Assist adjustable cooling',
    pros: 'Great efficiency; flexible capacity; quiet at low speed',
    cons: 'Premium pricing; app occasionally disconnects',
    priorities: ['electricity', 'extreme_heat'],
    starScore: 4.4,
    priceFactor: 1.0,
    powerFactor: 0.96,
    rating: 5,
  },
  {
    name: 'Samsung',
    feature: 'Convertible 5-in-1 with Fast Cool mode',
    pros: 'Sleek design; fast cooling; reliable performance',
    cons: 'Service network thinner in smaller cities; higher price',
    priorities: ['quiet_smart', 'budget'],
    starScore: 4.1,
    priceFactor: 0.9,
    powerFactor: 1.15,
    rating: 3,
  },
  {
    name: 'Haier',
    feature: ' IntelliSense convertible 7-in-1 with anti-dust filter',
    pros: 'Good value; strong airflow; easy to service',
    cons: 'Remote is basic; plastic build quality',
    priorities: ['budget'],
    starScore: 4.0,
    priceFactor: 0.68,
    powerFactor: 1.22,
    rating: 3,
  },
  {
    name: 'Panasonic',
    feature: '7-in-1 convertible cooling with high ISEER 5.2',
    pros: 'Cools in under 5 mins; excellent energy savings on bills',
    cons: 'Premium pricing; app setup needs a stable Wi-Fi network',
    priorities: ['electricity', 'quiet_smart'],
    starScore: 4.6,
    priceFactor: 1.06,
    powerFactor: 0.93,
    rating: 5,
  },
  {
    name: 'Lloyd',
    feature: '5-in-1 convertible with clean air filter',
    pros: 'Very affordable; strong value for money; easy to service',
    cons: 'Noise levels higher at full load; no smart app controls',
    priorities: ['budget'],
    starScore: 4.0,
    priceFactor: 0.66,
    powerFactor: 1.25,
    rating: 3,
  },
];

const BASE_PRICE_PER_TON = 30000;
const BASE_POWER_PER_TON = 760;

function generateModels(): ACModel[] {
  const models: ACModel[] = [];
  for (const profile of BRAND_PROFILES) {
    for (const tonnage of STANDARD_TONNAGES) {
      const rating = profile.rating;
      const powerFactor = rating === 5 ? profile.powerFactor : profile.powerFactor * 1.25;
      const priceFactor = rating === 5 ? profile.priceFactor : profile.priceFactor * 0.82;
      const power = Math.round(
        (BASE_POWER_PER_TON * tonnage * powerFactor) / 10,
      ) * 10;
      const price = Math.round(
        (BASE_PRICE_PER_TON * tonnage * priceFactor) / 1000,
      ) * 1000;
      const suffix = rating === 5 ? '5S' : '3S';
      const id = `${profile.name.toLowerCase()}-${tonnage.toFixed(1)}-${suffix}`;
      const modelName = `${profile.name.slice(0, 2).toUpperCase()}-${Math.round(
        tonnage * 12,
      )}${suffix}`;
      models.push({
        id,
        brand: profile.name,
        modelName,
        tonnage,
        energyRating: rating,
        powerConsumptionKwhYear: power,
        inverter: true,
        estimatedPrice: price,
        keyFeature: profile.feature,
        pros: profile.pros,
        cons: profile.cons,
        starScore: profile.starScore,
        priorities: profile.priorities,
      });
    }
  }
  return models;
}

export const AC_MODELS: ACModel[] = generateModels();

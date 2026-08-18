import {
  ACModel,
  AC_MODELS,
  BillCalc,
  CalcResult,
  DimUnit,
  ElectricitySettings,
  MultiUnitAdvisor,
  PRIORITY_META,
  Priority,
  RoofStatus,
  RoomDirection,
  SavingsComparison,
  STANDARD_TONNAGES,
  SUN_EXPOSURE_LABELS,
  SunExposure,
  TradeOffCriterion,
  UnitConfig,
  UnitSystem,
} from '@/types';

const METERS_TO_FEET = 3.28084;

function roundToStandardTonnage(t: number): number {
  return STANDARD_TONNAGES.reduce((best, cur) =>
    Math.abs(cur - t) < Math.abs(best - t) ? cur : best,
  );
}

export function toFeet(value: number, unit: UnitSystem): number {
  return unit === 'metric' ? value * METERS_TO_FEET : value;
}

const INCHES_TO_FEET = 1 / 12;

export function dimToFeet(value: number, unit: DimUnit): number {
  switch (unit) {
    case 'ft':
      return value;
    case 'm':
      return value * METERS_TO_FEET;
    case 'in':
      return value * INCHES_TO_FEET;
  }
}

const DIRECTION_BTU_PCT: Record<RoomDirection, number> = {
  none: 0,
  north: 0,
  east: 0.03,
  south: 0.08,
  west: 0.1,
};

const ROOF_BTU_PCT: Record<RoofStatus, number> = {
  ground: 0,
  middle: 0.02,
  top_insulated: 0.12,
  top_uninsulated: 0.25,
};

export function calculateTonnage(
  lengthFt: number,
  widthFt: number,
  ceilingHeightFt: number,
  sunExposure: SunExposure,
  occupants: number,
  priority: Priority,
  roomDirection: RoomDirection = 'none',
  roofStatus: RoofStatus = 'ground',
): CalcResult {
  const areaSqFt = lengthFt * widthFt;
  const volumeCuFt = areaSqFt * ceilingHeightFt;
  const baseBtu = areaSqFt * 25;

  const additionalOccupants = Math.max(0, occupants - 2);
  const occupancyBtu = additionalOccupants * 500;

  const sunMultiplier = sunExposure === 'high' ? 1.1 : 1.0;
  const subtotalBtu = baseBtu + occupancyBtu;
  const sunExposureBtu = Math.round(subtotalBtu * (sunMultiplier - 1.0));

  const afterSun = subtotalBtu * sunMultiplier;
  const directionBtu = Math.round(afterSun * DIRECTION_BTU_PCT[roomDirection]);
  const afterDir = afterSun + directionBtu;
  const roofBtu = Math.round(afterDir * ROOF_BTU_PCT[roofStatus]);

  const totalBtu = Math.round(afterDir + roofBtu);

  const rawTonnage = totalBtu / 12000;
  const recommendedTonnage = roundToStandardTonnage(rawTonnage);

  return {
    areaSqFt,
    volumeCuFt,
    baseBtu,
    occupancyBtu,
    sunExposureBtu,
    directionBtu,
    roofBtu,
    totalBtu,
    rawTonnage,
    recommendedTonnage,
    sunExposure,
    roomDirection,
    roofStatus,
    occupants,
    priority,
  };
}

export function getRecommendationNote(
  result: CalcResult,
  lang: 'en' | 'hi' | 'mr' = 'en',
): string {
  const { recommendedTonnage, areaSqFt, sunExposure, occupants, roomDirection, roofStatus } = result;
  const parts: string[] = [];
  parts.push(
    `For a ${Math.round(areaSqFt)} sq ft room, a ${recommendedTonnage.toFixed(
      1,
    )} Ton AC is recommended.`,
  );
  if (sunExposure === 'high') {
    parts.push(
      'Since your room has high sun exposure (top floor or direct sunlight), a slightly larger capacity helps maintain cooling during peak hours.',
    );
  } else if (sunExposure === 'moderate') {
    parts.push(
      'Your room has moderate sun exposure, so the standard capacity should perform well.',
    );
  } else {
    parts.push(
      'With low sun exposure, the recommended capacity will cool efficiently without overshooting.',
    );
  }
  if (roomDirection === 'west' || roomDirection === 'south') {
    parts.push(
      `Additional cooling allowance has been added because your room is ${roomDirection}-facing, which receives more direct solar heat.`,
    );
  }
  if (roofStatus === 'top_uninsulated') {
    parts.push(
      'A top-floor or independent-house uninsulated concrete roof exposed to direct sun adds significant heat gain, so extra capacity has been included.',
    );
  } else if (roofStatus === 'top_insulated') {
    parts.push(
      'A top-floor or independent-house insulated/shaded roof (or false ceiling) adds moderate heat gain; a capacity allowance has been included.',
    );
  } else if (roofStatus === 'middle') {
    parts.push(
      'A middle floor with another apartment above adds a small heat allowance.',
    );
  } else {
    parts.push(
      'A ground floor with cool/shaded space above keeps heat gain minimal.',
    );
  }
  if (occupants > 2) {
    parts.push(
      `Extra cooling allowance has been added for ${occupants - 2} additional occupant${
        occupants - 2 > 1 ? 's' : ''
      } beyond the baseline of 2.`,
    );
  }
  return parts.join(' ');
}

export function getMultiUnitAdvisor(result: CalcResult): MultiUnitAdvisor {
  const totalTonnage = result.recommendedTonnage;

  if (totalTonnage < 2.5) {
    return {
      showAdvisor: false,
      optionA: { count: 1, tonnagePerUnit: totalTonnage, totalTonnage, label: `1 x ${totalTonnage.toFixed(1)} Ton` },
      optionB: { count: 1, tonnagePerUnit: totalTonnage, totalTonnage, label: `1 x ${totalTonnage.toFixed(1)} Ton` },
      criteria: [],
      recommendation: { winner: 'A', text: '' },
    };
  }

  const optionA: UnitConfig = {
    count: 1,
    tonnagePerUnit: totalTonnage,
    totalTonnage,
    label: `1 x ${totalTonnage.toFixed(1)} Ton`,
  };

  const perUnit = totalTonnage / 2;
  const perUnitRounded = roundToStandardTonnage(perUnit);
  const optionB: UnitConfig = {
    count: 2,
    tonnagePerUnit: perUnitRounded,
    totalTonnage: perUnitRounded * 2,
    label: `2 x ${perUnitRounded.toFixed(1)} Ton`,
  };

  const criteria: TradeOffCriterion[] = [
    {
      key: 'efficiency',
      label: 'Energy Efficiency & Bills',
      optionA: 'A single unit runs at full load whenever on — higher power draw, especially with fewer people.',
      optionB: 'Two inverter units run at partial load, saving 20–30% on electricity when fewer occupants are present.',
      winner: 'B',
    },
    {
      key: 'airflow',
      label: 'Airflow & Comfort',
      optionA: 'One unit cools from a single point — hot spots can form in larger rooms.',
      optionB: 'Two units distribute air across the room, eliminating hot spots for even cooling.',
      winner: 'B',
    },
    {
      key: 'redundancy',
      label: 'Redundancy & Reliability',
      optionA: 'If the single unit fails or needs service, the room has no cooling backup.',
      optionB: 'If one unit is under maintenance, the other keeps cooling — no total downtime.',
      winner: 'B',
    },
    {
      key: 'cost',
      label: 'Initial Cost & Maintenance',
      optionA: 'One unit means lower upfront cost, one installation, and fewer maintenance points.',
      optionB: 'Two units cost more upfront (two installs) and double the maintenance points.',
      winner: 'A',
    },
  ];

  const area = Math.round(result.areaSqFt);
  const occ = result.occupants;
  let winner: 'A' | 'B' = 'B';
  let text = `For ${occ} occupant${occ > 1 ? 's' : ''} in a ${area} sq ft room, ${optionB.label} ACs are recommended for optimal air throw, reliability, and lower long-term power bills.`;

  if (occ <= 4 && area < 350) {
    winner = 'A';
    text = `For ${occ} occupant${occ > 1 ? 's' : ''} in a ${area} sq ft room, ${optionA.label} is recommended — the space and occupancy are modest, so a single unit keeps upfront and maintenance costs low while cooling comfortably.`;
  }

  return {
    showAdvisor: true,
    optionA,
    optionB,
    criteria,
    recommendation: { winner, text },
  };
}

export function getBrandRecommendation(
  result: CalcResult,
): { brand: string; model: ACModel | null; highlight: string; note: string } {
  const meta = PRIORITY_META[result.priority];
  const matching = AC_MODELS.filter(
    (m) =>
      m.tonnage === result.recommendedTonnage &&
      meta.brands.includes(m.brand),
  );
  const model = matching.length > 0 ? matching[0] : null;
  const brand = model ? model.brand : meta.brands[0];
  return {
    brand,
    model,
    highlight: meta.highlight,
    note: `Based on your priority "${meta.label}", we recommend ${brand}. ${
      model
        ? `The ${model.brand} ${model.modelName} (${model.tonnage.toFixed(1)} Ton) matches your required capacity.`
        : `Look for a ${result.recommendedTonnage.toFixed(1)} Ton unit from ${brand}.`
    }`,
  };
}

export function computeBill(
  model: ACModel,
  settings: ElectricitySettings,
): BillCalc {
  const annualKwh = model.powerConsumptionKwhYear;
  const annualCost = annualKwh * settings.ratePerKwh;
  const monthlyCost = settings.operatingMonths > 0
    ? annualCost / settings.operatingMonths
    : annualCost;
  return { annualCost, monthlyCost, annualKwh };
}

export function computeSavingsComparison(
  tonnage: number,
  settings: ElectricitySettings,
): SavingsComparison {
  const matching = AC_MODELS.filter((m) => m.tonnage === tonnage);
  const fiveStar = matching.find((m) => m.energyRating >= 5) ?? null;
  const threeStar = matching.find((m) => m.energyRating === 3) ?? null;

  const fiveStarAnnualCost = fiveStar
    ? computeBill(fiveStar, settings).annualCost
    : 0;
  const threeStarAnnualCost = threeStar
    ? computeBill(threeStar, settings).annualCost
    : 0;
  const annualSavings = Math.max(0, threeStarAnnualCost - fiveStarAnnualCost);

  let paybackYears: number | null = null;
  const pricePremium =
    fiveStar && threeStar
      ? Math.max(0, fiveStar.estimatedPrice - threeStar.estimatedPrice)
      : 0;
  if (annualSavings > 0 && pricePremium > 0) {
    paybackYears = pricePremium / annualSavings;
  }

  return {
    fiveStar,
    threeStar,
    fiveStarAnnualCost,
    threeStarAnnualCost,
    annualSavings,
    paybackYears,
    pricePremium,
  };
}

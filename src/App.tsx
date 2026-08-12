import { useEffect, useMemo, useState } from 'react';
import {
  Snowflake,
  Calculator,
  Table2,
  Ruler,
  Sun,
  Users,
  Zap,
  TrendingUp,
  CheckCircle2,
  Search,
  Star,
  ArrowRight,
  ArrowLeft,
  Building2,
  Filter,
  Wind,
  Wallet,
  VolumeX,
  Flame,
  Moon,
  Sun as SunIcon,
  Award,
  ThumbsUp,
  ThumbsDown,
  Gauge,
  Sparkles,
  LayoutGrid,
  Rows3,
  X,
  RotateCcw,
  Info,
  TrendingDown,
  Layers,
  DollarSign,
  ShieldCheck,
  Wind as WindIcon,
  Calendar,
  PiggyBank,
  Receipt,
  Globe,
  Camera,
  Loader2,
} from 'lucide-react';
import {
  ACModel,
  AC_MODELS,
  CURRENCIES,
  CalcResult,
  DEFAULT_ELECTRICITY,
  DimUnit,
  ElectricitySettings,
  MultiUnitAdvisor,
  PRIORITY_META,
  Priority,
  ROOM_DIRECTIONS,
  ROOF_STATUSES,
  RoofStatus,
  RoomDirection,
  SavingsComparison,
  STANDARD_TONNAGES,
  SUN_EXPOSURE_LABELS,
  SunExposure,
  UnitSystem,
} from '@/types';
import { translate, Language, LANGUAGES } from '@/i18n';
import {
  calculateTonnage,
  computeBill,
  computeSavingsComparison,
  dimToFeet,
  getBrandRecommendation,
  getMultiUnitAdvisor,
  getRecommendationNote,
  toFeet,
} from '@/calc';

type Tab = 1 | 2 | 3;

const PRIORITY_ICONS: Record<Priority, React.ReactNode> = {
  electricity: <Zap className="h-5 w-5" />,
  budget: <Wallet className="h-5 w-5" />,
  quiet_smart: <VolumeX className="h-5 w-5" />,
  extreme_heat: <Flame className="h-5 w-5" />,
};

const PRIORITY_LABEL_KEYS: Record<Priority, { label: string; desc: string }> = {
  electricity: { label: 'priorityElectricity', desc: 'priorityElectricityDesc' },
  budget: { label: 'priorityBudget', desc: 'priorityBudgetDesc' },
  quiet_smart: { label: 'priorityQuiet', desc: 'priorityQuietDesc' },
  extreme_heat: { label: 'priorityHeat', desc: 'priorityHeatDesc' },
};

const SUN_LABEL_KEYS: Record<SunExposure, string> = {
  low: 'sunLow',
  moderate: 'sunModerate',
  high: 'sunHigh',
};

function App() {
  const [dark, setDark] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tab>(1);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [tonnageFilter, setTonnageFilter] = useState<number | 'all'>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [electricity, setElectricity] = useState<ElectricitySettings>(DEFAULT_ELECTRICITY);
  const [lang, setLang] = useState<Language>('en');

  const t = (key: string) => translate(lang, key);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleCalculate = (r: CalcResult) => {
    setResult(r);
    setTonnageFilter(r.recommendedTonnage);
    setBrandFilter('all');
    setSearchQuery('');
    setActiveTab(2);
  };

  const handleViewComparison = () => {
    if (result) setTonnageFilter(result.recommendedTonnage);
    setActiveTab(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cool-50 via-white to-cool-100 transition-colors duration-300 dark:from-cool-950 dark:via-cool-950 dark:to-cool-900">
      <Header
        dark={dark}
        onToggleDark={setDark}
        unit={unit}
        onUnit={setUnit}
        lang={lang}
        onLang={setLang}
        t={t}
      />
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <Stepper activeTab={activeTab} onChange={setActiveTab} t={t} />
        {activeTab === 1 && (
          <CalculatorSection
            unit={unit}
            onUnit={setUnit}
            onCalculate={handleCalculate}
            lang={lang}
            t={t}
          />
        )}
        {activeTab === 2 && result && (
          <ResultsSection
            result={result}
            electricity={electricity}
            lang={lang}
            t={t}
            onBack={() => setActiveTab(1)}
            onViewComparison={handleViewComparison}
          />
        )}
        {activeTab === 2 && !result && (
          <NoResultPlaceholder t={t} onBack={() => setActiveTab(1)} />
        )}
        {activeTab === 3 && (
          <ComparisonSection
            tonnageFilter={tonnageFilter}
            onTonnageFilter={setTonnageFilter}
            brandFilter={brandFilter}
            onBrandFilter={setBrandFilter}
            searchQuery={searchQuery}
            onSearchQuery={setSearchQuery}
            calculatedTonnage={result?.recommendedTonnage ?? null}
            electricity={electricity}
            onElectricity={setElectricity}
            lang={lang}
            t={t}
            onBack={() => setActiveTab(2)}
          />
        )}
      </main>
      <Footer t={t} />
    </div>
  );
}

type TFunc = (key: string) => string;

function Header({
  dark,
  onToggleDark,
  unit,
  onUnit,
  lang,
  onLang,
  t,
}: {
  dark: boolean;
  onToggleDark: (v: boolean) => void;
  unit: UnitSystem;
  onUnit: (u: UnitSystem) => void;
  lang: Language;
  onLang: (l: Language) => void;
  t: TFunc;
}) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-cool-700 via-cool-600 to-cool-500 dark:from-cool-900 dark:via-cool-800 dark:to-cool-700">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-cool-300/40 blur-2xl" />
      </div>
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/30 sm:h-11 sm:w-11">
            <Snowflake className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold tracking-tight text-white sm:text-2xl">
              {t('appTitle')}
            </h1>
            <p className="hidden text-xs font-medium text-cool-100 sm:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 p-1 backdrop-blur-sm">
            <UnitToggle unit={unit} onUnit={onUnit} t={t} />
          </div>
          <div className="relative inline-flex items-center rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm">
            <Globe className="pointer-events-none absolute left-2.5 h-4 w-4 text-white/70" />
            <select
              value={lang}
              onChange={(e) => onLang(e.target.value as Language)}
              aria-label="Language"
              className="cursor-pointer appearance-none rounded-xl bg-transparent py-2 pl-8 pr-7 text-xs font-semibold text-white outline-none sm:text-sm"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-cool-800">
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 text-white/70">▾</span>
          </div>
          <button
            onClick={() => onToggleDark(!dark)}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:h-10 sm:w-10"
          >
            {dark ? <SunIcon className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}

function UnitToggle({ unit, onUnit, t }: { unit: UnitSystem; onUnit: (u: UnitSystem) => void; t: TFunc }) {
  return (
    <div className="flex items-center text-xs font-semibold text-white">
      <button
        onClick={() => onUnit('imperial')}
        className={`rounded-lg px-3 py-1.5 transition-colors ${
          unit === 'imperial' ? 'bg-white text-cool-700' : 'hover:bg-white/10'
        }`}
      >
        {t('unitFeet')}
      </button>
      <button
        onClick={() => onUnit('metric')}
        className={`rounded-lg px-3 py-1.5 transition-colors ${
          unit === 'metric' ? 'bg-white text-cool-700' : 'hover:bg-white/10'
        }`}
      >
        {t('unitMeters')}
      </button>
    </div>
  );
}

function Stepper({ activeTab, onChange, t }: { activeTab: Tab; onChange: (t: Tab) => void; t: TFunc }) {
  const steps: { id: Tab; labelKey: string; icon: React.ReactNode }[] = [
    { id: 1, labelKey: 'stepCalculator', icon: <Calculator className="h-4 w-4" /> },
    { id: 2, labelKey: 'stepResults', icon: <Gauge className="h-4 w-4" /> },
    { id: 3, labelKey: 'stepCompare', icon: <Table2 className="h-4 w-4" /> },
  ];
  return (
    <div className="mt-6 sm:mt-8">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        {steps.map((s, i) => {
          const isActive = activeTab === s.id;
          const isDone = activeTab > s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <button
                onClick={() => onChange(s.id)}
                className="group flex flex-col items-center gap-1.5"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    isActive
                      ? 'border-cool-600 bg-cool-600 text-white shadow-glow'
                      : isDone
                        ? 'border-cool-500 bg-cool-50 text-cool-600 dark:bg-cool-900'
                        : 'border-cool-200 bg-white text-cool-400 dark:border-cool-700 dark:bg-cool-900'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-5 w-5" /> : s.icon}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isActive ? 'text-cool-700 dark:text-cool-200' : 'text-cool-400'
                  }`}
                >
                  {t(s.labelKey)}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                    activeTab > s.id ? 'bg-cool-500' : 'bg-cool-200 dark:bg-cool-800'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RoomPreset {
  labelKey: string;
  hintKey: string;
  lengthFt: number;
  widthFt: number;
}

const ROOM_PRESETS: RoomPreset[] = [
  { labelKey: 'presetSmall', hintKey: 'presetSmallHint', lengthFt: 10, widthFt: 12 },
  { labelKey: 'presetMedium', hintKey: 'presetMediumHint', lengthFt: 14, widthFt: 14 },
  { labelKey: 'presetLarge', hintKey: 'presetLargeHint', lengthFt: 18, widthFt: 16 },
];

function CalculatorSection({
  unit,
  onUnit,
  onCalculate,
  lang,
  t,
}: {
  unit: UnitSystem;
  onUnit: (u: UnitSystem) => void;
  onCalculate: (r: CalcResult) => void;
  lang: Language;
  t: TFunc;
}) {
  const dimUnit: DimUnit = unit === 'metric' ? 'm' : 'ft';
  const [lengthVal, setLengthVal] = useState<string>('');
  const [widthVal, setWidthVal] = useState<string>('');
  const [heightVal, setHeightVal] = useState<string>('10');
  const [sunExposure, setSunExposure] = useState<SunExposure>('moderate');
  const [roomDirection, setRoomDirection] = useState<RoomDirection>('none');
  const [roofStatus, setRoofStatus] = useState<RoofStatus>('middle');
  const [occupants, setOccupants] = useState<string>('2');
  const [priority, setPriority] = useState<Priority>('electricity');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanPreview, setScanPreview] = useState('');
  const [scanEstimated, setScanEstimated] = useState(false);

  const unitShort = t(`unit${dimUnit === 'm' ? 'M' : 'Ft'}`);

  const convertPreset = (ft: number, target: DimUnit): string => {
    if (target === 'ft') return String(ft);
    if (target === 'm') return (ft / 3.28084).toFixed(1);
    return String(Math.round(ft * 12));
  };

  useEffect(() => {
    setHeightVal(dimUnit === 'm' ? '3' : '10');
  }, [dimUnit]);

  const lenNum = parseFloat(lengthVal);
  const widNum = parseFloat(widthVal);
  const ceilNum = parseFloat(heightVal);
  const occNum = parseInt(occupants, 10);

  const lenFt = isNaN(lenNum) ? 0 : dimToFeet(lenNum, dimUnit);
  const widFt = isNaN(widNum) ? 0 : dimToFeet(widNum, dimUnit);
  const liveAreaSqFt = lenFt * widFt;
  const liveBaseBtu = liveAreaSqFt * 25;
  const liveRawTon = liveBaseBtu / 12000;

  const dimError =
    touched.length || touched.width || touched.height
      ? (!lenNum || !widNum || !ceilNum || lenNum <= 0 || widNum <= 0 || ceilNum <= 0
          ? t('dimError')
          : '')
      : '';
  const occError = touched.occupants ? (isNaN(occNum) || occNum < 1 ? t('occError') : '') : '';
  const hasError = !!dimError || !!occError;

  const applyPreset = (p: RoomPreset) => {
    setLengthVal(convertPreset(p.lengthFt, dimUnit));
    setWidthVal(convertPreset(p.widthFt, dimUnit));
    setTouched({});
  };

  const handleRoomScan = async (file: File) => {
    setScanError('');
    setScanEstimated(false);
    if (!file.type.startsWith('image/')) {
      setScanError('Please choose a JPG, PNG, or WebP room image.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setScanError('Please choose an image smaller than 12 MB.');
      return;
    }

    let image: string;
    try {
      image = await new Promise<string>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const preview = new Image();
      preview.onload = () => {
        const maxSize = 1024;
        const scale = Math.min(1, maxSize / Math.max(preview.naturalWidth, preview.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(preview.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(preview.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Your browser could not prepare this image.'));
          return;
        }
        context.drawImage(preview, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      preview.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('This image could not be opened. Please choose another photo.'));
      };
        preview.src = objectUrl;
      });
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'This image could not be prepared.');
      return;
    }
    setScanPreview(image);
    setScanLoading(true);

    try {
      const response = await fetch('/api/analyze-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      const failureMessage = 'Failed to analyze photo. Please try retaking the photo or entering dimensions manually.';
      if (!response.ok) {
        try {
          await response.text();
        } catch {
          // Ignore non-readable error bodies and show the same friendly fallback.
        }
        throw new Error(failureMessage);
      }

      let data: {
        lengthMeters?: number;
        widthMeters?: number;
        ceilingHeightMeters?: number;
        sunlight?: SunExposure;
        error?: string;
      };
      try {
        data = await response.json();
      } catch {
        throw new Error(failureMessage);
      }

      const fromMeters = (meters: number) => dimUnit === 'm' ? meters.toFixed(1) : (meters * 3.28084).toFixed(1);
      setLengthVal(fromMeters(data.lengthMeters ?? 0));
      setWidthVal(fromMeters(data.widthMeters ?? 0));
      setHeightVal(fromMeters(data.ceilingHeightMeters ?? 0));
      if (data.sunlight) setSunExposure(data.sunlight);
      setScanEstimated(true);
      setTouched({});
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Unable to analyze this photo.');
    } finally {
      setScanLoading(false);
    }
  };

  const handleCalculate = () => {
    setTouched({ length: true, width: true, height: true, occupants: true });
    if (!lenNum || !widNum || !ceilNum || lenNum <= 0 || widNum <= 0 || ceilNum <= 0) return;
    if (isNaN(occNum) || occNum < 1) return;
    const lenFtV = dimToFeet(lenNum, dimUnit);
    const widFtV = dimToFeet(widNum, dimUnit);
    const ceilFtV = dimToFeet(ceilNum, dimUnit);
    const res = calculateTonnage(lenFtV, widFtV, ceilFtV, sunExposure, occNum, priority, roomDirection, roofStatus);
    onCalculate(res);
  };

  const placeholderLen = dimUnit === 'm' ? 'e.g. 4.2' : 'e.g. 14';
  const placeholderWid = dimUnit === 'm' ? 'e.g. 3.6' : 'e.g. 12';
  const placeholderHgt = dimUnit === 'm' ? 'e.g. 3' : 'e.g. 10';

  return (
    <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-2">
      <div className="card animate-slide-up p-4 sm:p-6 sm:p-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cool-100 dark:bg-cool-900">
              <Ruler className="h-5 w-5 text-cool-600 dark:text-cool-300" />
            </div>
            <h2 className="text-base font-bold text-cool-800 dark:text-cool-100 sm:text-lg">
              {t('roomDimensions')}
            </h2>
          </div>
          <div className="inline-flex w-fit rounded-lg border border-cool-200 bg-cool-50 p-1 dark:border-cool-700 dark:bg-cool-900">
            <UnitToggle unit={unit} onUnit={onUnit} t={t} />
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-cool-200 bg-cool-50/70 p-3 dark:border-cool-700 dark:bg-cool-900/50">
          <div className="flex items-start gap-3">
            {scanPreview ? (
              <img src={scanPreview} alt="Uploaded room preview" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-cool-200 text-cool-700 dark:bg-cool-800 dark:text-cool-200">
                <Camera className="h-7 w-7" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-cool-800 dark:text-cool-100">Auto-Fill Dimensions from Room Photo</p>
              <p className="mt-1 text-xs text-cool-500 dark:text-cool-400">Use a clear photo with a door, window, or furniture visible.</p>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cool-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cool-800 has-[:disabled]:cursor-wait has-[:disabled]:opacity-70 dark:bg-cool-200 dark:text-cool-900 dark:hover:bg-cool-100">
              <Camera className="h-4 w-4" />
              Take Live Room Photo
              <input
                id="room-camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                disabled={scanLoading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleRoomScan(file);
                  else setScanError('Camera access unavailable. Please choose an existing photo from your gallery.');
                  event.currentTarget.value = '';
                }}
              />
            </label>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-cool-300 bg-background px-3 py-2.5 text-sm font-semibold text-cool-700 shadow-sm transition hover:bg-cool-100 has-[:disabled]:cursor-wait has-[:disabled]:opacity-70 dark:border-cool-600 dark:text-cool-200 dark:hover:bg-cool-800">
              <span aria-hidden="true">📁</span>
              Upload from Gallery
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={scanLoading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleRoomScan(file);
                  event.currentTarget.value = '';
                }}
              />
            </label>
          </div>
          {scanLoading && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-cool-100 px-3 py-2 text-xs font-semibold text-cool-700 dark:bg-cool-800 dark:text-cool-200">
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning room perspective &amp; detecting dimensions...
            </div>
          )}
          {scanPreview && !scanLoading && (
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-cool-700 underline-offset-2 hover:underline dark:text-cool-200"
              onClick={() => document.getElementById('room-camera-input')?.click()}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retake / Choose Different Photo
            </button>
          )}
          {scanEstimated && (
            <p className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              Dimensions estimated via AI. You can manually adjust if needed.
            </p>
          )}
          {scanError && <p className="mt-3 text-xs font-medium text-red-500 dark:text-red-400">{scanError}</p>}
        </div>

        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cool-500 dark:text-cool-400">
            {t('quickPresets')}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-2">
            {ROOM_PRESETS.map((p) => (
              <button
                key={p.labelKey}
                onClick={() => applyPreset(p)}
                className="rounded-xl border border-cool-200 bg-white px-3 py-2.5 text-center transition-all hover:border-cool-400 hover:bg-cool-50 active:scale-[0.97] dark:border-cool-700 dark:bg-cool-950 dark:hover:bg-cool-900"
              >
                <span className="block text-sm font-semibold text-cool-700 dark:text-cool-200">
                  {t(p.labelKey)}
                </span>
                <span className="block text-[11px] text-cool-400 dark:text-cool-500">
                  {t(p.hintKey)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="label-text">
                {t('roomLength')} ({unitShort})
              </label>
              <input
                type="number"
                value={lengthVal}
                onChange={(e) => setLengthVal(e.target.value)}
                onBlur={() => setTouched((tp) => ({ ...tp, length: true }))}
                placeholder={placeholderLen}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">
                {t('roomWidth')} ({unitShort})
              </label>
              <input
                type="number"
                value={widthVal}
                onChange={(e) => setWidthVal(e.target.value)}
                onBlur={() => setTouched((tp) => ({ ...tp, width: true }))}
                placeholder={placeholderWid}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label-text">
              {t('ceilingHeight')} ({unitShort})
            </label>
            <input
              type="number"
              value={heightVal}
              onChange={(e) => setHeightVal(e.target.value)}
              onBlur={() => setTouched((tp) => ({ ...tp, height: true }))}
              placeholder={placeholderHgt}
              className="input-field"
            />
          </div>

          {dimError && (
            <p className="-mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
              <Info className="h-3.5 w-3.5" />
              {dimError}
            </p>
          )}

          <div>
            <label className="label-text">
              <Sun className="mr-1 inline h-4 w-4 align-text-bottom text-cool-500" />
              {t('sunExposure')}
            </label>
            <select
              value={sunExposure}
              onChange={(e) => setSunExposure(e.target.value as SunExposure)}
              className="input-field"
            >
              {(Object.keys(SUN_EXPOSURE_LABELS) as SunExposure[]).map((k) => (
                <option key={k} value={k}>
                  {t(SUN_LABEL_KEYS[k])}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">
              <Sun className="mr-1 inline h-4 w-4 align-text-bottom text-cool-500" />
              {t('roomDirection')}
            </label>
            <select
              value={roomDirection}
              onChange={(e) => setRoomDirection(e.target.value as RoomDirection)}
              className="input-field"
            >
              {ROOM_DIRECTIONS.map((d) => (
                <option key={d.code} value={d.code}>
                  {t(d.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">
              <Building2 className="mr-1 inline h-4 w-4 align-text-bottom text-cool-500" />
              {t('roofStatus')}
            </label>
            <select
              value={roofStatus}
              onChange={(e) => setRoofStatus(e.target.value as RoofStatus)}
              className="input-field"
            >
              {ROOF_STATUSES.map((r) => (
                <option key={r.code} value={r.code}>
                  {t(r.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">
              <Users className="mr-1 inline h-4 w-4 align-text-bottom text-cool-500" />
              {t('occupants')}
            </label>
            <input
              type="number"
              value={occupants}
              onChange={(e) => setOccupants(e.target.value)}
              onBlur={() => setTouched((tp) => ({ ...tp, occupants: true }))}
              placeholder="e.g. 3"
              min={1}
              className="input-field"
            />
            {occError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
                <Info className="h-3.5 w-3.5" />
                {occError}
              </p>
            )}
          </div>
        </div>

        {liveAreaSqFt > 0 && (
          <div className="mt-5 rounded-xl border border-cool-100 bg-cool-50 p-4 dark:border-cool-800 dark:bg-cool-900">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cool-500" />
              <span className="text-xs font-semibold uppercase tracking-wide text-cool-500 dark:text-cool-400">
                {t('liveEstimate')}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-1">
              <div>
                <p className="text-xs text-cool-500 dark:text-cool-400">{t('area')}</p>
                <p className="text-lg font-bold text-cool-800 dark:text-cool-100">
                  {Math.round(liveAreaSqFt)} sq ft
                </p>
              </div>
              <div>
                <p className="text-xs text-cool-500 dark:text-cool-400">{t('baseBtu')}</p>
                <p className="text-lg font-bold text-cool-800 dark:text-cool-100">
                  {Math.round(liveBaseBtu).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-cool-500 dark:text-cool-400">{t('approxTonnage')}</p>
                <p className="text-lg font-bold text-cool-600 dark:text-cool-300">
                  {liveRawTon.toFixed(2)} {t('ton')}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-cool-400 dark:text-cool-500">
              {t('liveEstimateHint')}
            </p>
          </div>
        )}
      </div>

      <div className="card animate-slide-up p-4 sm:p-6 sm:p-7">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cool-100 dark:bg-cool-900">
            <Sparkles className="h-5 w-5 text-cool-600 dark:text-cool-300" />
          </div>
          <h2 className="text-base font-bold text-cool-800 dark:text-cool-100 sm:text-lg">
            {t('yourPriority')}
          </h2>
        </div>
        <p className="mb-4 text-xs text-cool-500 dark:text-cool-400">{t('priorityHint')}</p>

        <div className="space-y-3">
          {(Object.keys(PRIORITY_META) as Priority[]).map((p) => {
            const meta = PRIORITY_META[p];
            const labelKeys = PRIORITY_LABEL_KEYS[p];
            const selected = priority === p;
            return (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                  selected
                    ? 'border-cool-500 bg-cool-50 shadow-sm ring-1 ring-cool-300 dark:border-cool-400 dark:bg-cool-900 dark:ring-cool-700'
                    : 'border-cool-200 bg-white hover:border-cool-300 hover:bg-cool-50/50 dark:border-cool-800 dark:bg-cool-950 dark:hover:bg-cool-900'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    selected
                      ? 'bg-cool-600 text-white'
                      : 'bg-cool-100 text-cool-600 dark:bg-cool-900 dark:text-cool-300'
                  }`}
                >
                  {PRIORITY_ICONS[p]}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      selected ? 'text-cool-800 dark:text-cool-100' : 'text-cool-700 dark:text-cool-200'
                    }`}
                  >
                    {t(labelKeys.label)}
                  </p>
                  <p className="mt-0.5 text-xs text-cool-500 dark:text-cool-400">
                    {t(labelKeys.desc)}
                  </p>
                </div>
                <div
                  className={`mt-1 h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
                    selected ? 'border-cool-600 bg-cool-600' : 'border-cool-300 dark:border-cool-700'
                  }`}
                >
                  {selected && <CheckCircle2 className="h-full w-full text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={handleCalculate} disabled={hasError} className="btn-primary mt-5 w-full">
          <Calculator className="h-5 w-5" />
          {t('calculateBtn')}
          <ArrowRight className="h-4 w-4" />
        </button>
        {hasError && (
          <p className="mt-2 text-center text-xs text-cool-400 dark:text-cool-500">
            {t('fillFields')}
          </p>
        )}
      </div>
    </div>
  );
}

function NoResultPlaceholder({ t, onBack }: { t: TFunc; onBack: () => void }) {
  return (
    <div className="mt-6 card flex flex-col items-center justify-center p-8 text-center sm:mt-8 sm:p-10">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cool-50 dark:bg-cool-900">
        <Wind className="h-8 w-8 text-cool-300" />
      </div>
      <h3 className="text-lg font-semibold text-cool-700 dark:text-cool-200">{t('noResults')}</h3>
      <p className="mt-1 max-w-xs text-sm text-cool-500 dark:text-cool-400">{t('noResultsHint')}</p>
      <button onClick={onBack} className="btn-secondary mt-5">
        <ArrowLeft className="h-4 w-4" />
        {t('backToCalculator')}
      </button>
    </div>
  );
}

function ResultsSection({
  result,
  electricity,
  lang,
  t,
  onBack,
  onViewComparison,
}: {
  result: CalcResult;
  electricity: ElectricitySettings;
  lang: Language;
  t: TFunc;
  onBack: () => void;
  onViewComparison: () => void;
}) {
  const note = getRecommendationNote(result);
  const rec = getBrandRecommendation(result);
  const meta = PRIORITY_META[result.priority];
  const advisor = getMultiUnitAdvisor(result);
  const savings = computeSavingsComparison(result.recommendedTonnage, electricity);
  const priorityLabel = t(PRIORITY_LABEL_KEYS[result.priority].label);

  return (
    <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
      <div className="card animate-scale-in overflow-hidden">
        <div className="bg-gradient-to-r from-cool-600 to-cool-500 p-5 text-white sm:p-6">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-cool-100" />
            <span className="text-sm font-medium text-cool-100">{t('heatLoadSummary')}</span>
          </div>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-cool-100">{t('recommendedSize')}</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {result.recommendedTonnage.toFixed(1)}
                </span>
                <span className="mb-1.5 text-lg font-semibold text-cool-100 sm:text-xl">
                  {t('ton')}
                </span>
              </div>
              <p className="mt-1 text-sm text-cool-100">
                {result.totalBtu.toLocaleString()} {t('btuRequired')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STANDARD_TONNAGES.map((tn) => (
                <span
                  key={tn}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    tn === result.recommendedTonnage
                      ? 'bg-white text-cool-700 shadow-sm'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {tn.toFixed(1)}T
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-cool-100 sm:grid-cols-3 dark:bg-cool-800">
          <StatTile icon={<Ruler className="h-4 w-4" />} label={t('roomArea')} value={`${Math.round(result.areaSqFt)} sq ft`} />
          <StatTile icon={<Building2 className="h-4 w-4" />} label={t('volume')} value={`${Math.round(result.volumeCuFt)} cu ft`} />
          <StatTile icon={<Zap className="h-4 w-4" />} label={t('baseBtu')} value={result.baseBtu.toLocaleString()} />
          <StatTile icon={<Users className="h-4 w-4" />} label={t('occupancyBtu')} value={`+${result.occupancyBtu.toLocaleString()}`} />
          <StatTile icon={<Sun className="h-4 w-4" />} label={t('sunExposureBtu')} value={`+${result.sunExposureBtu.toLocaleString()}`} />
          <StatTile icon={<Building2 className="h-4 w-4" />} label={t('directionBtu')} value={`+${result.directionBtu.toLocaleString()}`} />
          <StatTile icon={<Building2 className="h-4 w-4" />} label={t('roofBtu')} value={`+${result.roofBtu.toLocaleString()}`} />
          <StatTile icon={<TrendingUp className="h-4 w-4" />} label={t('rawTonnage')} value={result.rawTonnage.toFixed(2)} />
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-xl bg-cool-50 p-4 dark:bg-cool-900">
            <div className="mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cool-600 dark:text-cool-400" />
              <span className="text-sm font-semibold text-cool-700 dark:text-cool-200">
                {t('recommendationNote')}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-cool-700 dark:text-cool-300">{note}</p>
          </div>
        </div>
      </div>

      <div className="card animate-slide-up overflow-hidden">
        <div className="flex items-center gap-3 border-b border-cool-100 bg-gradient-to-r from-amber-50 to-cool-50 p-4 sm:p-5 dark:border-cool-800 dark:from-amber-950/40 dark:to-cool-900/40">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 sm:h-11 sm:w-11">
            <Award className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              {t('smartBrandRec')}
            </p>
            <h3 className="text-lg font-bold text-cool-800 dark:text-cool-100">{rec.brand}</h3>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cool-100 px-3 py-1.5 text-sm font-semibold text-cool-700 dark:bg-cool-900 dark:text-cool-200">
            {PRIORITY_ICONS[result.priority]}
            {t('priorityLabel')}: {priorityLabel}
          </div>
          <p className="mb-3 text-sm leading-relaxed text-cool-700 dark:text-cool-300">{rec.note}</p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {t('whyBrand')} {rec.brand}?
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{rec.highlight}</p>
          </div>
          {rec.model && (
            <div className="mt-4 flex flex-col gap-3 rounded-xl bg-cool-50 p-4 dark:bg-cool-900 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium text-cool-500 dark:text-cool-400">
                  {t('matchingModel')}
                </p>
                <p className="text-sm font-semibold text-cool-800 dark:text-cool-100">
                  {rec.model.brand} {rec.model.modelName}
                </p>
                <p className="text-xs text-cool-500 dark:text-cool-400">
                  {rec.model.tonnage.toFixed(1)} {t('ton')} · {rec.model.energyRating}★ ·{' '}
                  {rec.model.powerConsumptionKwhYear} kWh/yr
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-medium text-cool-500 dark:text-cool-400">{t('estPrice')}</p>
                <p className="text-lg font-bold text-cool-800 dark:text-cool-100">
                  {electricity.currencySymbol}
                  {rec.model.estimatedPrice.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button onClick={onBack} className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          {t('editInputs')}
        </button>
        <button onClick={onViewComparison} className="btn-primary">
          <Table2 className="h-5 w-5" />
          {t('compareMatching')}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {advisor.showAdvisor && <MultiUnitAdvisorSection advisor={advisor} t={t} />}

      <SavingsComparisonWidget savings={savings} electricity={electricity} tonnage={result.recommendedTonnage} t={t} />
    </div>
  );
}

function MultiUnitAdvisorSection({ advisor, t }: { advisor: MultiUnitAdvisor; t: TFunc }) {
  const criteriaIcons: Record<string, React.ReactNode> = {
    efficiency: <TrendingDown className="h-5 w-5" />,
    airflow: <WindIcon className="h-5 w-5" />,
    redundancy: <ShieldCheck className="h-5 w-5" />,
    cost: <DollarSign className="h-5 w-5" />,
  };

  const winnerOption = advisor.recommendation.winner === 'A' ? advisor.optionA : advisor.optionB;
  const winnerLabel = advisor.recommendation.winner === 'A' ? t('optionA') : t('optionB');

  return (
    <div className="card animate-scale-in overflow-hidden">
      <div className="flex items-center gap-3 border-b border-cool-100 bg-gradient-to-r from-cool-600 to-cool-500 p-4 text-white sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Layers className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-cool-100">
            {t('multiUnitTitle')}
          </p>
          <h3 className="text-base font-bold sm:text-lg">{t('multiUnitSubtitle')}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
        <div className={`rounded-xl border-2 p-4 transition-colors ${
          advisor.recommendation.winner === 'A'
            ? 'border-cool-500 bg-cool-50 dark:border-cool-400 dark:bg-cool-900'
            : 'border-cool-100 bg-white dark:border-cool-800 dark:bg-cool-950'
        }`}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-cool-500 dark:text-cool-400">
              {t('optionA')} · {t('optionSingle')}
            </span>
            {advisor.recommendation.winner === 'A' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cool-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                <CheckCircle2 className="h-3 w-3" /> {t('best')}
              </span>
            )}
          </div>
          <p className="text-xl font-extrabold text-cool-800 dark:text-cool-100">
            {advisor.optionA.label}
          </p>
          <p className="mt-1 text-xs text-cool-500 dark:text-cool-400">{t('singleUnitDesc')}</p>
        </div>

        <div className={`rounded-xl border-2 p-4 transition-colors ${
          advisor.recommendation.winner === 'B'
            ? 'border-cool-500 bg-cool-50 dark:border-cool-400 dark:bg-cool-900'
            : 'border-cool-100 bg-white dark:border-cool-800 dark:bg-cool-950'
        }`}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-cool-500 dark:text-cool-400">
              {t('optionB')} · {t('optionMulti')}
            </span>
            {advisor.recommendation.winner === 'B' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cool-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                <CheckCircle2 className="h-3 w-3" /> {t('best')}
              </span>
            )}
          </div>
          <p className="text-xl font-extrabold text-cool-800 dark:text-cool-100">
            {advisor.optionB.label}
          </p>
          <p className="mt-1 text-xs text-cool-500 dark:text-cool-400">{t('multiUnitDesc')}</p>
        </div>
      </div>

      <div className="border-t border-cool-100 p-4 sm:p-5 dark:border-cool-800">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-cool-500 dark:text-cool-400">
          {t('tradeOff')}
        </p>
        <div className="space-y-3">
          {advisor.criteria.map((c) => {
            const icon = criteriaIcons[c.key] ?? <Sparkles className="h-5 w-5" />;
            return (
              <div key={c.key} className="rounded-xl border border-cool-100 bg-cool-50/50 p-3 dark:border-cool-800 dark:bg-cool-900/40">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cool-100 text-cool-600 dark:bg-cool-800 dark:text-cool-300">
                    {icon}
                  </div>
                  <p className="text-sm font-bold text-cool-800 dark:text-cool-100">{c.label}</p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className={`rounded-lg p-3 text-xs leading-relaxed ${
                    c.winner === 'A'
                      ? 'bg-cool-100 text-cool-800 dark:bg-cool-800 dark:text-cool-50'
                      : 'bg-white text-cool-600 dark:bg-cool-950 dark:text-cool-300'
                  }`}>
                    <span className="mb-1 block font-semibold text-cool-700 dark:text-cool-200">
                      {t('optionA')}
                    </span>
                    {c.optionA}
                  </div>
                  <div className={`rounded-lg p-3 text-xs leading-relaxed ${
                    c.winner === 'B'
                      ? 'bg-cool-100 text-cool-800 dark:bg-cool-800 dark:text-cool-50'
                      : 'bg-white text-cool-600 dark:bg-cool-950 dark:text-cool-300'
                  }`}>
                    <span className="mb-1 block font-semibold text-cool-700 dark:text-cool-200">
                      {t('optionB')}
                    </span>
                    {c.optionB}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-cool-100 bg-gradient-to-r from-amber-50 to-cool-50 p-4 sm:p-5 dark:border-cool-800 dark:from-amber-950/40 dark:to-cool-900/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              {t('finalRec')}
            </p>
            <p className="mt-1 text-sm font-bold text-cool-800 dark:text-cool-100">
              {winnerLabel} — {winnerOption.label}
            </p>
            <p className="mt-1 text-sm text-cool-600 dark:text-cool-300">
              {advisor.recommendation.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ElectricitySettingsPanel({
  electricity,
  onElectricity,
  t,
}: {
  electricity: ElectricitySettings;
  onElectricity: (e: ElectricitySettings) => void;
  t: TFunc;
}) {
  const update = (patch: Partial<ElectricitySettings>) =>
    onElectricity({ ...electricity, ...patch });

  return (
    <div className="card mb-4 p-4 sm:mb-6 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cool-100 text-cool-600 dark:bg-cool-800 dark:text-cool-300">
          <Receipt className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-cool-800 dark:text-cool-100">{t('elecBillCalc')}</h3>
          <p className="text-xs text-cool-500 dark:text-cool-400">{t('elecBillHint')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-cool-600 dark:text-cool-300">
            {t('currency')}
          </label>
          <select
            value={CURRENCIES.find((c) => c.symbol === electricity.currencySymbol)?.code ?? 'CUSTOM'}
            onChange={(e) => {
              const selected = CURRENCIES.find((c) => c.code === e.target.value);
              update({ currencySymbol: selected?.symbol ?? electricity.currencySymbol });
            }}
            className="input-field"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-cool-600 dark:text-cool-300">
            {t('elecRate')}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-cool-400">
              {electricity.currencySymbol}
            </span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={electricity.ratePerKwh}
              onChange={(e) => update({ ratePerKwh: Number(e.target.value) || 0 })}
              className="input-field pl-7"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-cool-600 dark:text-cool-300">
            <span>{t('dailyUsage')}</span>
            <span className="text-cool-400">
              {electricity.dailyHours} {t('hrsDay')}
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={24}
            step={1}
            value={electricity.dailyHours}
            onChange={(e) => update({ dailyHours: Number(e.target.value) })}
            className="w-full accent-cool-600"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-cool-600 dark:text-cool-300">
            {t('operatingMonths')}
          </label>
          <select
            value={electricity.operatingMonths}
            onChange={(e) => update({ operatingMonths: Number(e.target.value) })}
            className="input-field"
          >
            {[3, 4, 6, 8, 9, 12].map((m) => (
              <option key={m} value={m}>
                {m} {t('months')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function SavingsComparisonWidget({
  savings,
  electricity,
  tonnage,
  t,
}: {
  savings: SavingsComparison;
  electricity: ElectricitySettings;
  tonnage: number;
  t: TFunc;
}) {
  if (!savings.fiveStar || !savings.threeStar) {
    return (
      <div className="card p-4 sm:p-5">
        <p className="text-sm text-cool-500 dark:text-cool-400">
          {t('savingsUnavailable')} {tonnage.toFixed(1)} {t('savingsUnavailableTon')}
        </p>
      </div>
    );
  }

  const sym = electricity.currencySymbol;
  const fmt = (n: number) => `${sym}${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="card animate-scale-in overflow-hidden">
      <div className="flex items-center gap-3 border-b border-cool-100 bg-gradient-to-r from-emerald-600 to-cool-600 p-4 text-white sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <PiggyBank className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-50">
            {t('energySavings')}
          </p>
          <h3 className="text-base font-bold sm:text-lg">
            {t('savingsTitle')} · {tonnage.toFixed(1)} {t('ton')}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
        <div className="rounded-xl border border-cool-100 bg-white p-4 dark:border-cool-800 dark:bg-cool-950">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {t('star3')}
            </span>
            <span className="text-xs text-cool-400">
              {savings.threeStar.brand} {savings.threeStar.modelName}
            </span>
          </div>
          <p className="text-2xl font-extrabold text-cool-800 dark:text-cool-100">
            {fmt(savings.threeStarAnnualCost)}
            <span className="ml-1 text-xs font-medium text-cool-400">{t('perYear')}</span>
          </p>
          <p className="mt-1 text-xs text-cool-500 dark:text-cool-400">
            {fmt(savings.threeStarAnnualCost / electricity.operatingMonths)} {t('perMonth')}
          </p>
        </div>

        <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 p-4 dark:bg-emerald-950/40">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              <Star className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" /> {t('star5')}
            </span>
            <span className="text-xs text-cool-400">
              {savings.fiveStar.brand} {savings.fiveStar.modelName}
            </span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
            {fmt(savings.fiveStarAnnualCost)}
            <span className="ml-1 text-xs font-medium text-emerald-500">{t('perYear')}</span>
          </p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            {fmt(savings.fiveStarAnnualCost / electricity.operatingMonths)} {t('perMonth')}
          </p>
        </div>
      </div>

      <div className="border-t border-cool-100 bg-gradient-to-r from-emerald-50 to-cool-50 p-4 sm:p-5 dark:border-cool-800 dark:from-emerald-950/40 dark:to-cool-900/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-cool-800 dark:text-cool-100">
              {t('savingsIntro')}{' '}
              <span className="text-emerald-600 dark:text-emerald-400">{fmt(savings.annualSavings)}</span>{' '}
              {t('savingsPerYear')}
            </p>
            {savings.paybackYears !== null && (
              <p className="mt-1 text-sm text-cool-600 dark:text-cool-300">
                {t('paybackIntro')}{' '}
                <span className="font-bold text-cool-800 dark:text-cool-100">
                  ~{savings.paybackYears.toFixed(1)} {t('paybackYears')}
                </span>{' '}
                {t('paybackInSavings')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white p-4 dark:bg-cool-950">
      <div className="mb-1 flex items-center gap-1.5 text-cool-400 dark:text-cool-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-base font-bold text-cool-800 dark:text-cool-100">{value}</p>
    </div>
  );
}

type SortKey = 'score' | 'price_low' | 'price_high' | 'power_low' | 'energy_high';

function ComparisonSection({
  tonnageFilter,
  onTonnageFilter,
  brandFilter,
  onBrandFilter,
  searchQuery,
  onSearchQuery,
  calculatedTonnage,
  electricity,
  onElectricity,
  lang,
  t,
  onBack,
}: {
  tonnageFilter: number | 'all';
  onTonnageFilter: (t: number | 'all') => void;
  brandFilter: string;
  onBrandFilter: (b: string) => void;
  searchQuery: string;
  onSearchQuery: (q: string) => void;
  calculatedTonnage: number | null;
  electricity: ElectricitySettings;
  onElectricity: (e: ElectricitySettings) => void;
  lang: Language;
  t: TFunc;
  onBack: () => void;
}) {
  const [view, setView] = useState<'table' | 'cards'>('cards');
  const [sort, setSort] = useState<SortKey>('score');

  const brands = useMemo(
    () => Array.from(new Set(AC_MODELS.map((m) => m.brand))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const list = AC_MODELS.filter((m) => {
      if (tonnageFilter !== 'all' && m.tonnage !== tonnageFilter) return false;
      if (brandFilter !== 'all' && m.brand !== brandFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!m.brand.toLowerCase().includes(q) && !m.modelName.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case 'score':
        sorted.sort((a, b) => b.starScore - a.starScore);
        break;
      case 'price_low':
        sorted.sort((a, b) => a.estimatedPrice - b.estimatedPrice);
        break;
      case 'price_high':
        sorted.sort((a, b) => b.estimatedPrice - a.estimatedPrice);
        break;
      case 'power_low':
        sorted.sort((a, b) => a.powerConsumptionKwhYear - b.powerConsumptionKwhYear);
        break;
      case 'energy_high':
        sorted.sort((a, b) => b.energyRating - a.energyRating);
        break;
    }
    return sorted;
  }, [tonnageFilter, brandFilter, searchQuery, sort]);

  const hasActiveFilters = tonnageFilter !== 'all' || brandFilter !== 'all' || searchQuery.trim() !== '';

  const clearFilters = () => {
    onTonnageFilter('all');
    onBrandFilter('all');
    onSearchQuery('');
  };

  return (
    <div className="mt-6 sm:mt-8">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={onBack} className="btn-secondary self-start">
          <ArrowLeft className="h-4 w-4" />
          {t('backToResults')}
        </button>
        {calculatedTonnage !== null && tonnageFilter === calculatedTonnage && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-cool-50 px-3 py-2 text-sm font-medium text-cool-700 dark:bg-cool-900 dark:text-cool-200">
            <CheckCircle2 className="h-4 w-4 text-cool-600 dark:text-cool-400" />
            {t('filteredTo')} {calculatedTonnage.toFixed(1)} {t('ton')}
          </div>
        )}
      </div>

      <ElectricitySettingsPanel electricity={electricity} onElectricity={onElectricity} t={t} />

      <div className="card mb-4 p-4 sm:mb-6 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-row sm:items-end sm:gap-4">
          <div className="sm:flex-1">
            <label className="label-text">
              <Search className="mr-1 inline h-4 w-4 align-text-bottom text-cool-500" />
              {t('searchPlaceholder')}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQuery(e.target.value)}
              placeholder={t('searchExample')}
              className="input-field"
            />
          </div>
          <div className="sm:w-40">
            <label className="label-text">
              <Filter className="mr-1 inline h-4 w-4 align-text-bottom text-cool-500" />
              {t('tonnage')}
            </label>
            <select
              value={tonnageFilter}
              onChange={(e) =>
                onTonnageFilter(e.target.value === 'all' ? 'all' : parseFloat(e.target.value))
              }
              className="input-field"
            >
              <option value="all">{t('allTonnages')}</option>
              {STANDARD_TONNAGES.map((tn) => (
                <option key={tn} value={tn}>
                  {tn.toFixed(1)} {t('ton')}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-40">
            <label className="label-text">
              <Filter className="mr-1 inline h-4 w-4 align-text-bottom text-cool-500" />
              {t('brand')}
            </label>
            <select
              value={brandFilter}
              onChange={(e) => onBrandFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">{t('allBrands')}</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-44">
            <label className="label-text">{t('sortBy')}</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="input-field"
            >
              <option value="score">{t('sortScore')}</option>
              <option value="price_low">{t('sortPriceLow')}</option>
              <option value="price_high">{t('sortPriceHigh')}</option>
              <option value="power_low">{t('sortPowerLow')}</option>
              <option value="energy_high">{t('sortEnergyHigh')}</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-cool-200 bg-cool-50 p-1 dark:border-cool-700 dark:bg-cool-900">
            <button
              onClick={() => setView('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:py-1.5 ${
                view === 'cards'
                  ? 'bg-white text-cool-700 shadow-sm dark:bg-cool-950 dark:text-cool-100'
                  : 'text-cool-500 hover:text-cool-700'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t('cards')}
            </button>
            <button
              onClick={() => setView('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:py-1.5 ${
                view === 'table'
                  ? 'bg-white text-cool-700 shadow-sm dark:bg-cool-950 dark:text-cool-100'
                  : 'text-cool-500 hover:text-cool-700'
              }`}
            >
              <Rows3 className="h-3.5 w-3.5" />
              {t('table')}
            </button>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-cool-600 transition-colors hover:bg-cool-50 dark:text-cool-300 dark:hover:bg-cool-900 sm:py-1.5"
            >
              <X className="h-3.5 w-3.5" />
              {t('clearFilters')}
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-8 text-center sm:p-12">
          <Search className="mb-3 h-10 w-10 text-cool-300" />
          <p className="text-sm font-semibold text-cool-600 dark:text-cool-300">{t('noMatch')}</p>
          <button onClick={clearFilters} className="btn-secondary mt-4">
            <RotateCcw className="h-4 w-4" />
            {t('resetFilters')}
          </button>
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {filtered.map((m) => (
            <ModelCard key={m.id} model={m} electricity={electricity} t={t} />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead>
                <tr className="border-b border-cool-100 bg-cool-50 dark:border-cool-800 dark:bg-cool-900">
                  <Th>{t('thBrandModel')}</Th>
                  <Th className="text-center">{t('thTonnage')}</Th>
                  <Th className="text-center">{t('thEnergy')}</Th>
                  <Th className="text-right">{t('thPower')}</Th>
                  <Th>{t('thFeature')}</Th>
                  <Th>{t('thReview')}</Th>
                  <Th className="text-center">{t('thScore')}</Th>
                  <Th className="text-right">{t('thPrice')}</Th>
                  <Th className="text-right">{t('thYearlyBill')}</Th>
                  <Th className="text-right">{t('thMonthlyBill')}</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <ModelRow key={m.id} model={m} electricity={electricity} t={t} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-3 text-center text-xs text-cool-400 dark:text-cool-500">
        {t('showingModels')} {filtered.length} {t('ofModels')} {AC_MODELS.length} {t('modelsDot')}
      </p>
    </div>
  );
}

function ModelCard({
  model,
  electricity,
  t,
}: {
  model: ACModel;
  electricity: ElectricitySettings;
  t: TFunc;
}) {
  const bill = computeBill(model, electricity);
  return (
    <div className="card flex flex-col p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-cool-800 dark:text-cool-100">{model.brand}</p>
          <p className="text-xs text-cool-500 dark:text-cool-400">{model.modelName}</p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-lg bg-cool-100 px-2.5 py-1 text-xs font-semibold text-cool-700 dark:bg-cool-900 dark:text-cool-200">
          {model.tonnage.toFixed(1)} {t('ton')}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < model.energyRating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-cool-200 dark:text-cool-700'
              }`}
            />
          ))}
        </div>
        <span className="inline-flex items-center gap-1 rounded-lg bg-cool-50 px-2 py-0.5 dark:bg-cool-900">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-cool-800 dark:text-cool-100">
            {model.starScore.toFixed(1)}
          </span>
        </span>
      </div>

      <p className="mt-3 text-xs text-cool-600 dark:text-cool-300">{model.keyFeature}</p>

      <div className="mt-3 space-y-1">
        <p className="flex items-start gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <ThumbsUp className="mt-0.5 h-3 w-3 shrink-0" />
          {model.pros}
        </p>
        <p className="flex items-start gap-1.5 text-xs text-red-500 dark:text-red-400">
          <ThumbsDown className="mt-0.5 h-3 w-3 shrink-0" />
          {model.cons}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="inline-flex items-center gap-1 text-xs text-cool-500 dark:text-cool-400">
          <Zap className="h-3.5 w-3.5 text-cool-400" />
          {model.powerConsumptionKwhYear.toLocaleString()} kWh/yr
        </span>
        <span className="text-lg font-bold text-cool-800 dark:text-cool-100">
          {electricity.currencySymbol}
          {model.estimatedPrice.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-cool-100 pt-3 dark:border-cool-800">
        <div className="rounded-lg bg-cool-50 px-2.5 py-2 dark:bg-cool-900">
          <p className="flex items-center gap-1 text-[10px] font-medium text-cool-400 dark:text-cool-500">
            <Receipt className="h-3 w-3" /> {t('yearlyBill')}
          </p>
          <p className="text-sm font-bold text-cool-800 dark:text-cool-100">
            {electricity.currencySymbol}
            {bill.annualCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-lg bg-cool-50 px-2.5 py-2 dark:bg-cool-900">
          <p className="flex items-center gap-1 text-[10px] font-medium text-cool-400 dark:text-cool-500">
            <Calendar className="h-3 w-3" /> {t('monthlyBill')}
          </p>
          <p className="text-sm font-bold text-cool-800 dark:text-cool-100">
            {electricity.currencySymbol}
            {bill.monthlyCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ModelRow({
  model,
  electricity,
  t,
}: {
  model: ACModel;
  electricity: ElectricitySettings;
  t: TFunc;
}) {
  const bill = computeBill(model, electricity);
  return (
    <tr className="border-b border-cool-50 transition-colors last:border-0 hover:bg-cool-50/60 dark:border-cool-900 dark:hover:bg-cool-900/50">
      <td className="px-4 py-4">
        <p className="font-semibold text-cool-800 dark:text-cool-100">{model.brand}</p>
        <p className="text-xs text-cool-500 dark:text-cool-400">{model.modelName}</p>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="inline-flex items-center rounded-lg bg-cool-100 px-2.5 py-1 text-xs font-semibold text-cool-700 dark:bg-cool-900 dark:text-cool-200">
          {model.tonnage.toFixed(1)} {t('ton')}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < model.energyRating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-cool-200 dark:text-cool-700'
              }`}
            />
          ))}
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="inline-flex items-center gap-1 text-cool-600 dark:text-cool-300">
          <Zap className="h-3.5 w-3.5 text-cool-400" />
          {model.powerConsumptionKwhYear.toLocaleString()}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-xs text-cool-600 dark:text-cool-300">{model.keyFeature}</span>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1">
          <p className="flex items-start gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <ThumbsUp className="mt-0.5 h-3 w-3 shrink-0" />
            {model.pros}
          </p>
          <p className="flex items-start gap-1.5 text-xs text-red-500 dark:text-red-400">
            <ThumbsDown className="mt-0.5 h-3 w-3 shrink-0" />
            {model.cons}
          </p>
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <div className="inline-flex items-center gap-1 rounded-lg bg-cool-50 px-2.5 py-1 dark:bg-cool-900">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-cool-800 dark:text-cool-100">
            {model.starScore.toFixed(1)}
          </span>
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="font-semibold text-cool-800 dark:text-cool-100">
          {electricity.currencySymbol}
          {model.estimatedPrice.toLocaleString('en-IN')}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="text-sm font-semibold text-cool-700 dark:text-cool-200">
          {electricity.currencySymbol}
          {bill.annualCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="text-sm font-semibold text-cool-700 dark:text-cool-200">
          {electricity.currencySymbol}
          {bill.monthlyCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </span>
      </td>
    </tr>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-cool-500 dark:text-cool-400 ${className}`}
    >
      {children}
    </th>
  );
}

function Footer({ t }: { t: TFunc }) {
  return (
    <footer className="border-t border-cool-100 bg-white/60 py-5 dark:border-cool-800 dark:bg-cool-950/60 sm:py-6">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-cool-400 dark:text-cool-500 sm:px-6 lg:px-8">
        {t('footer')}
      </div>
    </footer>
  );
}

export default App;

export type SpeedUnit = "mph" | "kph";

export type TireInputMode = "diameter_in" | "metric" | "revs_per_mile";

export interface GearRatios {
  g1: number;
  g2: number;
  g3: number;
  g4: number;
  g5: number;
  g6: number;
  g7: number;
  g8: number;
  reverse: number;
}

export interface TransmissionPreset {
  id: string;
  slug: string;
  name: string;
  ratios: GearRatios;
  notes?: string;
  examples?: string;
}

export interface TireState {
  mode: TireInputMode;
  diameterIn: number;
  widthMm: number;
  aspect: number;
  rimIn: number;
  revsPerMile: number;
}

export interface RpmSettings {
  idle: number;
  cruise: number;
  redline: number;
}

/** Multiplies trans × axle (e.g. transfer case high/low). Off = 1.0. */
export interface TransferCaseState {
  enabled: boolean;
  /** Reduction vs output shaft (1.0 = direct / typical high range) */
  ratio: number;
}

export interface SetupState {
  presetId: string;
  customRatios: GearRatios | null;
  finalDrive: number;
  /** Optional 4×4 / off-road: overall × trans × axle × transferCase.ratio */
  transferCase: TransferCaseState;
  tire: TireState;
  rpm: RpmSettings;
  /** RPM in lower gear used for upshift % / RPM-after table (e.g. 6500 vs 9000). Defaults to redline. */
  shiftReferenceRpm: number;
  speedUnit: SpeedUnit;
  precision: number;
  showReverse: boolean;
}

export interface GearCalcRow {
  gear: number | "R";
  transRatio: number;
  overall: number;
  distancePerRevIn: number;
  distancePerRevFt: number;
  distancePerRevM: number;
}

export interface DrivetrainResult {
  tireDiameterIn: number;
  circumferenceIn: number;
  revsPerMile: number;
  ratioSpread: number;
  /** Effective multiplier applied (1 if transfer case off) */
  transferCaseMultiplier: number;
  rows: GearCalcRow[];
  firstOverall: number;
  eighthOverall: number;
  cruiseRpmAt70: number;
  cruiseRpmAt80: number;
  redlineSpeedFirstMph: number;
  redlineSpeedEighthMph: number;
  shiftDrops: { from: number; to: number; pctDrop: number; rpmAfter: number }[];
}

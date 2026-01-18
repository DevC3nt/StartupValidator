
export interface IdeaInput {
  title: string;
  description: string;
  targetAudience: string;
  revenueModel: string;
}

export interface RiskFactor {
  category: string;
  severity: number; // 1-10
  description: string;
  mitigationFailures: string;
}

export interface MarketAssumption {
  assumption: string;
  realityCheck: string;
  fatalFlawProbability: number; // 0-100
}

export interface CompetitorAnalysis {
  name: string;
  strength: string;
  advantage: string;
  whyYouMightLose: string;
}

export interface RoadmapStep {
  phase: string;
  actions: string[];
  survivalMetric: string;
}

export interface ValidationResult {
  overallVerdict: string;
  brutalHonestyScore: number; // 0-100 (Higher = more likely to fail as described)
  breakdown: string;
  risks: RiskFactor[];
  assumptions: MarketAssumption[];
  competitors: CompetitorAnalysis[];
  revenueStressTest: {
    scenarios: string;
    unitEconomicsWarning: string;
  };
  roadmap: RoadmapStep[];
}

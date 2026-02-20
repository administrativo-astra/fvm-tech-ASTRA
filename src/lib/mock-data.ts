export interface WeekData {
  week: string;
  spent: number;
  reach: number;
  impressions: number;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  visits: number;
  followUp: number;
  sales: number;
}

export interface MonthData {
  month: string;
  weeks: WeekData[];
}

export const mockData: MonthData[] = [
  {
    month: "Janeiro",
    weeks: [
      {
        week: "Semana 1",
        spent: 205.38,
        reach: 25246,
        impressions: 35139,
        clicks: 138,
        leads: 32,
        qualifiedLeads: 8,
        visits: 3,
        followUp: 1,
        sales: 0,
      },
      {
        week: "Semana 2",
        spent: 192.72,
        reach: 20649,
        impressions: 27379,
        clicks: 112,
        leads: 25,
        qualifiedLeads: 6,
        visits: 2,
        followUp: 1,
        sales: 0,
      },
      {
        week: "Semana 3",
        spent: 101.56,
        reach: 18000,
        impressions: 13242,
        clicks: 83,
        leads: 16,
        qualifiedLeads: 4,
        visits: 1,
        followUp: 0,
        sales: 0,
      },
      {
        week: "Semana 4",
        spent: 124.50,
        reach: 5149,
        impressions: 15312,
        clicks: 42,
        leads: 9,
        qualifiedLeads: 2,
        visits: 0,
        followUp: 0,
        sales: 0,
      },
    ],
  },
  {
    month: "Fevereiro",
    weeks: [
      {
        week: "Semana 1",
        spent: 136.54,
        reach: 11419,
        impressions: 14176,
        clicks: 72,
        leads: 11,
        qualifiedLeads: 3,
        visits: 1,
        followUp: 0,
        sales: 0,
      },
      {
        week: "Semana 2",
        spent: 77.90,
        reach: 5759,
        impressions: 8297,
        clicks: 38,
        leads: 7,
        qualifiedLeads: 2,
        visits: 1,
        followUp: 0,
        sales: 0,
      },
      {
        week: "Semana 3",
        spent: 3.00,
        reach: 0,
        impressions: 2000,
        clicks: 0,
        leads: 0,
        qualifiedLeads: 0,
        visits: 0,
        followUp: 0,
        sales: 0,
      },
      {
        week: "Semana 4",
        spent: 0,
        reach: 0,
        impressions: 0,
        clicks: 0,
        leads: 0,
        qualifiedLeads: 0,
        visits: 0,
        followUp: 0,
        sales: 0,
      },
    ],
  },
  {
    month: "Março",
    weeks: [
      {
        week: "Semana 1",
        spent: 320.00,
        reach: 32000,
        impressions: 45000,
        clicks: 180,
        leads: 42,
        qualifiedLeads: 12,
        visits: 5,
        followUp: 3,
        sales: 2,
      },
      {
        week: "Semana 2",
        spent: 280.00,
        reach: 28500,
        impressions: 39000,
        clicks: 155,
        leads: 38,
        qualifiedLeads: 10,
        visits: 4,
        followUp: 2,
        sales: 1,
      },
      {
        week: "Semana 3",
        spent: 350.00,
        reach: 35000,
        impressions: 52000,
        clicks: 210,
        leads: 50,
        qualifiedLeads: 15,
        visits: 6,
        followUp: 4,
        sales: 3,
      },
      {
        week: "Semana 4",
        spent: 290.00,
        reach: 26000,
        impressions: 41000,
        clicks: 165,
        leads: 35,
        qualifiedLeads: 9,
        visits: 3,
        followUp: 2,
        sales: 1,
      },
    ],
  },
];

export function getMonthTotals(month: MonthData) {
  return month.weeks.reduce(
    (acc, week) => ({
      spent: acc.spent + week.spent,
      reach: acc.reach + week.reach,
      impressions: acc.impressions + week.impressions,
      clicks: acc.clicks + week.clicks,
      leads: acc.leads + week.leads,
      qualifiedLeads: acc.qualifiedLeads + week.qualifiedLeads,
      visits: acc.visits + week.visits,
      followUp: acc.followUp + week.followUp,
      sales: acc.sales + week.sales,
    }),
    {
      spent: 0,
      reach: 0,
      impressions: 0,
      clicks: 0,
      leads: 0,
      qualifiedLeads: 0,
      visits: 0,
      followUp: 0,
      sales: 0,
    }
  );
}

// UTM Mock Data
export interface UtmEntryData {
  name: string;
  leads: number;
  qualifiedLeads: number;
  visits: number;
  sales: number;
  interactions: number;
}

export interface UtmMonthData {
  campaigns: UtmEntryData[];
  adsets: UtmEntryData[];
  creatives: UtmEntryData[];
}

export const mockUtmData: Record<string, UtmMonthData> = {
  Janeiro: {
    campaigns: [
      { name: "[01/25][LEADS][PUB INTERESSES / PUB RMKT]", leads: 28, qualifiedLeads: 8, visits: 3, sales: 0, interactions: 301 },
      { name: "[01/25][REMARKETING <> BLACK NOVEMBER]", leads: 18, qualifiedLeads: 5, visits: 2, sales: 0, interactions: 141 },
      { name: "[TDF][01/25][LEADS <> FORMS SIMPLES]", leads: 22, qualifiedLeads: 5, visits: 1, sales: 0, interactions: 216 },
      { name: "[01/25][LEADS][LOOKALIKE MATRICULADOS]", leads: 14, qualifiedLeads: 2, visits: 0, sales: 0, interactions: 108 },
    ],
    adsets: [
      { name: "[PUB INTERESSES EDU <> SEGMENTADO RENDA + CONSCIÊNCIA]", leads: 25, qualifiedLeads: 7, visits: 2, sales: 0, interactions: 233 },
      { name: "[RMKT <> VISITANTES SITE 30D]", leads: 15, qualifiedLeads: 4, visits: 2, sales: 0, interactions: 159 },
      { name: "[LOOKALIKE 1% <> MATRICULADOS 2024]", leads: 20, qualifiedLeads: 5, visits: 1, sales: 0, interactions: 175 },
      { name: "[INTERESSES <> PAIS 25-45 CLASSE AB]", leads: 12, qualifiedLeads: 3, visits: 1, sales: 0, interactions: 104 },
      { name: "[BROAD <> REGIÃO METROPOLITANA]", leads: 10, qualifiedLeads: 1, visits: 0, sales: 0, interactions: 95 },
    ],
    creatives: [
      { name: "[AD02][Enquanto Você Está Gastando Seu Dinheiro]", leads: 22, qualifiedLeads: 6, visits: 2, sales: 0, interactions: 163 },
      { name: "[AD01][Seu Filho Merece o Melhor Ensino]", leads: 18, qualifiedLeads: 5, visits: 2, sales: 0, interactions: 145 },
      { name: "[AD05][Vídeo Depoimento Mãe Aluno]", leads: 16, qualifiedLeads: 4, visits: 1, sales: 0, interactions: 138 },
      { name: "[AD03][Carrossel Infraestrutura]", leads: 14, qualifiedLeads: 3, visits: 1, sales: 0, interactions: 120 },
      { name: "[AD04][Matrícula Antecipada 2025]", leads: 12, qualifiedLeads: 2, visits: 0, sales: 0, interactions: 100 },
    ],
  },
  Fevereiro: {
    campaigns: [
      { name: "[02/25][LEADS][PUB INTERESSES / PUB RMKT]", leads: 8, qualifiedLeads: 2, visits: 1, sales: 0, interactions: 85 },
      { name: "[02/25][REMARKETING <> VISITANTES]", leads: 5, qualifiedLeads: 2, visits: 1, sales: 0, interactions: 52 },
      { name: "[TDF][02/25][LEADS <> FORMS]", leads: 5, qualifiedLeads: 1, visits: 0, sales: 0, interactions: 48 },
    ],
    adsets: [
      { name: "[PUB INTERESSES EDU <> SEGMENTADO]", leads: 7, qualifiedLeads: 2, visits: 1, sales: 0, interactions: 68 },
      { name: "[RMKT <> VISITANTES SITE]", leads: 5, qualifiedLeads: 2, visits: 1, sales: 0, interactions: 55 },
      { name: "[BROAD <> REGIÃO]", leads: 6, qualifiedLeads: 1, visits: 0, sales: 0, interactions: 62 },
    ],
    creatives: [
      { name: "[AD02][Enquanto Você Está Gastando]", leads: 7, qualifiedLeads: 2, visits: 1, sales: 0, interactions: 60 },
      { name: "[AD01][Seu Filho Merece]", leads: 6, qualifiedLeads: 2, visits: 1, sales: 0, interactions: 55 },
      { name: "[AD06][Stories Dia a Dia]", leads: 5, qualifiedLeads: 1, visits: 0, sales: 0, interactions: 70 },
    ],
  },
  "Março": {
    campaigns: [
      { name: "[03/25][LEADS][PUB INTERESSES / PUB RMKT]", leads: 62, qualifiedLeads: 18, visits: 8, sales: 4, interactions: 520 },
      { name: "[03/25][REMARKETING <> MARÇO ABERTO]", leads: 35, qualifiedLeads: 12, visits: 5, sales: 2, interactions: 310 },
      { name: "[TDF][03/25][LEADS <> FORMS SIMPLES]", leads: 38, qualifiedLeads: 10, visits: 3, sales: 1, interactions: 285 },
      { name: "[03 <> OUTDOOR / ESCOLA]", leads: 30, qualifiedLeads: 6, visits: 2, sales: 0, interactions: 233 },
    ],
    adsets: [
      { name: "[PUB INTERESSES EDU <> SEGMENTADO RENDA + CONSCIÊNCIA][REGIÕES ESPECÍFICAS]", leads: 48, qualifiedLeads: 15, visits: 6, sales: 3, interactions: 380 },
      { name: "[RMKT <> VISITANTES SITE 30D + ENGAJAMENTO IG]", leads: 32, qualifiedLeads: 10, visits: 4, sales: 2, interactions: 275 },
      { name: "[LOOKALIKE 1% <> MATRICULADOS 2024]", leads: 40, qualifiedLeads: 11, visits: 5, sales: 1, interactions: 320 },
      { name: "[INTERESSES <> PAIS 25-45 CLASSE AB]", leads: 25, qualifiedLeads: 6, visits: 2, sales: 1, interactions: 195 },
      { name: "[BROAD <> REGIÃO METROPOLITANA EXPANDIDO]", leads: 20, qualifiedLeads: 4, visits: 1, sales: 0, interactions: 178 },
    ],
    creatives: [
      { name: "[AD02][Enquanto Você Está Gastando Seu Dinheiro]", leads: 42, qualifiedLeads: 14, visits: 6, sales: 3, interactions: 350 },
      { name: "[AD07][Tour Virtual 360° Escola]", leads: 35, qualifiedLeads: 10, visits: 5, sales: 2, interactions: 295 },
      { name: "[AD01][Seu Filho Merece o Melhor Ensino]", leads: 30, qualifiedLeads: 8, visits: 3, sales: 1, interactions: 245 },
      { name: "[AD05][Vídeo Depoimento Mãe Aluno]", leads: 28, qualifiedLeads: 7, visits: 2, sales: 1, interactions: 220 },
      { name: "[AD03][Carrossel Infraestrutura Premium]", leads: 18, qualifiedLeads: 4, visits: 1, sales: 0, interactions: 150 },
      { name: "[AD08][Reels Bastidores Aula]", leads: 12, qualifiedLeads: 3, visits: 1, sales: 0, interactions: 88 },
    ],
  },
};

export function getUtmAnalysis(month: string, metric: "leads" | "qualifiedLeads" | "visits" | "sales" | "interactions") {
  const data = mockUtmData[month];
  if (!data) return { campaigns: [], adsets: [], creatives: [] };

  function toEntries(items: UtmEntryData[]) {
    const total = items.reduce((s, i) => s + i[metric], 0);
    return items
      .map((i) => ({
        name: i.name,
        value: i[metric],
        percentage: total > 0 ? (i[metric] / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }

  return {
    campaigns: toEntries(data.campaigns),
    adsets: toEntries(data.adsets),
    creatives: toEntries(data.creatives),
  };
}

export function getUtmTotal(month: string, metric: "leads" | "qualifiedLeads" | "visits" | "sales" | "interactions") {
  const data = mockUtmData[month];
  if (!data) return 0;
  const all = [...data.campaigns];
  return all.reduce((s, i) => s + i[metric], 0);
}

export function getMonthlyEvolution() {
  return mockData.map((m) => {
    const t = getMonthTotals(m);
    return {
      name: m.month,
      spent: t.spent,
      reach: t.reach,
      impressions: t.impressions,
      clicks: t.clicks,
      leads: t.leads,
      qualifiedLeads: t.qualifiedLeads,
      visits: t.visits,
      followUp: t.followUp,
      sales: t.sales,
    };
  });
}

export function getMonthComparison(currentIndex: number) {
  if (currentIndex <= 0) return null;
  const current = getMonthTotals(mockData[currentIndex]);
  const previous = getMonthTotals(mockData[currentIndex - 1]);

  function pctChange(curr: number, prev: number) {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  }

  return {
    spent: pctChange(current.spent, previous.spent),
    reach: pctChange(current.reach, previous.reach),
    impressions: pctChange(current.impressions, previous.impressions),
    clicks: pctChange(current.clicks, previous.clicks),
    leads: pctChange(current.leads, previous.leads),
    qualifiedLeads: pctChange(current.qualifiedLeads, previous.qualifiedLeads),
    visits: pctChange(current.visits, previous.visits),
    followUp: pctChange(current.followUp, previous.followUp),
    sales: pctChange(current.sales, previous.sales),
  };
}

export function getWeeklyEvolution() {
  const result: { name: string; leads: number; qualifiedLeads: number; visits: number; sales: number; spent: number }[] = [];
  mockData.forEach((m) => {
    m.weeks.forEach((w) => {
      result.push({
        name: `${m.month.slice(0, 3)} ${w.week.replace("Semana ", "S")}`,
        leads: w.leads,
        qualifiedLeads: w.qualifiedLeads,
        visits: w.visits,
        sales: w.sales,
        spent: w.spent,
      });
    });
  });
  return result;
}

export function getAllTotals() {
  const allWeeks = mockData.flatMap((m) => m.weeks);
  return allWeeks.reduce(
    (acc, week) => ({
      spent: acc.spent + week.spent,
      reach: acc.reach + week.reach,
      impressions: acc.impressions + week.impressions,
      clicks: acc.clicks + week.clicks,
      leads: acc.leads + week.leads,
      qualifiedLeads: acc.qualifiedLeads + week.qualifiedLeads,
      visits: acc.visits + week.visits,
      followUp: acc.followUp + week.followUp,
      sales: acc.sales + week.sales,
    }),
    {
      spent: 0,
      reach: 0,
      impressions: 0,
      clicks: 0,
      leads: 0,
      qualifiedLeads: 0,
      visits: 0,
      followUp: 0,
      sales: 0,
    }
  );
}

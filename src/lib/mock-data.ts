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

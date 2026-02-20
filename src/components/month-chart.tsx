"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface MonthChartProps {
  data: ChartDataPoint[];
  lines: {
    key: string;
    label: string;
    color: string;
  }[];
  title: string;
  type?: "area" | "bar";
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl bg-[#0a0a0a]/95 border border-white/10 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-[11px] font-semibold text-white/60 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/50">{entry.name}:</span>
          <span className="font-bold text-white/90">
            {typeof entry.value === "number"
              ? entry.value.toLocaleString("pt-BR")
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MonthChart({ data, lines, title, type = "area" }: MonthChartProps) {
  if (type === "bar") {
    return (
      <div className="rounded-2xl glass-strong p-6">
        <h3 className="text-sm font-semibold text-white/60 mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}
            />
            {lines.map((line) => (
              <Bar
                key={line.key}
                dataKey={line.key}
                name={line.label}
                fill={line.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-strong p-6">
      <h3 className="text-sm font-semibold text-white/60 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            {lines.map((line) => (
              <linearGradient
                key={line.key}
                id={`gradient-${line.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={line.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={line.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}
          />
          {lines.map((line) => (
            <Area
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={2}
              fill={`url(#gradient-${line.key})`}
              dot={{ r: 3, fill: line.color, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: line.color, strokeWidth: 2, stroke: "#0a0a0a" }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

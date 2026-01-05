"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface PerformanceDataPoint {
  name: string;
  value: number;
}

interface AllocationDataPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  title?: string;
}

interface AllocationChartProps {
  data: AllocationDataPoint[];
  title?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/90 px-4 py-3 shadow-xl backdrop-blur-lg">
        <p className="text-xs uppercase tracking-wider text-white/60">{label}</p>
        <p className="mt-1 text-lg font-semibold text-white">
          {payload[0].value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </div>
    );
  }
  return null;
};

export function PerformanceChart({ data, title = "Performance" }: PerformanceChartProps) {
  return (
    <div className="chart-container">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="badge badge-success">+12.5%</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            tickFormatter={(value) =>
              value.toLocaleString("pt-BR", {
                notation: "compact",
                compactDisplay: "short",
              })
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={2}
            fill="url(#colorValue)"
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AllocationChart({ data, title = "Alocação" }: AllocationChartProps) {
  return (
    <div className="chart-container">
      <h3 className="mb-6 font-display text-lg text-white">{title}</h3>
      <div className="flex items-center gap-8">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-white/70">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-white">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sample data for demonstration
export const samplePerformanceData: PerformanceDataPoint[] = [
  { name: "Jan", value: 100000 },
  { name: "Fev", value: 115000 },
  { name: "Mar", value: 108000 },
  { name: "Abr", value: 132000 },
  { name: "Mai", value: 145000 },
  { name: "Jun", value: 168000 },
  { name: "Jul", value: 182000 },
  { name: "Ago", value: 195000 },
];

export const sampleAllocationData: AllocationDataPoint[] = [
  { name: "Renda Fixa", value: 45, color: "#ffffff" },
  { name: "Ações", value: 25, color: "rgba(255,255,255,0.7)" },
  { name: "FIIs", value: 20, color: "rgba(255,255,255,0.4)" },
  { name: "Criptomoedas", value: 10, color: "rgba(255,255,255,0.2)" },
];

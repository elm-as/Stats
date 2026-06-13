import ReactPlotly from 'react-plotly.js';
const Plot = (ReactPlotly as any).default || ReactPlotly;
import type { Layout, Config, Data } from 'plotly.js';
import { useMemo } from 'react';

// ── Thème dark partagé pour tous les graphes scientifiques ──
export const DARK_TEMPLATE: Partial<Layout> = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: {
    family: 'Inter, system-ui, sans-serif',
    color: '#c5ccdd',
    size: 12,
  },
  xaxis: {
    gridcolor: 'rgba(255,255,255,0.05)',
    zerolinecolor: 'rgba(255,255,255,0.15)',
    linecolor: 'rgba(255,255,255,0.15)',
    tickfont: { color: '#a3adc8', size: 11 },
    title: { font: { color: '#dfe3ee', size: 12 } },
  },
  yaxis: {
    gridcolor: 'rgba(255,255,255,0.05)',
    zerolinecolor: 'rgba(255,255,255,0.15)',
    linecolor: 'rgba(255,255,255,0.15)',
    tickfont: { color: '#a3adc8', size: 11 },
    title: { font: { color: '#dfe3ee', size: 12 } },
  },
  legend: {
    bgcolor: 'rgba(20,24,54,0.4)',
    bordercolor: 'rgba(255,255,255,0.1)',
    borderwidth: 1,
    font: { color: '#c5ccdd' },
  },
  margin: { l: 60, r: 20, t: 40, b: 50 },
  hoverlabel: {
    bgcolor: '#141836',
    bordercolor: '#06b6d4',
    font: { family: 'Inter, system-ui, sans-serif', color: '#dfe3ee' },
  },
};

export const DEFAULT_CONFIG: Partial<Config> = {
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
  toImageButtonOptions: {
    format: 'png',
    height: 600,
    width: 1000,
    scale: 2,
  },
};

// Palette scientifique (proche viridis/plasma sans surcharge)
export const SCI_COLORS = [
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#6366f1', // indigo
];

export const COLORSCALE_VIRIDIS = 'Viridis';
export const COLORSCALE_RDBU = 'RdBu';

interface PlotlyChartProps {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  height?: number | string;
  className?: string;
}

/** Wrapper Plotly avec thème dark uniforme. */
export function PlotlyChart({ data, layout = {}, config = {}, height = 400, className = '' }: PlotlyChartProps) {
  const merged = useMemo<Partial<Layout>>(() => ({
    ...DARK_TEMPLATE,
    ...layout,
    xaxis: { ...DARK_TEMPLATE.xaxis, ...(layout.xaxis || {}) },
    yaxis: { ...DARK_TEMPLATE.yaxis, ...(layout.yaxis || {}) },
    autosize: true,
  }), [layout]);

  const mergedConfig = useMemo<Partial<Config>>(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Plot
        data={data}
        layout={merged}
        config={mergedConfig}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      />
    </div>
  );
}

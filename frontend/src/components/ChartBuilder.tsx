import { useState, useMemo } from 'react';
import { useGetChartDataMutation } from '../store/api';
import type { ChartDataResponse, DataCapabilities } from '../types';
import {
  BarChart3, TrendingUp, PieChart as PieIcon, Maximize2,
  Play, ArrowLeft, Box as BoxIcon, Activity, AreaChart as AreaIcon, GitBranch,
} from 'lucide-react';
import Plot from 'react-plotly.js';
import { DARK_TEMPLATE, DEFAULT_CONFIG, SCI_COLORS } from './viz/PlotlyBase';
import type { Data, Layout } from 'plotly.js';
import { Card, Button, Badge } from './ui';
import { Histogram, BoxPlot, ViolinPlot } from './viz';

const CHART_TYPES = [
  { key: 'line',        label: "Courbe d'évolution",  icon: TrendingUp, desc: 'Tendances temporelles ou continues' },
  { key: 'bar',         label: 'Barres',              icon: BarChart3,  desc: 'Comparaison de catégories' },
  { key: 'stacked_bar', label: 'Barres empilées',     icon: BarChart3,  desc: 'Parts par catégorie' },
  { key: 'pie',         label: 'Diagramme circulaire', icon: PieIcon,   desc: 'Répartition en pourcentages' },
  { key: 'scatter',     label: 'Nuage de points',     icon: Maximize2,  desc: 'Relation entre 2 variables' },
  { key: 'area',        label: 'Aires',               icon: AreaIcon,   desc: 'Évolution avec surface' },
  { key: 'histogram',   label: 'Histogramme',         icon: Activity,   desc: 'Distribution univariée' },
  { key: 'box',         label: 'Boîte à moustaches',  icon: BoxIcon,    desc: "Quartiles et valeurs aberrantes" },
  { key: 'violin',      label: 'Violon',              icon: GitBranch,  desc: 'Densité + boxplot combinés' },
] as const;

type ChartType = (typeof CHART_TYPES)[number]['key'];

const AGGREGATIONS = [
  { key: 'mean',   label: 'Moyenne' },
  { key: 'sum',    label: 'Somme' },
  { key: 'count',  label: 'Compte' },
  { key: 'median', label: 'Médiane' },
  { key: 'min',    label: 'Minimum' },
  { key: 'max',    label: 'Maximum' },
];

interface Props {
  datasetId: string;
  capabilities: DataCapabilities;
  onBack: () => void;
}

export default function ChartBuilder({ datasetId, capabilities, onBack }: Props) {
  const [getChartData, { isLoading }] = useGetChartDataMutation();

  const [chartType, setChartType] = useState<ChartType | null>(null);
  const [xCol, setXCol] = useState('');
  const [yCols, setYCols] = useState<string[]>([]);
  const [groupCol, setGroupCol] = useState('');
  const [aggregation, setAggregation] = useState('mean');
  const [timeGranularity, setTimeGranularity] = useState<'auto' | 'day' | 'month' | 'year'>('auto');
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allCols = [
    ...capabilities.columns.numeric,
    ...capabilities.columns.categorical,
    ...capabilities.columns.temporal,
  ];
  const numericCols = capabilities.columns.numeric;
  const categoricalCols = [...capabilities.columns.categorical, ...capabilities.columns.temporal];
  const temporalCols = capabilities.columns.temporal;

  const isUnivariate = chartType === 'histogram' || chartType === 'box' || chartType === 'violin';

  const handleGenerate = async () => {
    if (!chartType) return;
    setError(null);

    if (chartType === 'pie') {
      if (!xCol) { setError("Sélectionnez une colonne d'étiquettes"); return; }
    } else if (chartType === 'scatter') {
      if (!xCol) { setError('Sélectionnez la variable X'); return; }
      if (yCols.length === 0) { setError('Sélectionnez au moins une variable Y'); return; }
    } else if (isUnivariate) {
      if (yCols.length === 0) { setError('Sélectionnez au moins une variable numérique'); return; }
    } else {
      if (!xCol) { setError("Sélectionnez la variable pour l'axe X"); return; }
      if (yCols.length === 0) { setError('Sélectionnez au moins une variable Y (numérique)'); return; }
    }

    // Pour histogramme/box/violin : pas besoin d'appel backend, on récupère les valeurs brutes
    if (isUnivariate) {
      try {
        const result = await getChartData({
          id: datasetId,
          chart_type: 'raw_values' as any,
          y_cols: yCols,
        }).unwrap();
        if (result.error) setError(result.error);
        else setChartData({ ...result, chart_type: chartType } as any);
      } catch (err: any) {
        setError(err?.data?.error || 'Erreur lors de la récupération des données');
      }
      return;
    }

    try {
      const result = await getChartData({
        id: datasetId,
        chart_type: chartType as any,
        x_col: xCol || undefined,
        y_cols: yCols.length > 0 ? yCols : undefined,
        group_col: groupCol || undefined,
        aggregation: aggregation as any,
        time_granularity:
          xCol && temporalCols.includes(xCol) && chartType !== 'scatter'
            ? timeGranularity
            : undefined,
      }).unwrap();

      if (result.error) setError(result.error);
      else setChartData(result);
    } catch (err: any) {
      setError(err?.data?.error || 'Erreur lors de la génération du graphique');
    }
  };

  const toggleYCol = (col: string) => {
    setYCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };

  // Step 1 : choix du type
  if (!chartType) {
    return (
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Choisir un type de graphique</h3>
          <Button variant="secondary" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Retour
          </Button>
        </div>
        <div className="grid-auto-fit">
          {CHART_TYPES.map((ct) => {
            const Icon = ct.icon;
            return (
              <button
                key={ct.key}
                onClick={() => setChartType(ct.key)}
                className="card text-left p-4 hover:border-accent-500/40 hover:bg-accent-500/5 transition-all focus-ring group"
              >
                <Icon className="w-5 h-5 text-accent-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-strong text-sm font-semibold">{ct.label}</h4>
                <p className="text-xs text-muted mt-1 line-clamp-2">{ct.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 2 : configuration + rendu
  const currentLabel = CHART_TYPES.find((c) => c.key === chartType)?.label;

  return (
    <div className="section">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <h3 className="section-title">{currentLabel}</h3>
          <Badge variant="info">configuration</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => { setChartType(null); setChartData(null); }}>
            Changer de type
          </Button>
          <Button variant="secondary" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Retour
          </Button>
        </div>
      </div>

      <Card>
        <h4 className="text-strong mb-3 text-sm">Configuration</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* X axis */}
          {chartType !== 'pie' && !isUnivariate && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                Axe X {chartType === 'scatter' ? '(numérique)' : '(catégorie/valeur)'} <span className="text-red-400">*</span>
              </label>
              <select value={xCol} onChange={(e) => setXCol(e.target.value)} title="Axe X">
                <option value="">Sélectionner…</option>
                {(chartType === 'scatter' ? numericCols : allCols).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Pie label column */}
          {chartType === 'pie' && (
            <>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                  Étiquettes <span className="text-red-400">*</span>
                </label>
                <select value={xCol} onChange={(e) => setXCol(e.target.value)} title="Étiquettes">
                  <option value="">Sélectionner…</option>
                  {allCols.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                  Valeurs <span className="text-faint normal-case">(vide = comptage)</span>
                </label>
                <select
                  value={yCols[0] || ''}
                  onChange={(e) => setYCols(e.target.value ? [e.target.value] : [])}
                  title="Valeurs"
                >
                  <option value="">Comptage automatique</option>
                  {numericCols.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Y columns (multi-select pour bar/line/area + histogramme/box/violin) */}
          {chartType !== 'pie' && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                {isUnivariate ? 'Variable(s) numérique(s)' : 'Valeur(s) Y'} <span className="text-red-400">*</span>
              </label>
              <div className="max-h-36 overflow-y-auto rounded-lg p-1.5 space-y-0.5 bg-white/[0.02] border border-white/8">
                {numericCols.map((c) => {
                  const checked = yCols.includes(c);
                  return (
                    <label
                      key={c}
                      className={`flex items-center gap-2 text-xs cursor-pointer p-1.5 rounded transition-colors ${
                        checked ? 'bg-accent-500/10 text-accent-200' : 'text-default hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleYCol(c)}
                        className="accent-accent-500 !w-3.5 !h-3.5"
                      />
                      {c}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Agrégation */}
          {chartType !== 'scatter' && !isUnivariate && (chartType !== 'pie' || yCols.length > 0) && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                Agrégation
              </label>
              <select value={aggregation} onChange={(e) => setAggregation(e.target.value)} title="Agrégation">
                {AGGREGATIONS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
              </select>
            </div>
          )}

          {/* Granularité temporelle */}
          {chartType !== 'scatter' && !isUnivariate && xCol && temporalCols.includes(xCol) && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                Granularité temporelle
              </label>
              <select
                value={timeGranularity}
                onChange={(e) => setTimeGranularity(e.target.value as 'auto' | 'day' | 'month' | 'year')}
                title="Granularité"
              >
                <option value="auto">Auto (selon le volume)</option>
                <option value="day">Jour</option>
                <option value="month">Mois</option>
                <option value="year">Année</option>
              </select>
            </div>
          )}

          {/* Group by */}
          {(chartType === 'bar' || chartType === 'stacked_bar' || chartType === 'line') && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                Grouper par <span className="text-faint normal-case">(optionnel)</span>
              </label>
              <select value={groupCol} onChange={(e) => setGroupCol(e.target.value)} title="Grouper par">
                <option value="">Aucun</option>
                {categoricalCols.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>

        {error && (
          <Card variant="flat" className="!bg-red-500/5 !border-red-500/30 mt-4">
            <p className="text-red-300 text-sm">{error}</p>
          </Card>
        )}

        <div className="mt-4">
          <Button onClick={handleGenerate} disabled={isLoading} loading={isLoading} icon={<Play className="w-4 h-4" />}>
            {isLoading ? 'Génération…' : 'Générer le graphique'}
          </Button>
        </div>
      </Card>

      {/* Rendu */}
      {chartData && !chartData.error && (
        <Card>
          <ChartRenderer data={chartData} chartType={chartType} yCols={yCols} />
        </Card>
      )}
    </div>
  );
}

// ── Renderer Plotly ──
function ChartRenderer({
  data,
  chartType,
  yCols,
}: {
  data: ChartDataResponse;
  chartType: ChartType;
  yCols: string[];
}) {
  // Univariate : data brutes
  if (chartType === 'histogram' || chartType === 'box' || chartType === 'violin') {
    const series = yCols.map((col, i) => ({
      name: col,
      values: ((data as any).data?.map((r: any) => r[col]) ?? []).filter((v: any) => typeof v === 'number'),
      color: SCI_COLORS[i % SCI_COLORS.length],
    }));
    if (chartType === 'histogram') return <Histogram series={series} showDensity barmode="overlay" />;
    if (chartType === 'box') return <BoxPlot series={series} showPoints="outliers" />;
    return <ViolinPlot series={series} />;
  }

  return <PlotlyChartFromBackend data={data} />;
}

function PlotlyChartFromBackend({ data }: { data: ChartDataResponse }) {
  const { traces, layout } = useMemo(() => {
    const series = data.series || [];
    const points: any[] = data.data || [];
    const tr: Data[] = [];

    switch (data.chart_type) {
      case 'line':
        series.forEach((s, i) => {
          tr.push({
            x: points.map(p => p.x),
            y: points.map(p => p[s]),
            type: 'scatter',
            mode: 'lines+markers',
            name: s,
            line: { color: SCI_COLORS[i % SCI_COLORS.length], width: 2 },
            marker: { size: 4 },
            hovertemplate: '<b>%{x}</b><br>' + s + ': %{y}<extra></extra>',
          } as Data);
        });
        break;

      case 'bar':
      case 'stacked_bar':
        series.forEach((s, i) => {
          tr.push({
            x: points.map(p => p.x),
            y: points.map(p => p[s]),
            type: 'bar',
            name: s,
            marker: { color: SCI_COLORS[i % SCI_COLORS.length] },
            hovertemplate: '<b>%{x}</b><br>' + s + ': %{y}<extra></extra>',
          } as Data);
        });
        break;

      case 'area':
        series.forEach((s, i) => {
          const color = SCI_COLORS[i % SCI_COLORS.length];
          tr.push({
            x: points.map(p => p.x),
            y: points.map(p => p[s]),
            type: 'scatter',
            mode: 'lines',
            name: s,
            fill: 'tozeroy',
            line: { color, width: 1.5 },
            fillcolor: `${color}40`,
            hovertemplate: '<b>%{x}</b><br>' + s + ': %{y}<extra></extra>',
          } as Data);
        });
        break;

      case 'pie':
        tr.push({
          labels: points.map(p => p.name),
          values: points.map(p => p.value),
          type: 'pie',
          hole: 0.3,
          marker: { colors: points.map((_, i) => SCI_COLORS[i % SCI_COLORS.length]) },
          textinfo: 'label+percent',
          textposition: 'outside',
          hovertemplate: '<b>%{label}</b><br>%{value} (%{percent})<extra></extra>',
        } as Data);
        break;

      case 'scatter':
        tr.push({
          x: points.map(p => p.x),
          y: points.map(p => p.y),
          type: 'scatter',
          mode: 'markers',
          marker: {
            size: 6,
            color: SCI_COLORS[0],
            opacity: 0.65,
            line: { color: 'rgba(255,255,255,0.15)', width: 0.5 },
          },
          hovertemplate: `<b>${data.x_col}: %{x}</b><br>${data.y_col}: %{y}<extra></extra>`,
        } as Data);
        break;
    }

    const lay: Partial<Layout> = {
      ...DARK_TEMPLATE,
      autosize: true,
      barmode: data.chart_type === 'stacked_bar' ? 'stack' : 'group',
      xaxis: data.chart_type === 'pie' ? undefined : {
        ...DARK_TEMPLATE.xaxis,
        title: { text: (data as any).x_col || '', font: { color: '#dfe3ee' } },
        tickangle: -25,
      },
      yaxis: data.chart_type === 'pie' ? undefined : {
        ...DARK_TEMPLATE.yaxis,
        title: { text: (data as any).y_col || '', font: { color: '#dfe3ee' } },
      },
      legend: { orientation: 'h', y: -0.2, font: { color: '#dfe3ee' } },
      showlegend: data.chart_type !== 'scatter' || series.length > 1,
    };

    return { traces: tr, layout: lay };
  }, [data]);

  return (
    <Plot
      data={traces}
      layout={layout}
      config={DEFAULT_CONFIG}
      style={{ width: '100%', height: 440 }}
      useResizeHandler
    />
  );
}

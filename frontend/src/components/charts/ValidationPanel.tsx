import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ValidationData } from "@/lib/api";

interface Props {
  data: ValidationData;
}

function Badge({ value, good }: { value: string; good: boolean | null }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-xs font-semibold",
        good === true && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        good === false && "bg-red-500/15 text-red-600 dark:text-red-400",
        good === null && "bg-zinc-500/10 text-zinc-500",
      )}
    >
      {value}
    </span>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-center py-2">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold font-mono tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function pctFmt(v: number): string {
  return (v * 100).toFixed(2) + "%";
}

function MonteCarloSection({ mc }: { mc: NonNullable<ValidationData["monte_carlo"]> }) {
  const { t } = useTranslation();
  if (mc.error) return <p className="text-sm text-muted-foreground">{mc.error}</p>;
  const sig = mc.p_value_sharpe < 0.05;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold">{t("charts.validation.monteCarlo.title")}</h4>
        <Badge 
          value={sig ? t("charts.validation.monteCarlo.significant") : t("charts.validation.monteCarlo.notSignificant")} 
          good={sig} 
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("charts.validation.monteCarlo.description", { simulations: mc.n_simulations.toLocaleString() })}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-xl border border-border/60 bg-muted/20 p-3">
        <Stat label={t("charts.validation.monteCarlo.actualSharpe")} value={mc.actual_sharpe.toFixed(2)} />
        <Stat label={t("charts.validation.monteCarlo.pValueSharpe")} value={mc.p_value_sharpe.toFixed(4)} sub={sig ? "< 0.05" : ">= 0.05"} />
        <Stat label={t("charts.validation.monteCarlo.simulatedMean")} value={mc.simulated_sharpe_mean.toFixed(2)} sub={`std ${mc.simulated_sharpe_std.toFixed(2)}`} />
        <Stat label={t("charts.validation.monteCarlo.simulated90Range")} value={`[${mc.simulated_sharpe_p5.toFixed(2)}, ${mc.simulated_sharpe_p95.toFixed(2)}]`} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>{t("charts.validation.monteCarlo.p5")}: {mc.simulated_sharpe_p5.toFixed(2)}</span>
          <span>{t("charts.validation.monteCarlo.actual")}: {mc.actual_sharpe.toFixed(2)}</span>
          <span>{t("charts.validation.monteCarlo.p95")}: {mc.simulated_sharpe_p95.toFixed(2)}</span>
        </div>
        <div className="relative h-3 rounded-full bg-muted overflow-hidden">
          <div className="absolute inset-y-0 bg-zinc-300 dark:bg-zinc-600 rounded-full" style={barStyle(mc.simulated_sharpe_p5, mc.simulated_sharpe_p95, mc.simulated_sharpe_p5, mc.simulated_sharpe_p95)} />
          <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500" style={markerStyle(mc.actual_sharpe, mc.simulated_sharpe_p5, mc.simulated_sharpe_p95)} />
        </div>
      </div>
    </div>
  );
}

function BootstrapSection({ bs }: { bs: NonNullable<ValidationData["bootstrap"]> }) {
  const { t } = useTranslation();
  if (bs.error) return <p className="text-sm text-muted-foreground">{bs.error}</p>;
  const reliable = bs.ci_lower > 0;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold">{t("charts.validation.bootstrap.title")}</h4>
        <Badge 
          value={reliable ? t("charts.validation.bootstrap.ciGreaterThan0") : t("charts.validation.bootstrap.ciIncludes0")} 
          good={reliable} 
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("charts.validation.bootstrap.description", { resamples: bs.n_bootstrap.toLocaleString(), confidence: (bs.confidence * 100).toFixed(0) })}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-xl border border-border/60 bg-muted/20 p-3">
        <Stat label={t("charts.validation.bootstrap.observedSharpe")} value={bs.observed_sharpe.toFixed(2)} />
        <Stat label={`${(bs.confidence * 100).toFixed(0)}% CI`} value={`[${bs.ci_lower.toFixed(2)}, ${bs.ci_upper.toFixed(2)}]`} />
        <Stat label={t("charts.validation.bootstrap.medianSharpe")} value={bs.median_sharpe.toFixed(2)} />
        <Stat label={t("charts.validation.bootstrap.probSharpePositive")} value={pctFmt(bs.prob_positive)} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>{bs.ci_lower.toFixed(2)}</span>
          <span>{bs.ci_upper.toFixed(2)}</span>
        </div>
        <div className="relative h-3 rounded-full bg-muted overflow-hidden">
          <div className={cn("absolute inset-y-0 rounded-full", reliable ? "bg-emerald-500/30" : "bg-amber-500/30")} style={barStyle(bs.ci_lower, bs.ci_upper, Math.min(bs.ci_lower, 0), Math.max(bs.ci_upper, 1))} />
          <div className="absolute top-0 bottom-0 w-0.5 bg-foreground" style={markerStyle(bs.observed_sharpe, Math.min(bs.ci_lower, 0), Math.max(bs.ci_upper, 1))} />
        </div>
      </div>
    </div>
  );
}

function WalkForwardSection({ wf }: { wf: NonNullable<ValidationData["walk_forward"]> }) {
  const { t } = useTranslation();
  if (wf.error) return <p className="text-sm text-muted-foreground">{wf.error}</p>;
  const consistent = wf.consistency_rate >= 0.8;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold">{t("charts.validation.walkForward.title")}</h4>
        <Badge 
          value={t("charts.validation.walkForward.profitableWindows", { profitable: wf.profitable_windows, total: wf.n_windows })} 
          good={consistent ? true : wf.consistency_rate >= 0.5 ? null : false} 
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("charts.validation.walkForward.description", { windows: wf.n_windows })}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-xl border border-border/60 bg-muted/20 p-3">
        <Stat label={t("charts.validation.walkForward.consistency")} value={pctFmt(wf.consistency_rate)} />
        <Stat label={t("charts.validation.walkForward.avgReturn")} value={pctFmt(wf.return_mean)} sub={`std ${pctFmt(wf.return_std)}`} />
        <Stat label={t("charts.validation.walkForward.avgSharpe")} value={wf.sharpe_mean.toFixed(2)} sub={`std ${wf.sharpe_std.toFixed(2)}`} />
        <Stat label={t("charts.validation.walkForward.windows")} value={String(wf.n_windows)} />
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-1.5 pr-3">#</th>
            <th className="py-1.5 pr-3">{t("charts.validation.walkForward.period")}</th>
            <th className="py-1.5 pr-3 text-right">{t("runDetail.avgReturn")}</th>
            <th className="py-1.5 pr-3 text-right">{t("metrics.sharpe")}</th>
            <th className="py-1.5 pr-3 text-right">{t("charts.validation.walkForward.maxDd")}</th>
            <th className="py-1.5 pr-3 text-right">{t("metrics.tradeCount")}</th>
            <th className="py-1.5 text-right">{t("charts.validation.walkForward.winRate")}</th>
          </tr>
        </thead>
        <tbody>
          {wf.windows.map((w) => (
            <tr key={w.window} className="border-b last:border-0">
              <td className="py-1.5 pr-3 font-mono">{w.window}</td>
              <td className="py-1.5 pr-3 font-mono text-muted-foreground">{w.start} ~ {w.end}</td>
              <td className={cn("py-1.5 pr-3 text-right font-mono tabular-nums", w.return > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>{pctFmt(w.return)}</td>
              <td className="py-1.5 pr-3 text-right font-mono tabular-nums">{w.sharpe.toFixed(2)}</td>
              <td className="py-1.5 pr-3 text-right font-mono tabular-nums">{pctFmt(w.max_dd)}</td>
              <td className="py-1.5 pr-3 text-right font-mono tabular-nums">{w.trades}</td>
              <td className="py-1.5 text-right font-mono tabular-nums">{pctFmt(w.win_rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function barStyle(start: number, end: number, min: number, max: number) {
  const range = max - min || 1;
  const left = ((start - min) / range) * 100;
  const width = ((end - start) / range) * 100;
  return { left: `${Math.max(left, 0)}%`, width: `${Math.min(width, 100)}%` };
}

function markerStyle(value: number, min: number, max: number) {
  const range = max - min || 1;
  const left = ((value - min) / range) * 100;
  return { left: `${Math.max(0, Math.min(100, left))}%` };
}

export function ValidationPanel({ data }: Props) {
  const { t } = useTranslation();
  const hasMC = !!data.monte_carlo;
  const hasBS = !!data.bootstrap;
  const hasWF = !!data.walk_forward;

  if (!hasMC && !hasBS && !hasWF) {
    return <p className="p-8 text-sm text-muted-foreground">{t("charts.validation.noValidationData")}</p>;
  }

  return (
    <div className="p-4 space-y-6">
      {hasMC && <MonteCarloSection mc={data.monte_carlo!} />}
      {hasBS && <BootstrapSection bs={data.bootstrap!} />}
      {hasWF && <WalkForwardSection wf={data.walk_forward!} />}
    </div>
  );
}

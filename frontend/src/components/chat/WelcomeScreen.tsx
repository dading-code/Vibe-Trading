import { Bot, TrendingUp, Globe, Sparkles, Users, UserCircle2, NotebookPen, Landmark } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Example {
  title: string;
  desc: string;
  prompt: string;
}

interface Category {
  label: string;
  icon: React.ReactNode;
  color: string;
  examples: Example[];
}

export function WelcomeScreen({ onExample }: { onExample: (s: string) => void }) {
  const { t } = useTranslation();
  
  const CAPABILITY_CHIPS = [
    t("welcome.capabilityChips.financeSkillsLibrary"),
    t("welcome.capabilityChips.swarmAgentTeams"),
    t("welcome.capabilityChips.autoDiscoveredTools"),
    t("welcome.capabilityChips.3Markets"),
    t("welcome.capabilityChips.tradingConnectorProfiles"),
    t("welcome.capabilityChips.minuteToDailyTimeframes"),
    t("welcome.capabilityChips.4PortfolioOptimizers"),
    t("welcome.capabilityChips.15RiskMetrics"),
    t("welcome.capabilityChips.optionsAndDerivatives"),
    t("welcome.capabilityChips.pdfAndWebResearch"),
    t("welcome.capabilityChips.factorAnalysisAndML"),
    t("welcome.capabilityChips.tradeJournalAnalyzer"),
    t("welcome.capabilityChips.shadowAccountBacktest"),
    t("welcome.capabilityChips.persistentMemory"),
    t("welcome.capabilityChips.sessionSearch"),
  ];

  const CATEGORIES: Category[] = [
    {
      label: t("welcome.categories.multiMarketBacktest.label"),
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-red-400 border-red-500/30 hover:border-red-500/60 hover:bg-red-500/5",
      examples: [
        {
          title: t("welcome.categories.multiMarketBacktest.examples.crossMarketPortfolio.title"),
          desc: t("welcome.categories.multiMarketBacktest.examples.crossMarketPortfolio.desc"),
          prompt: "Backtest a risk-parity portfolio of 000001.SZ, BTC-USDT, and AAPL for full-year 2024, compare against equal-weight baseline",
        },
        {
          title: t("welcome.categories.multiMarketBacktest.examples.btc5MinMacdStrategy.title"),
          desc: t("welcome.categories.multiMarketBacktest.examples.btc5MinMacdStrategy.desc"),
          prompt: "Backtest BTC-USDT 5-minute MACD strategy, fast=12 slow=26 signal=9, last 30 days",
        },
        {
          title: t("welcome.categories.multiMarketBacktest.examples.usTechMaxDiversification.title"),
          desc: t("welcome.categories.multiMarketBacktest.examples.usTechMaxDiversification.desc"),
          prompt: "Backtest AAPL, MSFT, GOOGL, AMZN, NVDA with max_diversification portfolio optimizer, full-year 2024",
        },
      ],
    },
    {
      label: t("welcome.categories.researchAndAnalysis.label"),
      icon: <Sparkles className="h-4 w-4" />,
      color: "text-amber-400 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/5",
      examples: [
        {
          title: t("welcome.categories.researchAndAnalysis.examples.multiFactorAlphaModel.title"),
          desc: t("welcome.categories.researchAndAnalysis.examples.multiFactorAlphaModel.desc"),
          prompt: "Build a multi-factor alpha model using momentum, reversal, volatility, and turnover on CSI 300 constituents with IC-weighted factor synthesis, backtest 2023-2024",
        },
        {
          title: t("welcome.categories.researchAndAnalysis.examples.optionsGreeksAnalysis.title"),
          desc: t("welcome.categories.researchAndAnalysis.examples.optionsGreeksAnalysis.desc"),
          prompt: "Calculate option Greeks using Black-Scholes: spot=100, strike=105, risk-free rate=3%, vol=25%, expiry=90 days, analyze Delta/Gamma/Theta/Vega",
        },
      ],
    },
    {
      label: t("welcome.categories.swarmTeams.label"),
      icon: <Users className="h-4 w-4" />,
      color: "text-violet-400 border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/5",
      examples: [
        {
          title: t("welcome.categories.swarmTeams.examples.investmentCommitteeReview.title"),
          desc: t("welcome.categories.swarmTeams.examples.investmentCommitteeReview.desc"),
          prompt: "[Swarm Team Mode] Use the investment_committee preset to evaluate whether to go long or short on NVDA given current market conditions",
        },
        {
          title: t("welcome.categories.swarmTeams.examples.quantStrategyDesk.title"),
          desc: t("welcome.categories.swarmTeams.examples.quantStrategyDesk.desc"),
          prompt: "[Swarm Team Mode] Use the quant_strategy_desk preset to find and backtest the best momentum strategy on CSI 300 constituents",
        },
      ],
    },
    {
      label: t("welcome.categories.documentAndWebResearch.label"),
      icon: <Globe className="h-4 w-4" />,
      color: "text-blue-400 border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/5",
      examples: [
        {
          title: t("welcome.categories.documentAndWebResearch.examples.analyzeEarningsReportPdf.title"),
          desc: t("welcome.categories.documentAndWebResearch.examples.analyzeEarningsReportPdf.desc"),
          prompt: "Summarize the key financial metrics, risks, and outlook from the uploaded earnings report",
        },
        {
          title: t("welcome.categories.documentAndWebResearch.examples.webResearchMacroOutlook.title"),
          desc: t("welcome.categories.documentAndWebResearch.examples.webResearchMacroOutlook.desc"),
          prompt: "Read the latest Fed meeting minutes and summarize the key takeaways for equity and crypto markets",
        },
      ],
    },
    {
      label: t("welcome.categories.tradeJournal.label"),
      icon: <NotebookPen className="h-4 w-4" />,
      color: "text-orange-400 border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/5",
      examples: [
        {
          title: t("welcome.categories.tradeJournal.examples.analyzeMyBrokerExport.title"),
          desc: t("welcome.categories.tradeJournal.examples.analyzeMyBrokerExport.desc"),
          prompt: "Analyze the trade journal I just uploaded — full profile with holding stats, win rate, top symbols, and hourly distribution",
        },
        {
          title: t("welcome.categories.tradeJournal.examples.diagnoseMyBehaviorBiases.title"),
          desc: t("welcome.categories.tradeJournal.examples.diagnoseMyBehaviorBiases.desc"),
          prompt: "Run the 4 behavior diagnostics on my trade journal (disposition, overtrading, chasing, anchoring) and tell me which bias hurts my PnL most",
        },
      ],
    },
    {
      label: t("welcome.categories.tradingConnectors.label"),
      icon: <Landmark className="h-4 w-4" />,
      color: "text-cyan-400 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/5",
      examples: [
        {
          title: t("welcome.categories.tradingConnectors.examples.checkSelectedConnector.title"),
          desc: t("welcome.categories.tradingConnectors.examples.checkSelectedConnector.desc"),
          prompt: "List my trading connector profiles, show which one is selected, then check that selected connector. If it is not ready, tell me exactly what setup step is missing. Do not place or modify orders.",
        },
        {
          title: t("welcome.categories.tradingConnectors.examples.analyzeConnectorPortfolio.title"),
          desc: t("welcome.categories.tradingConnectors.examples.analyzeConnectorPortfolio.desc"),
          prompt: "Use the selected trading connector profile to summarize my account, positions, concentration, cash, and portfolio risk. Do not place or modify orders.",
        },
        {
          title: t("welcome.categories.tradingConnectors.examples.quoteAndTrend.title"),
          desc: t("welcome.categories.tradingConnectors.examples.quoteAndTrend.desc"),
          prompt: "Use the selected trading connector to fetch an AAPL quote and 30 daily bars, then summarize the current quote versus the recent trend. Keep it read-only.",
        },
      ],
    },
    {
      label: t("welcome.categories.shadowAccount.label"),
      icon: <UserCircle2 className="h-4 w-4" />,
      color: "text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5",
      examples: [
        {
          title: t("welcome.categories.shadowAccount.examples.trainMyShadowFromJournal.title"),
          desc: t("welcome.categories.shadowAccount.examples.trainMyShadowFromJournal.desc"),
          prompt: "Train my shadow account from the trading journal I just uploaded — show the extracted rules and confirm they look like my behavior",
        },
        {
          title: t("welcome.categories.shadowAccount.examples.howMuchAmILeavingOnTable.title"),
          desc: t("welcome.categories.shadowAccount.examples.howMuchAmILeavingOnTable.desc"),
          prompt: "Run a shadow backtest for the last 90 days on the US market and break down where my PnL diverged from the shadow (rule violations, early exits, missed signals)",
        },
        {
          title: t("welcome.categories.shadowAccount.examples.generateShadowReport.title"),
          desc: t("welcome.categories.shadowAccount.examples.generateShadowReport.desc"),
          prompt: "Render the shadow report and give me the URL — lead with the you-vs-shadow delta",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center">
      {/* Header */}
      <div className="space-y-3">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/80 to-info/80 flex items-center justify-center shadow-lg">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("app.name")}</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
            {t("welcome.subtitle")}
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed mx-auto">
            {t("welcome.description")}
          </p>
        </div>
      </div>

      {/* Capability chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {CAPABILITY_CHIPS.map((chip) => (
          <span
            key={chip}
            className="px-2.5 py-1 text-xs rounded-full border border-border/60 text-muted-foreground bg-muted/30"
          >
            {chip}
          </span>
        ))}
      </div>

      {/* Example categories grid */}
      <div className="w-full max-w-2xl text-left space-y-4">
        <p className="text-xs text-muted-foreground px-1">{t("welcome.tryExample")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="space-y-2">
              <div className={`flex items-center gap-1.5 text-xs font-medium px-1 ${cat.color.split(" ").filter((c) => c.startsWith("text-")).join(" ")}`}>
                {cat.icon}
                <span>{cat.label}</span>
              </div>
              <div className="space-y-1.5">
                {cat.examples.map((ex) => (
                  <button
                    key={ex.title}
                    onClick={() => onExample(ex.prompt)}
                    className={`block w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${cat.color}`}
                  >
                    <span className="text-sm font-medium text-foreground leading-snug">
                      {ex.title}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
                      {ex.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

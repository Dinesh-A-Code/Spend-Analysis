import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import type { AIInsight } from '../../types/index.js';

type InsightFilter = 'All' | 'Patterns' | 'Recommendations' | 'Alerts';

export const AIInsightsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<InsightFilter>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const loadInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getInsights();
      setInsights(res.insights || []);
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const handleDismiss = async (id: number) => {
    try {
      await api.dismissInsight(id);
      setInsights((prev) => prev.filter((i) => i.id !== id));
    } catch {
      // Handle error
    }
  };

  const filteredInsights = useMemo(() => {
    return insights.filter((i) => {
      if (i.is_dismissed) return false;
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Patterns') return i.insight_type === 'Pattern';
      if (selectedFilter === 'Recommendations') return i.insight_type === 'Recommendation';
      if (selectedFilter === 'Alerts') return i.insight_type === 'Alert';
      return true;
    });
  }, [insights, selectedFilter]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'Alert':
        return 'warning';
      case 'Pattern':
        return 'trending_up';
      case 'Recommendation':
        return 'lightbulb';
      default:
        return 'auto_awesome';
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full antialiased pb-12">
      {/* Top App Bar */}
      <header className="flex justify-between items-center w-full px-margin-mobile py-4 bg-background top-0 z-40 sticky border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-border-subtle flex items-center justify-center font-semibold text-text-primary">
            {initial}
          </div>
          <div>
            <h1 className="text-headline-md font-headline-md font-bold text-on-surface">
              Spend Analysis
            </h1>
          </div>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container border border-border-subtle text-on-surface scale-95 active:scale-90 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
      </header>

      <main className="px-margin-mobile md:px-margin-desktop py-6 max-w-4xl mx-auto space-y-6 w-full">
        {/* Title Section */}
        <div className="space-y-1">
          <h2 className="font-headline-lg text-headline-lg font-bold text-text-primary">
            AI Insights
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Understand your spending with data-backed insights
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span className="font-metadata text-metadata text-text-secondary uppercase tracking-wider">
              Insights updated recently
            </span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['All', 'Patterns', 'Recommendations', 'Alerts'] as InsightFilter[]).map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full font-body-sm text-body-sm whitespace-nowrap transition-colors border cursor-pointer ${
                  isActive
                    ? 'bg-surface-bright text-text-primary border-border-subtle font-medium shadow-sm'
                    : 'bg-surface-container text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Spending Snapshot Section */}
        <div className="space-y-4 pt-2">
          <div className="space-y-0.5">
            <h3 className="font-headline-md text-headline-md font-semibold text-text-primary">
              Your spending snapshot
            </h3>
            <p className="font-body-sm text-body-sm text-text-secondary">
              {filteredInsights.length}{' '}
              {filteredInsights.length === 1 ? 'thing worth knowing' : 'things worth knowing'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
              <span className="material-symbols-outlined text-3xl animate-spin text-accent-insight-blue">
                progress_activity
              </span>
              <p className="text-body-sm">Analyzing financial heuristics...</p>
            </div>
          ) : filteredInsights.length === 0 ? (
            <div className="p-8 rounded-2xl bg-surface-container-low border border-border-subtle text-center text-text-secondary">
              <span className="material-symbols-outlined text-4xl mb-2 text-text-secondary opacity-50">
                auto_awesome
              </span>
              <p className="font-body-md font-medium text-text-primary">No active insights</p>
              <p className="text-body-sm mt-1">All insights have been reviewed or dismissed.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredInsights.map((insight) => {
                const isAlert = insight.insight_type === 'Alert';
                const isPattern = insight.insight_type === 'Pattern';

                return (
                  <div
                    key={insight.id}
                    className={`bg-surface-container-low rounded-2xl p-6 border shadow-sm space-y-4 relative overflow-hidden transition-all ${
                      isAlert
                        ? 'border-status-warning/30 bg-status-warning/5'
                        : isPattern
                        ? 'border-border-subtle border-l-4 border-l-accent-insight-purple'
                        : 'border-border-subtle border-l-4 border-l-accent-insight-blue'
                    }`}
                  >
                    {/* Header with Type Badge and Dismiss */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            isAlert
                              ? 'bg-status-warning/20 text-status-warning'
                              : isPattern
                              ? 'bg-accent-insight-purple/20 text-accent-insight-purple'
                              : 'bg-accent-insight-blue/20 text-accent-insight-blue'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg icon-filled">
                            {getInsightIcon(insight.insight_type)}
                          </span>
                        </div>
                        <span
                          className={`font-label-bold text-label-bold px-2.5 py-1 rounded-md text-xs uppercase ${
                            isAlert
                              ? 'bg-status-warning/20 text-status-warning'
                              : isPattern
                              ? 'bg-accent-insight-purple/20 text-accent-insight-purple'
                              : 'bg-accent-insight-blue/20 text-accent-insight-blue'
                          }`}
                        >
                          {insight.insight_type}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDismiss(insight.id)}
                        aria-label="Dismiss insight"
                        className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        title="Dismiss"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>

                    {/* Insight Body Text */}
                    <p className="font-body-lg text-body-lg text-text-primary leading-relaxed">
                      {insight.insight_text}
                    </p>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                      <span className="text-metadata text-metadata text-text-secondary">
                        {insight.category} Heuristic
                      </span>
                      {isAlert ? (
                        <button
                          type="button"
                          onClick={() => navigate('/budget')}
                          className="text-body-sm font-semibold text-accent-insight-blue hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Adjust budget</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate('/analytics')}
                          className="text-body-sm font-semibold text-accent-insight-blue hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>View spending</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIInsightsPage;

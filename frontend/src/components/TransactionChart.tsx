/**
 * Collapsible visual charts for the current month's transactions.
 * Renders a per-day spending timeline and a per-category breakdown,
 * drawn with inline SVG (no charting dependency).
 */

import React, { useMemo, useState } from "react";
import { Expense } from "../types";
import { formatCurrency, getDaysInMonth } from "../utils/expenseUtils";
import { getCategoryEmoji } from "../constants/categoryEmojis";
import { COLORS } from "../constants/colors";

interface TransactionChartProps {
  expenses: Expense[];
  year: number;
  month: number; // 1-12
}

const CATEGORY_COLORS = [
  COLORS.primary.p05,
  COLORS.orange.or05,
  COLORS.green.gr05,
  COLORS.yellow.ye05,
  COLORS.blueGreen.bg05,
  COLORS.red.re05,
  COLORS.yellowGreen.yg05,
  COLORS.primary.p08,
  COLORS.orange.or07,
  COLORS.secondary.s08,
];

export const TransactionChart: React.FC<TransactionChartProps> = ({
  expenses,
  year,
  month,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const daysInMonth = getDaysInMonth(year, month);

  const dailyTotals = useMemo(() => {
    const totals = new Array<number>(daysInMonth).fill(0);
    expenses.forEach((expense) => {
      const day = new Date(expense.date).getDate();
      if (day >= 1 && day <= daysInMonth) {
        totals[day - 1] += Number(expense.amount);
      }
    });
    return totals;
  }, [expenses, daysInMonth]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((expense) => {
      const category = expense.category || "Other";
      map.set(category, (map.get(category) || 0) + Number(expense.amount));
    });
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const maxDaily = Math.max(...dailyTotals, 0);
  const maxCategory = Math.max(...categoryTotals.map((c) => c.amount), 0);

  const containerStyle: React.CSSProperties = {
    backgroundColor: COLORS.background.main,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "0.5rem",
    overflow: "hidden",
  };

  const toggleStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.875rem 1rem",
    background: COLORS.background.card,
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 600,
    color: COLORS.text.primary,
  };

  const bodyStyle: React.CSSProperties = {
    padding: "1.5rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: COLORS.text.secondary,
    marginBottom: "1rem",
  };

  return (
    <div style={containerStyle}>
      <button
        style={toggleStyle}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span>📊 Transaction charts</span>
        <span
          style={{
            display: "inline-block",
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            color: COLORS.text.secondary,
          }}
        >
          ▶
        </span>
      </button>

      {isOpen && (
        <div style={bodyStyle}>
          {expenses.length === 0 ? (
            <div style={{ color: COLORS.text.secondary, textAlign: "center" }}>
              No transactions to chart for this month.
            </div>
          ) : (
            <>
              {/* Spending by day */}
              <div>
                <div style={sectionTitleStyle}>Spending by day</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "3px",
                    height: "160px",
                  }}
                >
                  {dailyTotals.map((amount, index) => {
                    const heightPct =
                      maxDaily > 0 ? (amount / maxDaily) * 100 : 0;
                    return (
                      <div
                        key={index}
                        title={`Day ${index + 1}: ${formatCurrency(amount)}`}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: `${heightPct}%`,
                            minHeight: amount > 0 ? "2px" : "0",
                            background: COLORS.primary.p05,
                            borderRadius: "2px 2px 0 0",
                            transition: "height 0.2s ease",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "0.35rem",
                    fontSize: "0.7rem",
                    color: COLORS.text.light,
                  }}
                >
                  <span>1</span>
                  <span>{Math.ceil(daysInMonth / 2)}</span>
                  <span>{daysInMonth}</span>
                </div>
              </div>

              {/* Spending by category */}
              <div>
                <div style={sectionTitleStyle}>Spending by category</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  {categoryTotals.map((item, index) => {
                    const widthPct =
                      maxCategory > 0 ? (item.amount / maxCategory) * 100 : 0;
                    const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                    return (
                      <div
                        key={item.category}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: "130px",
                            flexShrink: 0,
                            fontSize: "0.85rem",
                            color: COLORS.text.primary,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {getCategoryEmoji(item.category)} {item.category}
                        </div>
                        <div
                          style={{
                            flex: 1,
                            background: COLORS.background.hover,
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${widthPct}%`,
                              minWidth: "2px",
                              height: "22px",
                              background: color,
                              borderRadius: "4px",
                              transition: "width 0.2s ease",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            width: "90px",
                            flexShrink: 0,
                            textAlign: "right",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: COLORS.text.primary,
                          }}
                        >
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

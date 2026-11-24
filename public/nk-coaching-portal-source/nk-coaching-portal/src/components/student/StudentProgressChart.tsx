import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Award, TrendingUp, Sparkles, Target, Calendar, CheckCircle2 } from 'lucide-react';
import { TestResult, OnlineTest } from '../../types';

interface StudentProgressChartProps {
  results: TestResult[];
  tests: OnlineTest[];
  studentName: string;
}

interface ChartDataPoint {
  id: string;
  testId: string;
  testTitle: string;
  subject: string;
  date: Date;
  dateStr: string;
  score: number;
  totalMarks: number;
  percentage: number;
  rank?: number;
}

export const StudentProgressChart: React.FC<StudentProgressChartProps> = ({
  results,
  tests,
  studentName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 260 });
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map and sort results chronologically
  const chartData: ChartDataPoint[] = results
    .map(r => {
      const test = tests.find(t => t.id === r.testId);
      const parsedDate = new Date(r.submittedAt || Date.now());
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      return {
        id: r.id,
        testId: r.testId,
        testTitle: test ? test.title : 'Chapter Test',
        subject: test ? test.subject : 'Course',
        date: validDate,
        dateStr: validDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        score: r.score,
        totalMarks: r.totalMarks,
        percentage: Math.round(r.percentage || (r.score / r.totalMarks) * 100),
        rank: r.rank
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Handle ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        setDimensions({
          width: Math.max(300, Math.floor(width)),
          height: 260
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Render D3 chart
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 25, right: 30, bottom: 40, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define Gradients
    const defs = svg.append('defs');

    // Area fill gradient (Indigo to transparent)
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'progress-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4F46E5')
      .attr('stop-opacity', 0.35);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4F46E5')
      .attr('stop-opacity', 0.0);

    // Line stroke gradient
    const lineGradient = defs
      .append('linearGradient')
      .attr('id', 'progress-line-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#6366F1');
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10B981');

    // Scales
    let xScale: d3.ScalePoint<string>;
    const xLabels = chartData.map((d, i) => `${d.dateStr} (${i + 1})`);
    xScale = d3.scalePoint<string>()
      .domain(xLabels)
      .range([0, innerWidth])
      .padding(chartData.length === 1 ? 0.5 : 0.2);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .nice()
      .range([innerHeight, 0]);

    // Horizontal Grid Lines
    const yTicks = [0, 25, 50, 75, 100];
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#E2E8F0')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1);

    // 75% Distinction Target Line
    const targetY = yScale(75);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', targetY)
      .attr('y2', targetY)
      .attr('stroke', '#10B981')
      .attr('stroke-dasharray', '5,4')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6);

    g.append('text')
      .attr('x', innerWidth)
      .attr('y', targetY - 6)
      .attr('text-anchor', 'end')
      .attr('fill', '#059669')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text('75% Target Score');

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10);
    const gx = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    gx.select('.domain').attr('stroke', '#CBD5E1');
    gx.selectAll('text')
      .attr('fill', '#64748B')
      .attr('font-size', '10px')
      .attr('font-weight', '500');

    // Y Axis
    const yAxis = d3.axisLeft(yScale)
      .tickValues(yTicks)
      .tickFormat(d => `${d}%`)
      .tickSize(0)
      .tickPadding(8);

    const gy = g.append('g').call(yAxis);
    gy.select('.domain').remove();
    gy.selectAll('text')
      .attr('fill', '#94A3B8')
      .attr('font-size', '10px')
      .attr('font-weight', '600');

    // Area Generator
    if (chartData.length > 1) {
      const areaGenerator = d3.area<ChartDataPoint>()
        .x((d, i) => xScale(xLabels[i]) || 0)
        .y0(innerHeight)
        .y1(d => yScale(d.percentage))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(chartData)
        .attr('fill', 'url(#progress-area-gradient)')
        .attr('d', areaGenerator);

      // Line Generator
      const lineGenerator = d3.line<ChartDataPoint>()
        .x((d, i) => xScale(xLabels[i]) || 0)
        .y(d => yScale(d.percentage))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'url(#progress-line-gradient)')
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', lineGenerator);
    }

    // Circles / Data Points
    const pointsGroup = g.append('g').attr('class', 'points');

    chartData.forEach((d, i) => {
      const cx = xScale(xLabels[i]) || 0;
      const cy = yScale(d.percentage);

      // Outer pulse ring for highest score
      const isMax = d.percentage === d3.max(chartData, p => p.percentage);

      if (isMax) {
        pointsGroup.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 10)
          .attr('fill', '#10B981')
          .attr('fill-opacity', 0.2);
      }

      // Main Point Circle
      const point = pointsGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 5.5)
        .attr('fill', d.percentage >= 75 ? '#10B981' : d.percentage >= 50 ? '#6366F1' : '#F59E0B')
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 2.5)
        .attr('cursor', 'pointer')
        .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))');

      // Value label on top
      pointsGroup.append('text')
        .attr('x', cx)
        .attr('y', cy - 9)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1E293B')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .text(`${d.percentage}%`);

      // Invisible larger hit area for mouse interaction
      pointsGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 18)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('mouseenter', (event) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            });
          }
          setHoveredPoint(d);
          point.transition().duration(150).attr('r', 8);
        })
        .on('mouseleave', () => {
          setHoveredPoint(null);
          point.transition().duration(150).attr('r', 5.5);
        });
    });
  }, [dimensions, chartData]);

  // Metric computations
  const totalAttempts = chartData.length;
  const avgScore = totalAttempts > 0 
    ? Math.round(chartData.reduce((acc, c) => acc + c.percentage, 0) / totalAttempts) 
    : 0;
  const peakScore = totalAttempts > 0 ? Math.max(...chartData.map(c => c.percentage)) : 0;
  const latestScore = totalAttempts > 0 ? chartData[chartData.length - 1].percentage : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header with Title & Overall Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900">
              Student Test Score Trend &amp; Progress (D3 Analytics)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test score progression over time for <strong className="text-slate-800">{studentName}</strong>
          </p>
        </div>

        {totalAttempts > 0 && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
              {totalAttempts} {totalAttempts === 1 ? 'Test Attempted' : 'Tests Attempted'}
            </span>
          </div>
        )}
      </div>

      {/* 4 Metric Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Average Score
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-display text-slate-900">{avgScore}%</span>
          </div>
          <span className="text-[10px] text-slate-400">Across all exams</span>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Latest Score
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black font-display ${latestScore >= 75 ? 'text-emerald-600' : 'text-indigo-600'}`}>
              {latestScore}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Most recent test</span>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Peak Score
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-display text-emerald-600">{peakScore}%</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-[10px] text-slate-400">Highest performance</span>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Consistency Level
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-sm font-black font-display text-indigo-700">
              {avgScore >= 80 ? 'Exceptional 🌟' : avgScore >= 60 ? 'Strong Progress 📈' : 'Growing 🌱'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Faculty evaluation</span>
        </div>
      </div>

      {/* D3 Interactive Graph Area */}
      <div 
        ref={containerRef} 
        className="relative w-full bg-slate-50/50 rounded-2xl border border-slate-200/80 p-3 pt-4 overflow-hidden"
      >
        {chartData.length === 0 ? (
          <div className="py-14 text-center text-slate-400 space-y-2">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">अभी कोई टेस्ट रिजल्ट उपलब्ध नहीं है</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              छात्र जब ऊपर <strong>Start Test Now</strong> पर क्लिक करके ऑनलाइन परीक्षा देगा, तो उसका प्रोग्रेस ग्राफ़ यहाँ D3 से रेंडर होगा।
            </p>
          </div>
        ) : (
          <>
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="overflow-visible select-none"
            />

            {/* Custom Interactive Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-950 text-white p-3 rounded-xl shadow-2xl border border-slate-800 text-xs w-52 -translate-x-1/2 -translate-y-full mb-3"
                style={{
                  left: `${Math.min(Math.max(110, tooltipPos.x), dimensions.width - 110)}px`,
                  top: `${Math.max(40, tooltipPos.y - 12)}px`
                }}
              >
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
                  <span className="font-bold text-white truncate">{hoveredPoint.testTitle}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{hoveredPoint.dateStr}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Subject:</span>
                    <span className="font-semibold text-white">{hoveredPoint.subject}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Score:</span>
                    <span className="font-bold text-white">
                      {hoveredPoint.score} / {hoveredPoint.totalMarks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="font-semibold text-slate-300">Percentage:</span>
                    <span className="font-black text-sm text-emerald-400">
                      {hoveredPoint.percentage}%
                    </span>
                  </div>
                  {hoveredPoint.rank && (
                    <div className="flex items-center justify-between text-amber-300 text-[10px] pt-0.5">
                      <span>Batch Rank:</span>
                      <span className="font-bold">#{hoveredPoint.rank}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Legend & Guidance footer */}
      {chartData.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Distinction (≥75%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span>Good (≥50%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Needs Practice (&lt;50%)</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Hover points to see test details
          </span>
        </div>
      )}
    </div>
  );
};

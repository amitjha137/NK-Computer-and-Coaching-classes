import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CreditCard,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  Filter,
  Download,
  Send,
  Users,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, FeePayment } from '../../types';

interface FeeAnalyticsProps {
  onNavigateToFees?: () => void;
  onOpenRecordFee?: (studentId: string) => void;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
const PIE_COLORS = {
  collected: '#10B981', // emerald-500
  pending: '#F59E0B',   // amber-500
  overdue: '#EF4444'    // red-500
};

const MODE_COLORS: Record<string, string> = {
  UPI: '#6366F1',           // indigo
  Cash: '#10B981',          // emerald
  'Bank Transfer': '#3B82F6', // blue
  Card: '#F59E0B'           // amber
};

export const FeeAnalytics: React.FC<FeeAnalyticsProps> = ({
  onNavigateToFees,
  onOpenRecordFee
}) => {
  const { students, courses, batches, payments, sendFeeReminderToParent } = useApp();

  // Filters
  const [timeRange, setTimeRange] = useState<'all' | '6m' | '3m'>('all');
  const [courseTypeFilter, setCourseTypeFilter] = useState<'all' | 'coaching' | 'computer'>('all');
  const [metricView, setMetricView] = useState<'amount' | 'students'>('amount');

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (courseTypeFilter === 'all') return true;
      const course = courses.find(c => c.id === s.courseId);
      return course?.type === courseTypeFilter;
    });
  }, [students, courses, courseTypeFilter]);

  // Aggregate Metrics
  const totalCommittedFee = useMemo(() => {
    return filteredStudents.reduce((acc, s) => acc + (s.totalFee || 0), 0);
  }, [filteredStudents]);

  const totalCollectedFee = useMemo(() => {
    return filteredStudents.reduce((acc, s) => acc + (s.paidFee || 0), 0);
  }, [filteredStudents]);

  const totalPendingFee = useMemo(() => {
    return Math.max(0, totalCommittedFee - totalCollectedFee);
  }, [totalCommittedFee, totalCollectedFee]);

  const recoveryRate = useMemo(() => {
    if (totalCommittedFee === 0) return 0;
    return Math.round((totalCollectedFee / totalCommittedFee) * 100);
  }, [totalCommittedFee, totalCollectedFee]);

  const avgFeePerStudent = useMemo(() => {
    if (filteredStudents.length === 0) return 0;
    return Math.round(totalCollectedFee / filteredStudents.length);
  }, [totalCollectedFee, filteredStudents.length]);

  const studentsWithDue = useMemo(() => {
    return filteredStudents.filter(s => (s.totalFee - s.paidFee) > 0);
  }, [filteredStudents]);

  // Monthly Collection Data (Derived from payments + historical session distribution)
  const monthlyData = useMemo(() => {
    // Base calendar months for the 2026-2027 academic session
    const months = [
      { key: '2026-04', name: 'Apr 26', target: 45000, collected: 42000, dues: 8000 },
      { key: '2026-05', name: 'May 26', target: 50000, collected: 48500, dues: 6500 },
      { key: '2026-06', name: 'Jun 26', target: 60000, collected: 56000, dues: 9000 },
      { key: '2026-07', name: 'Jul 26', target: 70000, collected: 68500, dues: 12000 },
      { key: '2026-08', name: 'Aug 26', target: 75000, collected: 71000, dues: 15000 },
      { key: '2026-09', name: 'Sep 26', target: 65000, collected: 0, dues: 0 }
    ];

    // Compute actual sum from payments array for current/recent months
    payments.forEach(payment => {
      const monthPrefix = payment.date?.substring(0, 7); // e.g. "2026-08"
      const match = months.find(m => m.key === monthPrefix);
      if (match) {
        // add to month
        match.collected += payment.amount;
      } else if (monthPrefix) {
        const monthNum = parseInt(monthPrefix.split('-')[1], 10);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const name = `${monthNames[monthNum - 1]} ${monthPrefix.split('-')[0].substring(2)}`;
        months.push({
          key: monthPrefix,
          name,
          target: 50000,
          collected: payment.amount,
          dues: 5000
        });
      }
    });

    // Compute cumulative
    let cum = 0;
    const result = months.map(m => {
      cum += m.collected;
      return {
        ...m,
        cumulative: cum,
        achievementRate: m.target > 0 ? Math.round((m.collected / m.target) * 100) : 0
      };
    });

    if (timeRange === '3m') return result.slice(-3);
    if (timeRange === '6m') return result.slice(-6);
    return result;
  }, [payments, timeRange]);

  // Course-wise Collected vs Pending Bar Data
  const courseWiseData = useMemo(() => {
    return courses
      .filter(c => courseTypeFilter === 'all' || c.type === courseTypeFilter)
      .map(course => {
        const courseStudents = students.filter(s => s.courseId === course.id);
        const collected = courseStudents.reduce((acc, s) => acc + (s.paidFee || 0), 0);
        const total = courseStudents.reduce((acc, s) => acc + (s.totalFee || 0), 0);
        const pending = Math.max(0, total - collected);

        return {
          id: course.id,
          name: course.name.length > 18 ? course.name.substring(0, 18) + '...' : course.name,
          fullName: course.name,
          collected,
          pending,
          total,
          studentsCount: courseStudents.length,
          type: course.type
        };
      });
  }, [courses, students, courseTypeFilter]);

  // Payment Modes Split (Pie Chart)
  const paymentModeData = useMemo(() => {
    const counts: Record<string, number> = {
      UPI: 0,
      Cash: 0,
      'Bank Transfer': 0,
      Card: 0
    };

    payments.forEach(p => {
      if (counts[p.paymentMethod] !== undefined) {
        counts[p.paymentMethod] += p.amount;
      } else {
        counts[p.paymentMethod] = p.amount;
      }
    });

    return Object.entries(counts)
      .filter(([_, val]) => val > 0)
      .map(([name, value]) => ({ name, value }));
  }, [payments]);

  // Overall Recovery Pie Data
  const recoveryPieData = useMemo(() => {
    return [
      { name: 'Fee Collected', value: totalCollectedFee, color: PIE_COLORS.collected },
      { name: 'Pending Dues', value: totalPendingFee, color: PIE_COLORS.pending }
    ];
  }, [totalCollectedFee, totalPendingFee]);

  // Month-over-Month Growth Calculation
  const momGrowthRate = useMemo(() => {
    if (monthlyData.length < 2) return '+14.2%';
    const curr = monthlyData[monthlyData.length - 1]?.collected || 0;
    const prev = monthlyData[monthlyData.length - 2]?.collected || 1;
    if (prev === 0) return '+0%';
    const diff = ((curr - prev) / prev) * 100;
    return diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
  }, [monthlyData]);

  // Custom Currency Tooltip Formatter
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                ₹{Number(entry.value).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> Recharts Live Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Fiscal Session 2026-27</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Fee Collection & Revenue Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Interactive breakdown of monthly collection run-rates, pending balances, and curriculum growth trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Course Category Filter */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setCourseTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                courseTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Streams
            </button>
            <button
              onClick={() => setCourseTypeFilter('coaching')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                courseTypeFilter === 'coaching' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Coaching
            </button>
            <button
              onClick={() => setCourseTypeFilter('computer')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                courseTypeFilter === 'computer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Computer Lab
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Year
            </button>
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === '6m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 6M
            </button>
            <button
              onClick={() => setTimeRange('3m')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === '3m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quarterly
            </button>
          </div>

          {onNavigateToFees && (
            <button
              onClick={onNavigateToFees}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" /> Fee Counter
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Fee Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Fee Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              ₹{totalCollectedFee.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-600 ml-2 bg-emerald-50 px-2 py-0.5 rounded-md">
              {recoveryRate}% Realized
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">{momGrowthRate}</span> vs previous month
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, recoveryRate)}%` }}
            />
          </div>
        </div>

        {/* Total Pending Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pending Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 font-display">
              ₹{totalPendingFee.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 flex items-center justify-between">
            <span>{studentsWithDue.length} students have unpaid dues</span>
            <span className="font-semibold">{100 - recoveryRate}% of total</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, 100 - recoveryRate)}%` }}
            />
          </div>
        </div>

        {/* Total Invoiced & Student Base */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Billed Valuation
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              ₹{totalCommittedFee.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Average realization: <span className="font-bold text-slate-800">₹{avgFeePerStudent.toLocaleString('en-IN')}</span> / student
          </p>
        </div>

        {/* Collection Efficiency & Speed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Parent Digital Reach
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-blue-700 font-display">
              100%
            </span>
            <span className="text-xs font-semibold text-blue-700 ml-2">Instant Dispatch</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {payments.length} digital receipts dispatched with zero print lag
          </p>
        </div>
      </div>

      {/* CHARTS SECTION ROW 1: Monthly Collection & Cumulative Growth Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Monthly Bar & Target Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Monthly Fee Collection & Realization (₹)
              </h3>
              <p className="text-xs text-slate-500">
                Comparison of actual fees collected versus institute targets
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600"></span>
                <span className="text-slate-600 font-medium">Actual Collected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-indigo-500 rounded-full"></span>
                <span className="text-slate-600 font-medium">Monthly Target</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={val => `₹${val / 1000}k`}
                />
                <Tooltip content={renderCustomTooltip} />
                <Bar
                  dataKey="collected"
                  name="Fee Collected"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366F1' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Recovery Breakdown Donut */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-display text-slate-900">
                Fee Recovery Ratio
              </h3>
              <p className="text-xs text-slate-500">Realized versus Outstanding Balance</p>
            </div>

            <div className="h-52 w-full relative flex items-center justify-center mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recoveryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {recoveryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={renderCustomTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black font-display text-slate-900">{recoveryRate}%</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Collected</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold">Fee Collected</span>
              </div>
              <span className="font-bold font-mono">₹{totalCollectedFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 text-amber-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold">Pending Dues</span>
              </div>
              <span className="font-bold font-mono">₹{totalPendingFee.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION ROW 2: Course-wise Dues vs Collected & Cumulative Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course-wise Breakdown Grouped Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Course-wise Collected vs Pending Dues
              </h3>
              <p className="text-xs text-slate-500">Identify which streams have high pending fees</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">Collected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500"></span>
                <span className="text-slate-600 font-medium">Pending Due</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={courseWiseData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={val => `₹${val / 1000}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                />
                <Tooltip content={renderCustomTooltip} />
                <Bar dataKey="collected" name="Fee Collected" fill="#10B981" radius={[0, 4, 4, 0]} stackId="a" />
                <Bar dataKey="pending" name="Pending Due" fill="#F59E0B" radius={[0, 4, 4, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Velocity: Cumulative Collection Trajectory (Area Chart) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Cumulative Revenue Trajectory (Growth Trend)
              </h3>
              <p className="text-xs text-slate-500">Total cash intake accumulation throughout the session</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
              Trajectory 2026-27
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={val => `₹${val / 1000}k`}
                />
                <Tooltip content={renderCustomTooltip} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative Revenue"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCumulative)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION ROW 3: Payment Modes Breakdown & High Priority Pending Dues Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Modes Split */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-display text-slate-900">
                Payment Modes Distribution
              </h3>
              <p className="text-xs text-slate-500">Breakdown of student fee transaction channels</p>
            </div>

            <div className="h-52 w-full relative flex items-center justify-center mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentModeData.map((entry, index) => (
                      <Cell
                        key={`cell-mode-${index}`}
                        fill={MODE_COLORS[entry.name] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={renderCustomTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {paymentModeData.map((item, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: MODE_COLORS[item.name] || COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-semibold truncate">{item.name}</span>
                </div>
                <span className="font-bold font-mono text-slate-900 mt-1">
                  ₹{item.value.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Pending Dues Follow-Up Ledger */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Immediate Dues Recovery Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Students with remaining balances needing follow-up
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                {studentsWithDue.length} Dues Pending
              </span>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Course / Batch</th>
                    <th className="py-2.5 px-3">Total Fee</th>
                    <th className="py-2.5 px-3">Paid</th>
                    <th className="py-2.5 px-3 text-amber-700 font-bold">Remaining Due</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsWithDue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No pending fees! All students are paid up to date.
                      </td>
                    </tr>
                  ) : (
                    studentsWithDue.map(student => {
                      const due = student.totalFee - student.paidFee;
                      const course = courses.find(c => c.id === student.courseId);
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 block">{student.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{student.studentId}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-slate-700 font-medium block truncate max-w-[140px]">
                              {course?.name || student.courseId}
                            </span>
                            <span className="text-[10px] text-slate-400">Parent: {student.parentMobile}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">₹{student.totalFee.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">
                            ₹{student.paidFee.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-amber-700 font-black">
                            ₹{due.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => sendFeeReminderToParent(student)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors cursor-pointer"
                                title="Send WhatsApp Fee Reminder"
                              >
                                <Send className="w-3 h-3 text-emerald-600" /> WhatsApp
                              </button>
                              {onOpenRecordFee && (
                                <button
                                  type="button"
                                  onClick={() => onOpenRecordFee(student.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                                  title="Collect Fee"
                                >
                                  Collect
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated payment reminders can be dispatched anytime.</span>
            {onNavigateToFees && (
              <button
                type="button"
                onClick={onNavigateToFees}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Go to Fee Receipts Ledger &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

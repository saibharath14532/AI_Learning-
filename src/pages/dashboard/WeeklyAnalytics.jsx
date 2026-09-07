import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { BarChart2, ChevronRight } from 'lucide-react';
import { progressAPI } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DEFAULT_CHART_DATA = [35, 45, 20, 60, 25, 15, 0];

export default function WeeklyAnalytics() {
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);
  const [avgMins, setAvgMins] = useState(28.5);
  const [totalMins, setTotalMins] = useState(200);

  useEffect(() => {
    let isMounted = true;
    async function fetchWeeklyData() {
      try {
        const res = await progressAPI.getOverview({ period: 'This Week' });
        if (res?.success && res?.data?.studyHoursChart) {
          const chart = res.data.studyHoursChart;
          const sum = chart.reduce((a, b) => a + b, 0);
          const avg = sum > 0 ? Math.round((sum / 7) * 10) / 10 : 0;
          if (isMounted) {
            setChartData(chart);
            setTotalMins(sum);
            setAvgMins(avg);
          }
        }
      } catch (err) {
        console.error('Failed to load weekly analytics', err);
      }
    }
    fetchWeeklyData();
    return () => { isMounted = false; };
  }, []);

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Study Time (mins)',
        data: chartData,
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e1b4b',
        titleFont: { size: 11, family: 'Inter' },
        bodyFont: { size: 11, family: 'Inter' },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: { size: 9, family: 'Inter' },
          color: '#94a3b8',
        },
        border: {
          dash: [4, 4],
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10, family: 'Inter' },
          color: '#64748b',
        },
      },
    },
  };

  return (
    <div className="card flex flex-col justify-between h-full min-h-[300px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BarChart2 size={17} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Weekly Study Hours</h3>
          </div>
          <Link
            to="/progress"
            className="text-[10px] font-bold text-indigo-650 hover:text-indigo-750 flex items-center gap-0.5"
          >
            <span>View Full Progress</span>
            <ChevronRight size={10} />
          </Link>
        </div>

        <div className="h-44 relative mt-2">
          <Bar data={data} options={options} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-500">
        <span>Average: <strong>{avgMins} mins/day</strong></span>
        <span>Weekly Total: <strong>{totalMins} mins</strong></span>
      </div>
    </div>
  );
}

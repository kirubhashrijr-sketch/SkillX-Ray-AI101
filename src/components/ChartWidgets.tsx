import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import type { DomainDimensionScore, SkillXRayEntry } from '../types/skillxray';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
);

const BASE_FONT = {
  family: "'DM Sans', system-ui, sans-serif",
  size: 12,
};

export function DomainRadarChart({ scores }: { scores: DomainDimensionScore[] }) {
  const data = {
    labels: scores.map((s) => s.dimension),
    datasets: [
      {
        label: 'Your Skill X-Ray',
        data: scores.map((s) => s.score),
        backgroundColor: 'rgba(59, 130, 246, 0.24)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        pointBackgroundColor: '#60A5FA',
        pointBorderColor: '#0B1120',
        pointRadius: 4,
      },
      {
        label: 'Role Benchmark',
        data: scores.map((s) => s.benchmark),
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        borderColor: '#8B5CF6',
        borderDash: [5, 4],
        borderWidth: 1.5,
        pointBackgroundColor: '#A78BFA',
        pointBorderColor: '#0B1120',
        pointRadius: 3,
      },
    ],
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#64748B',
          backdropColor: 'transparent',
          font: { ...BASE_FONT, size: 10 },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.14)',
        },
        angleLines: {
          color: 'rgba(148, 163, 184, 0.14)',
        },
        pointLabels: {
          color: '#CBD5E1',
          font: { ...BASE_FONT, weight: 500 },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#CBD5E1',
          usePointStyle: true,
          padding: 18,
          font: BASE_FONT,
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
      },
    },
  };

  return <Radar data={data} options={options} />;
}

export function SkillDistributionDoughnut({ skills }: { skills: SkillXRayEntry[] }) {
  const counts = {
    strong: skills.filter((s) => s.bucket === 'strong').length,
    hidden: skills.filter((s) => s.bucket === 'hidden').length,
    developing: skills.filter((s) => s.bucket === 'developing').length,
    missing: skills.filter((s) => s.bucket === 'missing').length,
  };

  const data = {
    labels: ['Strong Skills', 'Hidden Skills', 'Developing', 'Missing Gaps'],
    datasets: [
      {
        data: [counts.strong, counts.hidden, counts.developing, counts.missing],
        backgroundColor: ['#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'],
        borderColor: '#0B1120',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '66%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#CBD5E1',
          usePointStyle: true,
          padding: 16,
          font: BASE_FONT,
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}

export function SkillProficiencyBarChart({ skills }: { skills: SkillXRayEntry[] }) {
  const topSkills = skills.slice(0, 10);

  const data = {
    labels: topSkills.map((s) => (s.name.length > 22 ? s.name.slice(0, 20) + '…' : s.name)),
    datasets: [
      {
        label: 'Your Proficiency',
        data: topSkills.map((s) => s.proficiency),
        backgroundColor: topSkills.map((s) =>
          s.bucket === 'strong'
            ? 'rgba(59, 130, 246, 0.85)'
            : s.bucket === 'hidden'
              ? 'rgba(139, 92, 246, 0.85)'
              : s.bucket === 'developing'
                ? 'rgba(245, 158, 11, 0.85)'
                : 'rgba(239, 68, 68, 0.8)'
        ),
        borderRadius: 6,
        barThickness: 14,
      },
      {
        label: 'Market Demand',
        data: topSkills.map((s) => s.marketDemand),
        backgroundColor: 'rgba(148, 163, 184, 0.22)',
        borderRadius: 6,
        barThickness: 14,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94A3B8', font: BASE_FONT },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#E2E8F0', font: BASE_FONT },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#CBD5E1',
          usePointStyle: true,
          padding: 16,
          font: BASE_FONT,
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
      },
    },
  };

  return <Bar data={data} options={options} />;
}

export function WeeklyProgressBarChart({ completedDays }: { completedDays: number[] }) {
  const weeks = [1, 2, 3, 4].map((w) => {
    const start = (w - 1) * 7 + 1;
    const end = w === 4 ? 30 : w * 7;
    const total = end - start + 1;
    const done = completedDays.filter((d) => d >= start && d <= end).length;
    return { label: `Week ${w}`, done, remaining: Math.max(0, total - done) };
  });

  const data = {
    labels: weeks.map((w) => w.label),
    datasets: [
      {
        label: 'Completed Days',
        data: weeks.map((w) => w.done),
        backgroundColor: '#3B82F6',
        borderRadius: 6,
      },
      {
        label: 'Remaining Days',
        data: weeks.map((w) => w.remaining),
        backgroundColor: 'rgba(148, 163, 184, 0.16)',
        borderRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#CBD5E1', font: BASE_FONT },
      },
      y: {
        stacked: true,
        min: 0,
        max: 10,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { stepSize: 2, color: '#94A3B8', font: BASE_FONT },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#CBD5E1',
          usePointStyle: true,
          padding: 16,
          font: BASE_FONT,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

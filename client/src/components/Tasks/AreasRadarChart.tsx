import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Area } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface AreasRadarChartProps {
  areas: Area[];
}

const AreasRadarChart: React.FC<AreasRadarChartProps> = ({ areas }) => {
  const { theme } = useTheme();
  const isDark = theme === 'business';

  // Theme-aware colors
  const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const data = {
    labels: areas.map(area => area.name),
    datasets: [
      {
        label: 'Area XP',
        data: areas.map(area => area.xp),
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        borderColor: 'rgba(74, 222, 128, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'transparent',
        pointBorderColor: 'transparent',
        pointHoverBackgroundColor: isDark ? '#fff' : '#000',
        pointHoverBorderColor: 'rgba(74, 222, 128, 1)',
        pointHoverRadius: 4,
        pointHoverBorderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          color: gridColor,
        },
        grid: {
          color: gridColor,
        },
        pointLabels: {
          color: textColor,
          font: {
            size: 12,
          },
        },
        ticks: {
          color: textColor,
          backdropColor: 'transparent',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        borderColor: gridColor,
        borderWidth: 1,
      },
    },
    maintainAspectRatio: false,
  };

  return areas.length > 0 ? (
    <Radar data={data} options={options} />
  ) : (
    <div className="flex items-center justify-center h-full text-base-content/70">
      No areas to display
    </div>
  );
};

export default AreasRadarChart; 
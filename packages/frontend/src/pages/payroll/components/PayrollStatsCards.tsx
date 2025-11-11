// components/PayrollStatsCards.tsx - Versión corregida

import { useMemo } from 'react';

interface StatsCardsProps {
  stats: {
    total: number;
    abiertos: number;
    liquidados: number;
    aprobados: number;
    cerrados: number;
  };
  trendData: any[];
  onFilterClick: (filter: 'all' | 'abierto' | 'liquidado' | 'aprobado' | 'cerrado') => void;
}

// Mini gráfico de línea optimizado - CORREGIDO para manejar ceros
const MiniChart = ({ data, color, compact = true }: { data: number[]; color: string; compact?: boolean }) => {
  // Si todos los datos son cero, mostrar línea plana
  const allZeros = data.every(val => val === 0);
  
  if (allZeros) {
    const height = compact ? '40' : '50';
    return (
      <svg 
        className="w-full" 
        viewBox={`0 0 100 ${height}`} 
        preserveAspectRatio="none"
        height={compact ? 16 : 20}
      >
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
          </linearGradient>
        </defs>
        
        {/* Área casi invisible para ceros */}
        <polygon
          points={`0,${height} 0,${height} 100,${height} 100,${height}`}
          fill={`url(#gradient-${color.replace('#', '')})`}
        />
        
        {/* Línea plana en la parte inferior */}
        <line
          x1="0"
          y1={height}
          x2="100"
          y2={height}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
      </svg>
    );
  }

  // Cálculo normal para datos no cero
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const height = compact ? '40' : '50';

  return (
    <svg 
      className="w-full" 
      viewBox={`0 0 100 ${height}`} 
      preserveAspectRatio="none"
      height={compact ? 16 : 20}
    >
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.4 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.1 }} />
        </linearGradient>
      </defs>
      
      <polygon
        points={`0,${height} ${points} 100,${height}`}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
      
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function PayrollStatsCards({ stats, trendData, onFilterClick }: StatsCardsProps) {
  // Calcular tendencias reales basadas en datos históricos - MEJORADO
  const calculateTrend = (currentData: number[], previousData: number[]) => {
    if (previousData.length === 0 || currentData.length === 0) return null;
    
    // Usar solo los últimos valores para una tendencia más precisa
    const currentValue = currentData[currentData.length - 1] || 0;
    const previousValue = previousData[previousData.length - 1] || 0;
    
    if (previousValue === 0) {
      return currentValue > 0 ? '+100%' : '0%';
    }
    
    const change = ((currentValue - previousValue) / previousValue) * 100;
    
    if (Math.abs(change) < 1) return '0%';
    return change > 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  // Generar datos para los mini gráficos - SIMPLIFICADO
  const chartData = useMemo(() => {
    if (!trendData || trendData.length === 0) {
      // Si no hay datos de tendencia, crear datos simples basados en el estado actual
      return {
        total: Array.from({ length: 7 }, () => stats.total),
        abiertos: Array.from({ length: 7 }, () => stats.abiertos),
        liquidados: Array.from({ length: 7 }, () => stats.liquidados),
        aprobados: Array.from({ length: 7 }, () => stats.aprobados),
        cerrados: Array.from({ length: 7 }, () => stats.cerrados),
      };
    }

    return {
      total: trendData.map(d => d.total),
      abiertos: trendData.map(d => d.abiertos),
      liquidados: trendData.map(d => d.liquidados),
      aprobados: trendData.map(d => d.aprobados),
      cerrados: trendData.map(d => d.cerrados),
    };
  }, [trendData, stats]);

  // Calcular tendencias reales - MEJORADO
  const trends = useMemo(() => {
    if (!trendData || trendData.length < 2) {
      // Si no hay suficientes datos, no mostrar tendencia
      return {
        abiertos: null,
        liquidados: null,
        aprobados: null,
        cerrados: null,
      };
    }

    // Comparar el último día con el día anterior
    const lastDay = trendData[trendData.length - 1];
    const previousDay = trendData[trendData.length - 2];

    return {
      abiertos: calculateTrend([lastDay.abiertos], [previousDay.abiertos]),
      liquidados: calculateTrend([lastDay.liquidados], [previousDay.liquidados]),
      aprobados: calculateTrend([lastDay.aprobados], [previousDay.aprobados]),
      cerrados: calculateTrend([lastDay.cerrados], [previousDay.cerrados]),
    };
  }, [trendData]);

  const cards = [
    {
      id: 'all' as const,
      title: 'Total',
      value: stats.total,
      icon: '📅',
      bgGradient: 'from-slate-500/15 to-slate-600/10',
      iconBg: 'bg-slate-500/20',
      borderColor: 'border-slate-400/20',
      textColor: 'text-slate-300',
      valueColor: 'text-white',
      chartColor: '#94a3b8',
      data: chartData.total,
      trend: null,
    },
    {
      id: 'abierto' as const,
      title: 'Abiertos',
      value: stats.abiertos,
      icon: '📤',
      bgGradient: 'from-blue-500/15 to-blue-600/10',
      iconBg: 'bg-blue-500/20',
      borderColor: 'border-blue-400/20',
      textColor: 'text-blue-200',
      valueColor: 'text-white',
      chartColor: '#60a5fa',
      data: chartData.abiertos,
      trend: trends.abiertos,
    },
    {
      id: 'liquidado' as const,
      title: 'Liquidados',
      value: stats.liquidados,
      icon: '💰',
      bgGradient: 'from-yellow-500/15 to-yellow-600/10',
      iconBg: 'bg-yellow-500/20',
      borderColor: 'border-yellow-400/20',
      textColor: 'text-yellow-200',
      valueColor: 'text-white',
      chartColor: '#fbbf24',
      data: chartData.liquidados,
      trend: trends.liquidados,
    },
    {
      id: 'aprobado' as const,
      title: 'Aprobados',
      value: stats.aprobados,
      icon: '✅',
      bgGradient: 'from-green-500/15 to-green-600/10',
      iconBg: 'bg-green-500/20',
      borderColor: 'border-green-400/20',
      textColor: 'text-green-200',
      valueColor: 'text-white',
      chartColor: '#4ade80',
      data: chartData.aprobados,
      trend: trends.aprobados,
    },
    {
      id: 'cerrado' as const,
      title: 'Cerrados',
      value: stats.cerrados,
      icon: '🔒',
      bgGradient: 'from-gray-500/15 to-gray-600/10',
      iconBg: 'bg-gray-500/20',
      borderColor: 'border-gray-400/20',
      textColor: 'text-gray-300',
      valueColor: 'text-white',
      chartColor: '#9ca3af',
      data: chartData.cerrados,
      trend: trends.cerrados,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((card, index) => (
        <div
          key={card.id}
          onClick={() => onFilterClick(card.id)}
          className={`backdrop-blur-xl bg-gradient-to-br ${card.bgGradient} rounded-xl border ${card.borderColor} p-3 cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-lg group animate-fade-in-up`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Header compacto */}
          <div className="flex items-center justify-between mb-2">
            <div className={`w-8 h-8 ${card.iconBg} rounded-lg flex items-center justify-center border ${card.borderColor} group-hover:scale-110 transition-transform duration-200`}>
              <span className="text-sm">{card.icon}</span>
            </div>
            {card.trend && card.trend !== '0%' && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                card.trend.startsWith('+') 
                  ? 'bg-green-500/20 text-green-300' 
                  : card.trend.startsWith('-')
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-gray-500/20 text-gray-300'
              }`}>
                {card.trend}
              </span>
            )}
          </div>

          {/* Contenido principal */}
          <div className="mb-2">
            <p className={`text-xs ${card.textColor} mb-1 font-medium`}>
              {card.title}
            </p>
            <p className={`text-2xl font-bold ${card.valueColor}`}>
              {card.value}
            </p>
          </div>

          {/* Mini gráfico compacto */}
          <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-200">
            <MiniChart 
              data={card.data} 
              color={card.chartColor} 
              compact={true}
            />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
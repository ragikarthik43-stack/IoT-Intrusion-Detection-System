import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Chart as ChartJS } from 'chart.js';

export function createChartComponent(type) {
  const Component = forwardRef(function ChartComponent(
    { data, options = {}, plugins = [], className = '', style = {}, redraw = false, ...rest },
    ref
  ) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useImperativeHandle(ref, () => chartRef.current, []);

    // Create chart instance
    useEffect(() => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      chartRef.current = new ChartJS(ctx, {
        type,
        data,
        options,
        plugins
      });

      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    }, [type, redraw]);

    // Update chart on data or options change
    useEffect(() => {
      if (!chartRef.current || redraw) return;
      chartRef.current.data = data;
      if (options) {
        chartRef.current.options = { ...chartRef.current.options, ...options };
      }
      chartRef.current.update();
    }, [data, options, redraw]);

    return React.createElement('canvas', {
      ref: canvasRef,
      className,
      style: { maxWidth: '100%', maxHeight: '100%', ...style },
      role: 'img',
      ...rest
    });
  });

  Component.displayName = `ChartComponent(${type})`;
  return Component;
}

export const Chart = forwardRef(function GenericChart(
  { type, data, options = {}, plugins = [], className = '', style = {}, redraw = false, ...rest },
  ref
) {
  const Comp = createChartComponent(type);
  return React.createElement(Comp, { ref, data, options, plugins, className, style, redraw, ...rest });
});

export const Line = createChartComponent('line');
export const Bar = createChartComponent('bar');
export const Doughnut = createChartComponent('doughnut');
export const Pie = createChartComponent('pie');
export const Radar = createChartComponent('radar');
export const PolarArea = createChartComponent('polarArea');
export const Scatter = createChartComponent('scatter');
export const Bubble = createChartComponent('bubble');

export default Chart;

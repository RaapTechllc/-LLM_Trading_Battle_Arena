'use client'

import React from 'react'

export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();
  private static enabled = process.env.NODE_ENV === 'development';

  static startMeasurement(name: string) {
    if (!this.enabled) return;
    this.measurements.set(name, performance.now());
  }

  static endMeasurement(name: string): number {
    if (!this.enabled) return 0;
    const startTime = this.measurements.get(name);
    if (!startTime) return 0;
    const duration = performance.now() - startTime;
    this.measurements.delete(name);
    console.log(`${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasurement(name);
    try {
      const result = await fn();
      this.endMeasurement(name);
      return result;
    } catch (error) {
      this.endMeasurement(name);
      throw error;
    }
  }

  static logMemoryUsage(label: string = 'Memory Usage') {
    if (!this.enabled || typeof window === 'undefined') return;
    // @ts-ignore - performance.memory is Chrome-only
    if (performance.memory) {
      // @ts-ignore
      const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
      console.log(`${label}:`, {
        used: `${(usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  }

  static trackComponentRender(componentName: string, renderCount: number) {
    if (!this.enabled) return;
    console.log(`${componentName} rendered ${renderCount} times`);
  }
}

export function usePerformanceMonitor(componentName: string) {
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current++;
    PerformanceMonitor.trackComponentRender(componentName, renderCount.current);
  });

  return {
    startMeasurement: (name: string) => PerformanceMonitor.startMeasurement(`${componentName}-${name}`),
    endMeasurement: (name: string) => PerformanceMonitor.endMeasurement(`${componentName}-${name}`),
    logMemoryUsage: () => PerformanceMonitor.logMemoryUsage(`${componentName} Memory`)
  };
}

import React from 'react'

// Performance monitoring utilities for demo and testing

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
    
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
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

  static measureSync<T>(name: string, fn: () => T): T {
    this.startMeasurement(name);
    try {
      const result = fn();
      this.endMeasurement(name);
      return result;
    } catch (error) {
      this.endMeasurement(name);
      throw error;
    }
  }

  // Memory usage tracking
  static logMemoryUsage(label: string = 'Memory Usage') {
    if (!this.enabled || typeof window === 'undefined') return;
    
    // @ts-ignore - performance.memory is available in Chrome
    if (performance.memory) {
      // @ts-ignore
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
      console.log(`💾 ${label}:`, {
        used: `${(usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }

  // Network performance tracking
  static trackNetworkRequest(url: string, startTime: number, endTime: number) {
    if (!this.enabled) return;
    
    const duration = endTime - startTime;
    console.log(`🌐 Network Request: ${url} - ${duration.toFixed(2)}ms`);
  }

  // Component render performance
  static trackComponentRender(componentName: string, renderCount: number) {
    if (!this.enabled) return;
    
    console.log(`🔄 ${componentName} rendered ${renderCount} times`);
  }
}

// React hook for performance monitoring
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

// Demo timing utilities
export class DemoTimer {
  private static startTime: number = 0;
  private static checkpoints: Array<{ name: string; time: number }> = [];

  static startDemo() {
    this.startTime = performance.now();
    this.checkpoints = [];
    console.log('🎬 Demo started');
  }

  static checkpoint(name: string) {
    const elapsed = performance.now() - this.startTime;
    this.checkpoints.push({ name, time: elapsed });
    console.log(`📍 ${name}: ${(elapsed / 1000).toFixed(1)}s`);
  }

  static endDemo() {
    const totalTime = performance.now() - this.startTime;
    console.log(`🏁 Demo completed in ${(totalTime / 1000).toFixed(1)}s`);
    
    console.log('\n📊 Demo Breakdown:');
    this.checkpoints.forEach((checkpoint, index) => {
      const prevTime = index > 0 ? this.checkpoints[index - 1].time : 0;
      const sectionTime = checkpoint.time - prevTime;
      console.log(`  ${checkpoint.name}: ${(sectionTime / 1000).toFixed(1)}s`);
    });
    
    return totalTime;
  }
}

// Performance testing utilities
export class LoadTester {
  static async testAPIEndpoint(url: string, concurrentRequests: number = 10): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    successRate: number;
  }> {
    console.log(`🧪 Load testing ${url} with ${concurrentRequests} concurrent requests...`);
    
    const requests = Array(concurrentRequests).fill(null).map(async () => {
      const startTime = performance.now();
      try {
        const response = await fetch(url);
        const endTime = performance.now();
        return {
          success: response.ok,
          time: endTime - startTime
        };
      } catch (error) {
        const endTime = performance.now();
        return {
          success: false,
          time: endTime - startTime
        };
      }
    });
    
    const results = await Promise.all(requests);
    const times = results.map(r => r.time);
    const successCount = results.filter(r => r.success).length;
    
    const stats = {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      successRate: (successCount / results.length) * 100
    };
    
    console.log(`📈 Load test results:`, {
      average: `${stats.averageTime.toFixed(2)}ms`,
      min: `${stats.minTime.toFixed(2)}ms`,
      max: `${stats.maxTime.toFixed(2)}ms`,
      successRate: `${stats.successRate.toFixed(1)}%`
    });
    
    return stats;
  }
}

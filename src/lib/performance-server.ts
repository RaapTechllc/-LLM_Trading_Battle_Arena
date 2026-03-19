export class DemoTimer {
  private static startTime: number = 0;
  private static checkpoints: Array<{ name: string; time: number }> = [];

  static startDemo() {
    this.startTime = performance.now();
    this.checkpoints = [];
  }

  static checkpoint(name: string) {
    const elapsed = performance.now() - this.startTime;
    this.checkpoints.push({ name, time: elapsed });
  }

  static endDemo() {
    return performance.now() - this.startTime;
  }
}

export class LoadTester {
  static async testAPIEndpoint(url: string, concurrentRequests: number = 10) {
    const requests = Array(concurrentRequests).fill(null).map(async () => {
      const startTime = performance.now();
      try {
        const response = await fetch(url);
        return { success: response.ok, time: performance.now() - startTime };
      } catch {
        return { success: false, time: performance.now() - startTime };
      }
    });

    const results = await Promise.all(requests);
    const times = results.map(r => r.time);
    const successCount = results.filter(r => r.success).length;

    return {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      successRate: (successCount / results.length) * 100
    };
  }
}

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('Frontend Designer Agent Configuration', () => {
  const agentConfigPath = path.join(process.cwd(), '.kiro/agents/frontend-designer.json');
  const mcpConfigPath = path.join(process.cwd(), '.kiro/settings/mcp.json');

  it('should have valid agent configuration JSON', () => {
    expect(fs.existsSync(agentConfigPath)).toBe(true);

    const configContent = fs.readFileSync(agentConfigPath, 'utf-8');
    const config = JSON.parse(configContent); // Will throw if invalid JSON

    expect(config.name).toBe('frontend-designer');
    expect(config.description).toBeTruthy();
    expect(config.prompt).toBeTruthy();
    expect(config.model).toMatch(/^claude-(sonnet|opus)-4/);
    expect(Array.isArray(config.tools)).toBe(true);
  });

  it('should include required tools', () => {
    const configContent = fs.readFileSync(agentConfigPath, 'utf-8');
    const config = JSON.parse(configContent);

    expect(config.tools).toContain('read');
    expect(config.tools).toContain('write');
    expect(config.tools).toContain('glob');
    expect(config.tools).toContain('grep');
    expect(config.tools).toContain('@playwright');
    expect(config.tools).toContain('@context7');
  });

  it('should have resource configuration', () => {
    const configContent = fs.readFileSync(agentConfigPath, 'utf-8');
    const config = JSON.parse(configContent);

    expect(Array.isArray(config.resources)).toBe(true);
    expect(config.resources.length).toBeGreaterThan(0);

    const hasSteeringFiles = config.resources.some((r: string) => r.includes('steering'));
    const hasComponents = config.resources.some((r: string) => r.includes('components'));

    expect(hasSteeringFiles).toBe(true);
    expect(hasComponents).toBe(true);
  });

  it('should have valid MCP configuration', () => {
    expect(fs.existsSync(mcpConfigPath)).toBe(true);

    const configContent = fs.readFileSync(mcpConfigPath, 'utf-8');
    const config = JSON.parse(configContent);

    expect(config.mcpServers).toBeDefined();
    expect(config.mcpServers.playwright).toBeDefined();
    expect(config.mcpServers.context7).toBeDefined();
  });

  it('should have all design prompts', () => {
    const promptsDir = path.join(process.cwd(), '.kiro/prompts');

    expect(fs.existsSync(path.join(promptsDir, 'ui-review.md'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'a11y-audit.md'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'responsive-check.md'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'component-style.md'))).toBe(true);
  });
});

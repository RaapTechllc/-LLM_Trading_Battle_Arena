import { describe, test, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

describe('Project structure validation', () => {
  test('prisma schema exists', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'prisma/schema.prisma'))).toBe(true)
  })

  test('prisma schema uses postgresql provider', () => {
    const schema = fs.readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf-8')
    expect(schema).toContain('provider = "postgresql"')
  })

  test('baseline migration exists', () => {
    const migrationsDir = path.join(process.cwd(), 'prisma/migrations')
    const dirs = fs.readdirSync(migrationsDir).filter(d => d.includes('baseline'))
    expect(dirs.length).toBeGreaterThan(0)
  })

  test('no .env files are tracked (gitignore)', () => {
    const gitignore = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf-8')
    expect(gitignore).toContain('.env')
  })
})

import { describe, expect, it } from 'vitest'
import { analyzeSemver, compareSemver, satisfiesSemverRange } from './semver'

describe('semver', () => {
  it('compares major, minor, and patch numbers', () => {
    expect(compareSemver('1.2.3', '1.2.4')).toBe(-1)
    expect(compareSemver('2.0.0', '1.9.9')).toBe(1)
    expect(compareSemver('v1.2.3+build.1', '1.2.3+build.9')).toBe(0)
  })

  it('orders prerelease identifiers below release versions', () => {
    expect(compareSemver('1.0.0-alpha', '1.0.0')).toBe(-1)
    expect(compareSemver('1.0.0-alpha.2', '1.0.0-alpha.10')).toBe(-1)
  })

  it('checks caret, tilde, exact, and comparator ranges', () => {
    expect(satisfiesSemverRange('1.4.0', '^1.2.3')).toBe(true)
    expect(satisfiesSemverRange('2.0.0', '^1.2.3')).toBe(false)
    expect(satisfiesSemverRange('1.2.9', '~1.2.3')).toBe(true)
    expect(satisfiesSemverRange('1.3.0', '~1.2.3')).toBe(false)
    expect(satisfiesSemverRange('1.8.0', '>=1.2.0 <2.0.0')).toBe(true)
    expect(satisfiesSemverRange('1.8.0', '1.8.0')).toBe(true)
  })

  it('returns an analysis object for UI rendering', () => {
    expect(analyzeSemver('1.4.0', '^1.2.3')).toMatchObject({
      ok: true,
      version: '1.4.0',
      range: '^1.2.3',
      satisfies: true,
    })
  })

  it('rejects invalid versions', () => {
    expect(() => compareSemver('1.2', '1.2.3')).toThrow('Invalid SemVer')
  })
})

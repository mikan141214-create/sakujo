import { describe, it, expect } from 'vitest'
import {
  calculateConditionFactor,
  calculateOverallSkill,
  calculateAttackPower,
  calculateDefensePower,
  rotatePosition,
  isFrontRow,
  PlayerSkills,
  PlayerCondition,
} from './scoring'

describe('scoring', () => {
  const sampleSkills: PlayerSkills = {
    spike: 80,
    block: 70,
    receive: 75,
    serve: 70,
    toss: 60,
    connect: 65,
    decision: 70,
  }

  const goodCondition: PlayerCondition = {
    health: 5,
    fatigue: 1,
    motivation: 5,
  }

  const badCondition: PlayerCondition = {
    health: 1,
    fatigue: 5,
    motivation: 1,
  }

  describe('calculateConditionFactor', () => {
    it('returns 1.0 when condition is null', () => {
      expect(calculateConditionFactor(null)).toBe(1.0)
    })

    it('returns higher factor for good condition', () => {
      const factor = calculateConditionFactor(goodCondition)
      expect(factor).toBeGreaterThan(1.0)
      expect(factor).toBeLessThanOrEqual(1.2)
    })

    it('returns lower factor for bad condition', () => {
      const factor = calculateConditionFactor(badCondition)
      expect(factor).toBeGreaterThanOrEqual(0.5)
      expect(factor).toBeLessThan(1.0)
    })
  })

  describe('calculateOverallSkill', () => {
    it('calculates weighted average correctly', () => {
      const overall = calculateOverallSkill(sampleSkills)
      expect(overall).toBeGreaterThan(0)
      expect(overall).toBeLessThanOrEqual(100)
      // Rough calculation check
      expect(overall).toBeCloseTo(70, 0)
    })

    it('returns 50 for all 50 skills', () => {
      const allFifty: PlayerSkills = {
        spike: 50,
        block: 50,
        receive: 50,
        serve: 50,
        toss: 50,
        connect: 50,
        decision: 50,
      }
      expect(calculateOverallSkill(allFifty)).toBe(50)
    })
  })

  describe('calculateAttackPower', () => {
    it('calculates attack power for front row players', () => {
      const players = [
        { skills: sampleSkills, condition: null },
        { skills: sampleSkills, condition: null },
        { skills: sampleSkills, condition: null },
      ]
      const power = calculateAttackPower(players)
      expect(power).toBeGreaterThan(0)
      expect(power).toBeLessThanOrEqual(100)
    })

    it('applies condition factor correctly', () => {
      const withGoodCondition = [
        { skills: sampleSkills, condition: goodCondition },
      ]
      const withBadCondition = [
        { skills: sampleSkills, condition: badCondition },
      ]
      const withoutCondition = [{ skills: sampleSkills, condition: null }]

      const goodPower = calculateAttackPower(withGoodCondition)
      const badPower = calculateAttackPower(withBadCondition)
      const normalPower = calculateAttackPower(withoutCondition)

      expect(goodPower).toBeGreaterThan(normalPower)
      expect(badPower).toBeLessThan(normalPower)
    })
  })

  describe('calculateDefensePower', () => {
    it('calculates defense power for back row players', () => {
      const players = [
        { skills: sampleSkills, condition: null },
        { skills: sampleSkills, condition: null },
        { skills: sampleSkills, condition: null },
      ]
      const power = calculateDefensePower(players)
      expect(power).toBeGreaterThan(0)
      expect(power).toBeLessThanOrEqual(100)
    })
  })

  describe('rotatePosition', () => {
    it('rotates positions clockwise', () => {
      expect(rotatePosition(1)).toBe(6)
      expect(rotatePosition(2)).toBe(1)
      expect(rotatePosition(3)).toBe(2)
      expect(rotatePosition(4)).toBe(3)
      expect(rotatePosition(5)).toBe(4)
      expect(rotatePosition(6)).toBe(5)
    })
  })

  describe('isFrontRow', () => {
    it('identifies front row positions correctly', () => {
      expect(isFrontRow(1)).toBe(false)
      expect(isFrontRow(2)).toBe(true)
      expect(isFrontRow(3)).toBe(true)
      expect(isFrontRow(4)).toBe(true)
      expect(isFrontRow(5)).toBe(false)
      expect(isFrontRow(6)).toBe(false)
    })
  })
})

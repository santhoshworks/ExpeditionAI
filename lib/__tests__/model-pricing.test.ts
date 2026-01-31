import { calculateCreditsFromTokens, getModelPricing, isModelPriced } from '../model-pricing'

describe('model-pricing', () => {
  describe('getModelPricing', () => {
    it('returns pricing for known models', () => {
      const pricing = getModelPricing('openai/gpt-4o')
      expect(pricing.input).toBe(5)
      expect(pricing.output).toBe(15)
    })

    it('returns zero pricing for unknown models', () => {
      const pricing = getModelPricing('unknown/model')
      expect(pricing.input).toBe(0)
      expect(pricing.output).toBe(0)
    })

    it('returns zero pricing for free models', () => {
      const pricing = getModelPricing('deepseek/deepseek-chat')
      expect(pricing.input).toBe(0)
      expect(pricing.output).toBe(0)
    })
  })

  describe('calculateCreditsFromTokens', () => {
    it('calculates credits correctly for priced models', () => {
      // GPT-4o: 5 credits per 1K input, 15 credits per 1K output
      // Input: 1000 tokens = 5 credits
      // Output: 1000 tokens = 15 credits
      // Total: 20 credits
      const credits = calculateCreditsFromTokens('openai/gpt-4o', 1000, 1000)
      expect(credits).toBe(20)
    })

    it('returns 0 for free models', () => {
      const credits = calculateCreditsFromTokens('deepseek/deepseek-chat', 1000, 1000)
      expect(credits).toBe(0)
    })

    it('rounds up to nearest 0.1', () => {
      // Gemini Flash Lite: 0.075 input, 0.3 output
      // Input: 10 tokens = 0.00075 credits
      // Output: 10 tokens = 0.003 credits
      // Total: 0.00375 → rounds up to 0.1
      const credits = calculateCreditsFromTokens('google/gemini-2.0-flash-lite-001', 10, 10)
      expect(credits).toBe(0.1)
    })

    it('returns minimum 0.1 for non-zero costs', () => {
      const credits = calculateCreditsFromTokens('google/gemini-2.0-flash-001', 1, 1)
      expect(credits).toBeGreaterThanOrEqual(0.1)
    })

    it('handles large token counts', () => {
      // GPT-4o with 10K input, 5K output
      // Input: 10000 × 5 / 1000 = 50
      // Output: 5000 × 15 / 1000 = 75
      // Total: 125
      const credits = calculateCreditsFromTokens('openai/gpt-4o', 10000, 5000)
      expect(credits).toBe(125)
    })
  })

  describe('isModelPriced', () => {
    it('returns true for priced models', () => {
      expect(isModelPriced('openai/gpt-4o')).toBe(true)
    })

    it('returns false for free models', () => {
      expect(isModelPriced('deepseek/deepseek-chat')).toBe(false)
    })

    it('returns false for unknown models', () => {
      expect(isModelPriced('unknown/model')).toBe(false)
    })
  })
})

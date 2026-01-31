import { logCreditUsage } from '../credits'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('credits usage logging', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('logCreditUsage', () => {
    it('inserts usage log successfully', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      }

      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await logCreditUsage(
        'user-123',
        'openai/gpt-4o',
        1000,
        500,
        10,
        90,
        'chat',
        'req-123'
      )

      expect(result.success).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        model_id: 'openai/gpt-4o',
        input_tokens: 1000,
        output_tokens: 500,
        credits_deducted: 10,
        balance_after: 90,
        feature: 'chat',
        request_id: 'req-123',
      })
    })

    it('handles insert errors gracefully', async () => {
      const mockError = { message: 'DB error' }
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockResolvedValue({ error: mockError }),
        }),
      }

      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await logCreditUsage(
        'user-123',
        'openai/gpt-4o',
        1000,
        500,
        10,
        90
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('DB error')
    })
  })
})

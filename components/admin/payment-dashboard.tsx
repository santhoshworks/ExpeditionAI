'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface PaymentData {
  overview: {
    totalRevenue: number
    totalTransactions: number
    successRate: number
    averageTransactionValue: number
  }
  dailyRevenue: Record<string, number>
  tierBreakdown: Record<string, number>
  recentTransactions: Array<{
    id: string
    amount: number
    user: {
      email: string
      name: string | null
    }
    status: string
    created_at: string
    description: string | null
  }>
  failedPayments: any[]
  summary: {
    thisMonth: number
    lastMonth: number
    growth: number
  }
}

export function PaymentDashboard() {
  const [data, setData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30')

  useEffect(() => {
    fetchPaymentData()
  }, [timeframe])

  const fetchPaymentData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/payments?timeframe=${timeframe}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return <div>Loading payment data...</div>
  }

  if (!data) {
    return <div>Failed to load payment data</div>
  }

  // Process daily revenue for chart
  const dailyRevenueData = Object.entries(data.dailyRevenue).slice(-7) // Last 7 days

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Analytics Timeframe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchPaymentData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeframe} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Total payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Payment success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.averageTransactionValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Average payment value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyRevenueData.map(([date, revenue]) => (
                <div key={date} className="flex items-center justify-between">
                  <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (revenue / Math.max(...dailyRevenueData.map(([, r]) => r))) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="font-medium text-sm w-16">${revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.tierBreakdown).map(([tier, revenue]) => (
                <div key={tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={tier === 'pro' ? 'destructive' : tier === 'basic' ? 'default' : 'secondary'}>
                      {tier.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="font-medium">${revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentTransactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(transaction.status)}
                  <div>
                    <div className="font-medium">
                      {transaction.user.name || 'No name'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.user.email}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium">${transaction.amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                </div>

                <Badge variant={getStatusBadgeVariant(transaction.status)}>
                  {transaction.status}
                </Badge>
              </div>
            ))}

            {data.recentTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transactions found for the selected timeframe
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods & Failed Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Dodo Payments</span>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              <div className="text-sm text-gray-600">
                <p>Payment processing handled by Dodo payment gateway.</p>
                <p className="mt-2">Supported methods: Credit cards, digital wallets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No failed payments in selected timeframe</p>
              <p className="text-sm text-gray-400 mt-2">
                Failed payment tracking requires webhook data storage
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
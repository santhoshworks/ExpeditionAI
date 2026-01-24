// Simple test to check if email subscription functionality works
const testEmailSubscription = async () => {
    const testEmail = 'test@example.com'

    try {
        console.log('Testing email subscription API...')

        // Test subscription
        const subscribeResponse = await fetch('http://localhost:3000/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: testEmail }),
        })

        const subscribeData = await subscribeResponse.json()
        console.log('Subscribe response:', subscribeData)

        if (subscribeResponse.ok) {
            console.log('✅ Email subscription API is working!')
        } else {
            console.log('❌ Email subscription failed:', subscribeData.error)
        }

        // Test unsubscribe
        const unsubscribeResponse = await fetch('http://localhost:3000/api/subscribe', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: testEmail }),
        })

        const unsubscribeData = await unsubscribeResponse.json()
        console.log('Unsubscribe response:', unsubscribeData)

    } catch (error) {
        console.error('Test failed:', error)
    }
}

// Only run if this script is executed directly
if (typeof window === 'undefined') {
    testEmailSubscription()
}

module.exports = { testEmailSubscription }
// Simple test script to verify the delete functionality
// Run this in the browser console after creating an expedition

async function testDeleteAPI() {
    try {
        // First, let's check if we can fetch expeditions
        const response = await fetch('/api/expeditions');
        console.log('Fetch expeditions response:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Expeditions data:', data);

            if (data.length > 0) {
                const expeditionId = data[0].id;
                console.log('Testing delete for expedition:', expeditionId);

                // Test the delete API
                const deleteResponse = await fetch(`/api/expeditions/${expeditionId}`, {
                    method: 'DELETE'
                });

                console.log('Delete response:', deleteResponse.status);
                const deleteResult = await deleteResponse.json();
                console.log('Delete result:', deleteResult);
            } else {
                console.log('No expeditions found to test delete');
            }
        }
    } catch (error) {
        console.error('Test error:', error);
    }
}

// Run the test
testDeleteAPI();
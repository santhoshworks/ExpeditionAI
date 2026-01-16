/**
 * Script to fetch all available models from OpenRouter API
 * and categorize them by pricing for free/pro tiers
 */

const https = require('https');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

function fetchModels() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'openrouter.ai',
            path: '/api/v1/models',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function main() {
    try {
        console.log('Fetching models from OpenRouter API...\n');
        const response = await fetchModels();

        if (!response.data) {
            console.error('No data received from API');
            return;
        }

        const models = response.data;
        console.log(`Total models available: ${models.length}\n`);

        // Categorize models by pricing
        const freeModels = [];
        const cheapModels = [];
        const midTierModels = [];
        const premiumModels = [];

        models.forEach(model => {
            const promptPrice = parseFloat(model.pricing?.prompt || '0');
            const completionPrice = parseFloat(model.pricing?.completion || '0');
            const avgPrice = (promptPrice + completionPrice) / 2;

            const modelInfo = {
                id: model.id,
                name: model.name,
                context_length: model.context_length,
                promptPrice: promptPrice,
                completionPrice: completionPrice,
                avgPrice: avgPrice,
                architecture: model.architecture?.modality || 'text',
                top_provider: model.top_provider?.name || 'Unknown'
            };

            // Categorize based on average price per million tokens
            if (avgPrice === 0) {
                freeModels.push(modelInfo);
            } else if (avgPrice < 0.5) {
                cheapModels.push(modelInfo);
            } else if (avgPrice < 5) {
                midTierModels.push(modelInfo);
            } else {
                premiumModels.push(modelInfo);
            }
        });

        // Sort by price within each category
        const sortByPrice = (a, b) => a.avgPrice - b.avgPrice;
        freeModels.sort(sortByPrice);
        cheapModels.sort(sortByPrice);
        midTierModels.sort(sortByPrice);
        premiumModels.sort(sortByPrice);

        console.log('='.repeat(80));
        console.log('FREE MODELS (Perfect for Free Tier)');
        console.log('='.repeat(80));
        freeModels.slice(0, 10).forEach(m => {
            console.log(`\n${m.name}`);
            console.log(`  ID: ${m.id}`);
            console.log(`  Context: ${m.context_length} tokens`);
            console.log(`  Provider: ${m.top_provider}`);
        });

        console.log('\n\n' + '='.repeat(80));
        console.log('CHEAP MODELS (<$0.50/M tokens - Good for Free/Basic Tier)');
        console.log('='.repeat(80));
        cheapModels.slice(0, 15).forEach(m => {
            console.log(`\n${m.name}`);
            console.log(`  ID: ${m.id}`);
            console.log(`  Price: $${m.avgPrice.toFixed(4)}/M tokens (prompt: $${m.promptPrice}, completion: $${m.completionPrice})`);
            console.log(`  Context: ${m.context_length} tokens`);
            console.log(`  Provider: ${m.top_provider}`);
        });

        console.log('\n\n' + '='.repeat(80));
        console.log('MID-TIER MODELS ($0.50-$5/M tokens - Good for Basic Tier)');
        console.log('='.repeat(80));
        midTierModels.slice(0, 15).forEach(m => {
            console.log(`\n${m.name}`);
            console.log(`  ID: ${m.id}`);
            console.log(`  Price: $${m.avgPrice.toFixed(4)}/M tokens (prompt: $${m.promptPrice}, completion: $${m.completionPrice})`);
            console.log(`  Context: ${m.context_length} tokens`);
            console.log(`  Provider: ${m.top_provider}`);
        });

        console.log('\n\n' + '='.repeat(80));
        console.log('PREMIUM MODELS (>$5/M tokens - Good for Pro Tier)');
        console.log('='.repeat(80));
        premiumModels.slice(0, 15).forEach(m => {
            console.log(`\n${m.name}`);
            console.log(`  ID: ${m.id}`);
            console.log(`  Price: $${m.avgPrice.toFixed(4)}/M tokens (prompt: $${m.promptPrice}, completion: $${m.completionPrice})`);
            console.log(`  Context: ${m.context_length} tokens`);
            console.log(`  Provider: ${m.top_provider}`);
        });

        console.log('\n\n' + '='.repeat(80));
        console.log('SUMMARY');
        console.log('='.repeat(80));
        console.log(`Free models: ${freeModels.length}`);
        console.log(`Cheap models (<$0.50): ${cheapModels.length}`);
        console.log(`Mid-tier models ($0.50-$5): ${midTierModels.length}`);
        console.log(`Premium models (>$5): ${premiumModels.length}`);

    } catch (error) {
        console.error('Error fetching models:', error.message);
    }
}

main();

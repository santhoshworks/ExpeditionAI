const fs = require('fs');

const data = JSON.parse(fs.readFileSync('/tmp/openrouter-models.json', 'utf8'));
const models = data.data;

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

    // Convert to price per million tokens
    const pricePerMillion = avgPrice * 1000000;

    const modelInfo = {
        id: model.id,
        name: model.name,
        context_length: model.context_length,
        promptPrice: promptPrice * 1000000,
        completionPrice: completionPrice * 1000000,
        avgPrice: pricePerMillion,
        modality: model.architecture?.modality || 'text',
        provider: model.top_provider || {}
    };

    // Categorize based on average price per million tokens
    if (avgPrice === 0) {
        freeModels.push(modelInfo);
    } else if (pricePerMillion < 0.5) {
        cheapModels.push(modelInfo);
    } else if (pricePerMillion < 5) {
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

console.log('='.repeat(100));
console.log('FREE MODELS (Perfect for Free Tier)');
console.log('='.repeat(100));
freeModels.slice(0, 20).forEach(m => {
    console.log(`\n${m.name}`);
    console.log(`  ID: ${m.id}`);
    console.log(`  Context: ${m.context_length.toLocaleString()} tokens`);
    console.log(`  Modality: ${m.modality}`);
});

console.log('\n\n' + '='.repeat(100));
console.log('CHEAP MODELS (<$0.50/M tokens - Good for Free/Basic Tier)');
console.log('='.repeat(100));
cheapModels.slice(0, 20).forEach(m => {
    console.log(`\n${m.name}`);
    console.log(`  ID: ${m.id}`);
    console.log(`  Price: $${m.avgPrice.toFixed(4)}/M tokens (prompt: $${m.promptPrice.toFixed(4)}, completion: $${m.completionPrice.toFixed(4)})`);
    console.log(`  Context: ${m.context_length.toLocaleString()} tokens`);
    console.log(`  Modality: ${m.modality}`);
});

console.log('\n\n' + '='.repeat(100));
console.log('MID-TIER MODELS ($0.50-$5/M tokens - Good for Basic Tier)');
console.log('='.repeat(100));
midTierModels.slice(0, 20).forEach(m => {
    console.log(`\n${m.name}`);
    console.log(`  ID: ${m.id}`);
    console.log(`  Price: $${m.avgPrice.toFixed(4)}/M tokens (prompt: $${m.promptPrice.toFixed(4)}, completion: $${m.completionPrice.toFixed(4)})`);
    console.log(`  Context: ${m.context_length.toLocaleString()} tokens`);
    console.log(`  Modality: ${m.modality}`);
});

console.log('\n\n' + '='.repeat(100));
console.log('PREMIUM MODELS (>$5/M tokens - Good for Pro Tier)');
console.log('='.repeat(100));
premiumModels.slice(0, 20).forEach(m => {
    console.log(`\n${m.name}`);
    console.log(`  ID: ${m.id}`);
    console.log(`  Price: $${m.avgPrice.toFixed(4)}/M tokens (prompt: $${m.promptPrice.toFixed(4)}, completion: $${m.completionPrice.toFixed(4)})`);
    console.log(`  Context: ${m.context_length.toLocaleString()} tokens`);
    console.log(`  Modality: ${m.modality}`);
});

console.log('\n\n' + '='.repeat(100));
console.log('SUMMARY');
console.log('='.repeat(100));
console.log(`Free models: ${freeModels.length}`);
console.log(`Cheap models (<$0.50): ${cheapModels.length}`);
console.log(`Mid-tier models ($0.50-$5): ${midTierModels.length}`);
console.log(`Premium models (>$5): ${premiumModels.length}`);

// Generate recommended models for each tier
console.log('\n\n' + '='.repeat(100));
console.log('RECOMMENDED MODELS FOR EACH TIER');
console.log('='.repeat(100));

console.log('\n--- FREE TIER (Best free models) ---');
const recommendedFree = freeModels
    .filter(m => m.modality === 'text->text' && m.context_length >= 8000)
    .slice(0, 5);
recommendedFree.forEach(m => {
    console.log(`  - ${m.name} (${m.id})`);
    console.log(`    Context: ${m.context_length.toLocaleString()} tokens`);
});

console.log('\n--- BASIC TIER (Best value models) ---');
const recommendedBasic = cheapModels
    .filter(m => m.modality === 'text->text' && m.context_length >= 8000)
    .slice(0, 8);
recommendedBasic.forEach(m => {
    console.log(`  - ${m.name} (${m.id})`);
    console.log(`    Price: $${m.avgPrice.toFixed(4)}/M tokens`);
    console.log(`    Context: ${m.context_length.toLocaleString()} tokens`);
});

console.log('\n--- PRO TIER (Premium models) ---');
const recommendedPro = [...midTierModels, ...premiumModels]
    .filter(m => m.modality === 'text->text' && m.context_length >= 8000)
    .sort((a, b) => b.avgPrice - a.avgPrice)
    .slice(0, 10);
recommendedPro.forEach(m => {
    console.log(`  - ${m.name} (${m.id})`);
    console.log(`    Price: $${m.avgPrice.toFixed(4)}/M tokens`);
    console.log(`    Context: ${m.context_length.toLocaleString()} tokens`);
});

#!/usr/bin/env node

/**
 * Blog Images Setup Script
 * 
 * This script helps you set up blog images by providing direct links
 * and instructions for each blog post.
 */

const blogPosts = [
    {
        slug: 'study-schedule-template',
        title: 'The Perfect Study Schedule Template',
        filename: 'study-schedule-template.jpg',
        searchTerms: ['study planner', 'calendar planning', 'student schedule', 'desk organization'],
        description: 'Student with planner and calendar on desk, organized study materials'
    },
    {
        slug: 'memory-palace-guide',
        title: 'Memory Palace Guide',
        filename: 'memory-palace-guide.jpg',
        searchTerms: ['memory palace', 'classical architecture', 'brain visualization', 'ancient building'],
        description: 'Classical architecture or brain with architectural overlay'
    },
    {
        slug: 'study-productivity-hacks',
        title: 'Study Productivity Hacks',
        filename: 'study-productivity-hacks.jpg',
        searchTerms: ['productivity study', 'focused student', 'time management', 'efficient studying'],
        description: 'Student focused on laptop with organized workspace'
    },
    {
        slug: 'spaced-repetition-guide',
        title: 'Spaced Repetition Guide',
        filename: 'spaced-repetition-guide.jpg',
        searchTerms: ['flashcards', 'study cards', 'memory cards', 'repetition learning'],
        description: 'Colorful flashcards or student reviewing study cards'
    },
    {
        slug: 'ai-study-tools-2025',
        title: 'AI Study Tools 2025',
        filename: 'ai-study-tools-2025.jpg',
        searchTerms: ['AI technology', 'artificial intelligence education', 'digital learning', 'tech study'],
        description: 'Laptop with AI interface or futuristic study setup'
    },
    {
        slug: 'how-to-focus-while-studying',
        title: 'How to Focus While Studying',
        filename: 'how-to-focus-while-studying.jpg',
        searchTerms: ['focused student', 'concentration', 'deep focus', 'studying alone'],
        description: 'Student in deep concentration, minimalist study space'
    },
    {
        slug: 'how-to-memorize-faster',
        title: 'How to Memorize Faster',
        filename: 'how-to-memorize-faster.jpg',
        searchTerms: ['memory techniques', 'brain power', 'fast learning', 'cognitive enhancement'],
        description: 'Brain with lightning effects or student with lightbulb moment'
    },
    {
        slug: 'active-learning-increases-retention',
        title: 'Active Learning Increases Retention',
        filename: 'active-learning-increases-retention.jpg',
        searchTerms: ['active learning', 'group study', 'interactive learning', 'student engagement'],
        description: 'Students in group discussion or interactive learning session'
    }
];

const stockPhotoSites = [
    {
        name: 'Unsplash',
        baseUrl: 'https://unsplash.com/s/photos/',
        quality: 'Highest',
        license: 'Free for commercial use'
    },
    {
        name: 'Pixabay',
        baseUrl: 'https://pixabay.com/images/search/',
        quality: 'High',
        license: 'Free for commercial use'
    },
    {
        name: 'Pexels',
        baseUrl: 'https://www.pexels.com/search/',
        quality: 'High',
        license: 'Free for commercial use'
    }
];

console.log('🖼️  Blog Images Setup Guide');
console.log('================================\n');

console.log('📋 Blog Posts Needing Images:');
console.log('------------------------------');

blogPosts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   File: ${post.filename}`);
    console.log(`   Description: ${post.description}`);
    console.log(`   Search Terms: ${post.searchTerms.join(', ')}`);

    console.log('   🔗 Direct Search Links:');
    stockPhotoSites.forEach(site => {
        const searchTerm = post.searchTerms[0].replace(/ /g, '%20');
        console.log(`   • ${site.name}: ${site.baseUrl}${searchTerm}`);
    });
    console.log('');
});

console.log('📐 Image Requirements:');
console.log('----------------------');
console.log('• Minimum size: 1200x630px (1.91:1 aspect ratio)');
console.log('• Format: JPG or PNG');
console.log('• File size: Under 500KB');
console.log('• High contrast and professional appearance');
console.log('');

console.log('📁 Installation Steps:');
console.log('----------------------');
console.log('1. Visit the search links above');
console.log('2. Download high-resolution images');
console.log('3. Rename files according to the filename shown');
console.log('4. Optimize/compress images to under 500KB');
console.log('5. Place files in: public/images/blog/');
console.log('6. Images will automatically be used by the blog posts');
console.log('');

console.log('🎨 Alternative: AI-Generated Images');
console.log('-----------------------------------');
console.log('You can also generate custom images using:');
console.log('• DALL-E 2/3 (OpenAI)');
console.log('• Midjourney');
console.log('• Stable Diffusion');
console.log('• Canva AI');
console.log('');

console.log('Example AI prompts:');
blogPosts.slice(0, 3).forEach(post => {
    console.log(`• "${post.description}, professional photography style, bright lighting"`);
});

console.log('\n✅ Once images are added, your blog will be fully illustrated!');
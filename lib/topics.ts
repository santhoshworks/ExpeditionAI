// Learning Topics Data for Programmatic SEO
// Each topic targets keywords like "learn [topic] with AI", "AI tutor for [topic]", "[topic] learning platform"

export interface LearningTopic {
    slug: string
    name: string
    description: string
    category: string
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
    icon: string // Lucide icon name
    relatedTopics: string[] // slugs of related topics
    learningOutcomes: string[]
    prerequisites: string[]
    estimatedHours: number
    popularQuestions: string[] // For FAQ schema
}

export const TOPIC_CATEGORIES = [
    'Mathematics',
    'Science',
    'Computer Science',
    'Languages',
    'Social Sciences',
    'Humanities',
    'Business',
    'Arts'
] as const

export type TopicCategory = typeof TOPIC_CATEGORIES[number]

export const LEARNING_TOPICS: LearningTopic[] = [
    {
        slug: 'calculus',
        name: 'Calculus',
        description: 'Master derivatives, integrals, limits, and differential equations with AI-powered explanations',
        category: 'Mathematics',
        difficulty: 'Intermediate',
        icon: 'Calculator',
        relatedTopics: ['linear-algebra', 'statistics', 'physics'],
        learningOutcomes: [
            'Understand limits and continuity',
            'Calculate derivatives using various rules',
            'Solve definite and indefinite integrals',
            'Apply calculus to real-world problems',
            'Master the fundamental theorem of calculus'
        ],
        prerequisites: ['Algebra', 'Trigonometry', 'Pre-calculus'],
        estimatedHours: 120,
        popularQuestions: [
            'What is the difference between a derivative and an integral?',
            'How do I solve limit problems step by step?',
            'When should I use integration by parts vs substitution?',
            'What are practical applications of calculus?'
        ]
    },
    {
        slug: 'organic-chemistry',
        name: 'Organic Chemistry',
        description: 'Understand reactions, mechanisms, synthesis pathways, and molecular structures',
        category: 'Science',
        difficulty: 'Advanced',
        icon: 'Atom',
        relatedTopics: ['biology', 'biochemistry', 'physics'],
        learningOutcomes: [
            'Draw and interpret molecular structures',
            'Predict reaction mechanisms and products',
            'Design multi-step synthesis pathways',
            'Understand stereochemistry and chirality',
            'Master functional group transformations'
        ],
        prerequisites: ['General Chemistry', 'Basic organic concepts'],
        estimatedHours: 150,
        popularQuestions: [
            'How do I predict the product of an organic reaction?',
            'What are the best ways to memorize reaction mechanisms?',
            'How does stereochemistry affect drug effectiveness?',
            'What is the difference between SN1 and SN2 reactions?'
        ]
    },
    {
        slug: 'machine-learning',
        name: 'Machine Learning',
        description: 'Learn algorithms, neural networks, deep learning, and AI fundamentals from scratch',
        category: 'Computer Science',
        difficulty: 'Intermediate',
        icon: 'Brain',
        relatedTopics: ['python-programming', 'statistics', 'linear-algebra'],
        learningOutcomes: [
            'Understand supervised and unsupervised learning',
            'Implement common ML algorithms from scratch',
            'Build and train neural networks',
            'Evaluate and optimize model performance',
            'Apply ML to real-world datasets'
        ],
        prerequisites: ['Python programming', 'Linear algebra basics', 'Statistics'],
        estimatedHours: 200,
        popularQuestions: [
            'What is the difference between machine learning and deep learning?',
            'How do I choose the right algorithm for my problem?',
            'What is overfitting and how do I prevent it?',
            'How much math do I need for machine learning?'
        ]
    },
    {
        slug: 'spanish',
        name: 'Spanish',
        description: 'Learn Spanish vocabulary, grammar, conversation skills, and cultural context',
        category: 'Languages',
        difficulty: 'Beginner',
        icon: 'Languages',
        relatedTopics: ['french', 'portuguese', 'italian'],
        learningOutcomes: [
            'Hold basic conversations in Spanish',
            'Understand Spanish grammar structure',
            'Read and write at intermediate level',
            'Comprehend native speaker conversations',
            'Appreciate Hispanic culture and idioms'
        ],
        prerequisites: ['None - beginner friendly'],
        estimatedHours: 300,
        popularQuestions: [
            'How long does it take to become fluent in Spanish?',
            'What is the difference between ser and estar?',
            'How can I improve my Spanish pronunciation?',
            'Should I learn Castilian or Latin American Spanish?'
        ]
    },
    {
        slug: 'economics',
        name: 'Economics',
        description: 'Understand micro and macro economics principles, market dynamics, and economic theory',
        category: 'Social Sciences',
        difficulty: 'Intermediate',
        icon: 'TrendingUp',
        relatedTopics: ['statistics', 'business-strategy', 'psychology'],
        learningOutcomes: [
            'Analyze supply and demand curves',
            'Understand monetary and fiscal policy',
            'Evaluate market structures and competition',
            'Apply economic models to real scenarios',
            'Interpret economic indicators and data'
        ],
        prerequisites: ['Basic math', 'Critical thinking'],
        estimatedHours: 100,
        popularQuestions: [
            'What causes inflation and how is it controlled?',
            'How do interest rates affect the economy?',
            'What is the difference between micro and macroeconomics?',
            'How do supply and demand determine prices?'
        ]
    },
    {
        slug: 'python-programming',
        name: 'Python Programming',
        description: 'Learn Python from basics to advanced concepts including data science and web development',
        category: 'Computer Science',
        difficulty: 'Beginner',
        icon: 'Code',
        relatedTopics: ['machine-learning', 'data-science', 'web-development'],
        learningOutcomes: [
            'Write clean, efficient Python code',
            'Work with data structures and algorithms',
            'Build web applications with Python frameworks',
            'Automate tasks with Python scripts',
            'Use Python for data analysis and visualization'
        ],
        prerequisites: ['None - beginner friendly'],
        estimatedHours: 150,
        popularQuestions: [
            'Is Python good for beginners?',
            'How long does it take to learn Python?',
            'What can I build with Python?',
            'Should I learn Python 2 or Python 3?'
        ]
    },
    {
        slug: 'physics',
        name: 'Physics',
        description: 'Explore mechanics, thermodynamics, electromagnetism, and modern physics concepts',
        category: 'Science',
        difficulty: 'Intermediate',
        icon: 'Zap',
        relatedTopics: ['calculus', 'chemistry', 'astronomy'],
        learningOutcomes: [
            'Apply Newton\'s laws to solve problems',
            'Understand energy and momentum conservation',
            'Analyze electric and magnetic fields',
            'Grasp quantum mechanics basics',
            'Solve complex physics problems systematically'
        ],
        prerequisites: ['Algebra', 'Trigonometry', 'Basic calculus helpful'],
        estimatedHours: 180,
        popularQuestions: [
            'What is the best way to approach physics problems?',
            'How are physics and mathematics related?',
            'What is quantum physics in simple terms?',
            'Why is physics considered difficult?'
        ]
    },
    {
        slug: 'statistics',
        name: 'Statistics',
        description: 'Master probability, statistical inference, hypothesis testing, and data analysis',
        category: 'Mathematics',
        difficulty: 'Intermediate',
        icon: 'BarChart3',
        relatedTopics: ['calculus', 'machine-learning', 'economics'],
        learningOutcomes: [
            'Calculate and interpret probabilities',
            'Perform hypothesis tests correctly',
            'Build and interpret regression models',
            'Analyze data distributions',
            'Make data-driven decisions'
        ],
        prerequisites: ['Basic algebra', 'Arithmetic'],
        estimatedHours: 100,
        popularQuestions: [
            'What is the difference between mean, median, and mode?',
            'How do I interpret a p-value?',
            'When should I use which statistical test?',
            'What is the central limit theorem?'
        ]
    },
    {
        slug: 'biology',
        name: 'Biology',
        description: 'Study cell biology, genetics, evolution, ecology, and human anatomy',
        category: 'Science',
        difficulty: 'Intermediate',
        icon: 'Dna',
        relatedTopics: ['organic-chemistry', 'biochemistry', 'psychology'],
        learningOutcomes: [
            'Understand cellular processes and structures',
            'Explain genetic inheritance patterns',
            'Describe evolutionary mechanisms',
            'Analyze ecological relationships',
            'Apply biological concepts to health'
        ],
        prerequisites: ['Basic chemistry helpful'],
        estimatedHours: 120,
        popularQuestions: [
            'How does DNA replication work?',
            'What is the difference between mitosis and meiosis?',
            'How does evolution work?',
            'What are the main cell organelles and their functions?'
        ]
    },
    {
        slug: 'linear-algebra',
        name: 'Linear Algebra',
        description: 'Learn vectors, matrices, transformations, eigenvalues, and applications in ML/graphics',
        category: 'Mathematics',
        difficulty: 'Intermediate',
        icon: 'Grid3x3',
        relatedTopics: ['calculus', 'machine-learning', 'statistics'],
        learningOutcomes: [
            'Perform matrix operations fluently',
            'Understand vector spaces and subspaces',
            'Calculate eigenvalues and eigenvectors',
            'Apply linear transformations',
            'Use linear algebra in machine learning'
        ],
        prerequisites: ['Basic algebra', 'Some calculus helpful'],
        estimatedHours: 80,
        popularQuestions: [
            'Why is linear algebra important for machine learning?',
            'What is an eigenvalue in simple terms?',
            'How do I visualize high-dimensional vectors?',
            'What is the difference between a matrix and a tensor?'
        ]
    },
    {
        slug: 'psychology',
        name: 'Psychology',
        description: 'Explore cognitive psychology, behavioral science, developmental psychology, and mental health',
        category: 'Social Sciences',
        difficulty: 'Beginner',
        icon: 'Brain',
        relatedTopics: ['biology', 'philosophy', 'economics'],
        learningOutcomes: [
            'Understand major psychological theories',
            'Analyze human behavior patterns',
            'Recognize cognitive biases',
            'Apply psychological principles to everyday life',
            'Understand mental health fundamentals'
        ],
        prerequisites: ['None - beginner friendly'],
        estimatedHours: 100,
        popularQuestions: [
            'What is the difference between psychology and psychiatry?',
            'How do cognitive biases affect decision-making?',
            'What are the main schools of psychological thought?',
            'How does memory actually work?'
        ]
    },
    {
        slug: 'world-history',
        name: 'World History',
        description: 'Journey through ancient civilizations, modern revolutions, and global historical events',
        category: 'Humanities',
        difficulty: 'Beginner',
        icon: 'Globe',
        relatedTopics: ['philosophy', 'economics', 'geography'],
        learningOutcomes: [
            'Understand major historical periods',
            'Analyze causes and effects of historical events',
            'Connect historical patterns to modern issues',
            'Evaluate historical sources critically',
            'Appreciate diverse cultural perspectives'
        ],
        prerequisites: ['None - beginner friendly'],
        estimatedHours: 150,
        popularQuestions: [
            'What caused World War I and II?',
            'How did ancient civilizations influence modern society?',
            'What was the Industrial Revolution and why does it matter?',
            'How do historians know what happened in the past?'
        ]
    },
    {
        slug: 'philosophy',
        name: 'Philosophy',
        description: 'Explore ethics, logic, metaphysics, epistemology, and the great philosophical traditions',
        category: 'Humanities',
        difficulty: 'Intermediate',
        icon: 'Lightbulb',
        relatedTopics: ['psychology', 'world-history', 'ethics'],
        learningOutcomes: [
            'Construct and analyze logical arguments',
            'Understand major philosophical schools',
            'Apply ethical frameworks to dilemmas',
            'Question assumptions critically',
            'Engage with complex abstract concepts'
        ],
        prerequisites: ['Critical thinking skills'],
        estimatedHours: 120,
        popularQuestions: [
            'What is the meaning of life according to different philosophers?',
            'What is the difference between ethics and morality?',
            'How do I improve my critical thinking skills?',
            'What are the main branches of philosophy?'
        ]
    },
    {
        slug: 'creative-writing',
        name: 'Creative Writing',
        description: 'Develop storytelling skills, narrative techniques, poetry, and creative expression',
        category: 'Arts',
        difficulty: 'Beginner',
        icon: 'PenTool',
        relatedTopics: ['english-literature', 'journalism', 'philosophy'],
        learningOutcomes: [
            'Craft compelling narratives and plots',
            'Develop memorable characters',
            'Master dialogue and voice',
            'Experiment with different writing styles',
            'Edit and revise work effectively'
        ],
        prerequisites: ['Basic writing skills'],
        estimatedHours: 100,
        popularQuestions: [
            'How do I overcome writer\'s block?',
            'What makes a story compelling?',
            'Should I outline before writing or just start?',
            'How do I create believable characters?'
        ]
    },
    {
        slug: 'business-strategy',
        name: 'Business Strategy',
        description: 'Learn strategic planning, competitive analysis, business models, and management principles',
        category: 'Business',
        difficulty: 'Intermediate',
        icon: 'Target',
        relatedTopics: ['economics', 'marketing', 'finance'],
        learningOutcomes: [
            'Analyze competitive landscapes',
            'Develop strategic business plans',
            'Evaluate business model viability',
            'Make data-driven business decisions',
            'Understand organizational dynamics'
        ],
        prerequisites: ['Basic business knowledge helpful'],
        estimatedHours: 80,
        popularQuestions: [
            'What is Porter\'s Five Forces model?',
            'How do I create a business strategy from scratch?',
            'What makes a business model sustainable?',
            'How do successful companies maintain competitive advantage?'
        ]
    },
    {
        slug: 'french',
        name: 'French',
        description: 'Learn French vocabulary, grammar, pronunciation, and Francophone culture',
        category: 'Languages',
        difficulty: 'Beginner',
        icon: 'Languages',
        relatedTopics: ['spanish', 'italian', 'english-literature'],
        learningOutcomes: [
            'Communicate in everyday French situations',
            'Understand French grammar rules',
            'Read French texts with comprehension',
            'Appreciate French culture and history',
            'Develop natural French pronunciation'
        ],
        prerequisites: ['None - beginner friendly'],
        estimatedHours: 350,
        popularQuestions: [
            'Is French harder to learn than Spanish?',
            'How do I learn French verb conjugations?',
            'What is the best way to practice French pronunciation?',
            'How long until I can watch French movies without subtitles?'
        ]
    },
    {
        slug: 'data-science',
        name: 'Data Science',
        description: 'Master data analysis, visualization, machine learning, and statistical modeling',
        category: 'Computer Science',
        difficulty: 'Intermediate',
        icon: 'Database',
        relatedTopics: ['python-programming', 'statistics', 'machine-learning'],
        learningOutcomes: [
            'Clean and preprocess real-world datasets',
            'Create insightful data visualizations',
            'Build predictive models',
            'Communicate data findings effectively',
            'Apply statistical methods to business problems'
        ],
        prerequisites: ['Basic programming', 'Statistics fundamentals'],
        estimatedHours: 200,
        popularQuestions: [
            'What is the difference between data science and data analytics?',
            'What tools do data scientists use most?',
            'How do I build a data science portfolio?',
            'Is data science still in demand?'
        ]
    },
    {
        slug: 'music-theory',
        name: 'Music Theory',
        description: 'Understand harmony, melody, rhythm, scales, chord progressions, and composition',
        category: 'Arts',
        difficulty: 'Beginner',
        icon: 'Music',
        relatedTopics: ['creative-writing', 'physics', 'psychology'],
        learningOutcomes: [
            'Read and write musical notation',
            'Understand chord construction and progressions',
            'Analyze musical form and structure',
            'Apply music theory to composition',
            'Develop ear training skills'
        ],
        prerequisites: ['None - beginner friendly'],
        estimatedHours: 100,
        popularQuestions: [
            'Why do some chord progressions sound better than others?',
            'How do I learn to read sheet music?',
            'What is the circle of fifths?',
            'How do I start writing my own music?'
        ]
    },
    {
        slug: 'astronomy',
        name: 'Astronomy',
        description: 'Explore stars, planets, galaxies, cosmology, and the mysteries of the universe',
        category: 'Science',
        difficulty: 'Beginner',
        icon: 'Star',
        relatedTopics: ['physics', 'mathematics', 'chemistry'],
        learningOutcomes: [
            'Understand the life cycle of stars',
            'Explain planetary motion and orbits',
            'Describe the structure of the universe',
            'Interpret astronomical observations',
            'Appreciate the scale of cosmic phenomena'
        ],
        prerequisites: ['Basic math and physics helpful'],
        estimatedHours: 80,
        popularQuestions: [
            'How big is the universe?',
            'What happens when a star dies?',
            'Are there other planets like Earth?',
            'What is dark matter and dark energy?'
        ]
    },
    {
        slug: 'web-development',
        name: 'Web Development',
        description: 'Build modern websites and web applications with HTML, CSS, JavaScript, and frameworks',
        category: 'Computer Science',
        difficulty: 'Beginner',
        icon: 'Globe',
        relatedTopics: ['python-programming', 'data-science', 'ui-design'],
        learningOutcomes: [
            'Build responsive websites from scratch',
            'Master HTML, CSS, and JavaScript',
            'Work with modern frameworks like React',
            'Understand web hosting and deployment',
            'Create full-stack web applications'
        ],
        prerequisites: ['Basic computer skills'],
        estimatedHours: 250,
        popularQuestions: [
            'What programming language should I learn first for web development?',
            'Is web development hard to learn?',
            'What is the difference between frontend and backend?',
            'How do I become a full-stack developer?'
        ]
    }
]

// Helper functions
export function getTopicBySlug(slug: string): LearningTopic | undefined {
    return LEARNING_TOPICS.find(topic => topic.slug === slug)
}

export function getTopicsByCategory(category: string): LearningTopic[] {
    return LEARNING_TOPICS.filter(topic => topic.category === category)
}

export function getRelatedTopics(slug: string): LearningTopic[] {
    const topic = getTopicBySlug(slug)
    if (!topic) return []
    return topic.relatedTopics
        .map(relatedSlug => getTopicBySlug(relatedSlug))
        .filter((t): t is LearningTopic => t !== undefined)
}

export function getAllCategories(): string[] {
    return [...new Set(LEARNING_TOPICS.map(topic => topic.category))]
}

export function getTopicCount(): number {
    return LEARNING_TOPICS.length
}

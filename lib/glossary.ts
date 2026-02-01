export interface GlossaryTerm {
    slug: string
    term: string
    definition: string
    relatedTerms?: string[]
    category: 'Learning Science' | 'AI & Technology' | 'Study Techniques' | 'Education'
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
    {
        slug: 'spaced-repetition',
        term: 'Spaced Repetition',
        definition: 'A learning technique that involves reviewing information at gradually increasing intervals to improve long-term memory retention. This method is based on the spacing effect, which shows that learning is more effective when spread out over time rather than concentrated in a single session.',
        relatedTerms: ['active-recall', 'memory-consolidation', 'retrieval-practice'],
        category: 'Learning Science'
    },
    {
        slug: 'active-recall',
        term: 'Active Recall',
        definition: 'A study method that involves actively stimulating memory during the learning process by testing yourself on the material rather than passively reviewing it. This technique strengthens neural pathways and leads to better long-term retention compared to passive reading or highlighting.',
        relatedTerms: ['spaced-repetition', 'retrieval-practice', 'metacognition'],
        category: 'Learning Science'
    },
    {
        slug: 'cognitive-load',
        term: 'Cognitive Load',
        definition: 'The total amount of mental effort being used in working memory at any given time. Cognitive load theory suggests that learning is most effective when instructional design considers the limitations of working memory and minimizes unnecessary mental burden.',
        relatedTerms: ['chunking', 'working-memory', 'intrinsic-load'],
        category: 'Learning Science'
    },
    {
        slug: 'interleaving',
        term: 'Interleaving',
        definition: 'A learning strategy that involves mixing different topics, subjects, or types of problems during study sessions rather than focusing on one topic at a time (blocking). Research shows interleaving leads to better long-term retention and improved ability to distinguish between concepts.',
        relatedTerms: ['spaced-repetition', 'desirable-difficulties', 'transfer-learning'],
        category: 'Study Techniques'
    },
    {
        slug: 'elaboration',
        term: 'Elaboration',
        definition: 'A learning technique that involves explaining and describing ideas with many details, making connections to prior knowledge, and asking "how" and "why" questions. Elaboration creates multiple pathways to the information in memory, making it easier to retrieve.',
        relatedTerms: ['active-recall', 'knowledge-mapping', 'deep-processing'],
        category: 'Study Techniques'
    },
    {
        slug: 'metacognition',
        term: 'Metacognition',
        definition: 'The awareness and understanding of one\'s own thought processes, often described as "thinking about thinking." Metacognition involves monitoring your learning, recognizing when you do and don\'t understand something, and knowing which strategies to apply to improve comprehension.',
        relatedTerms: ['self-regulated-learning', 'active-recall', 'growth-mindset'],
        category: 'Learning Science'
    },
    {
        slug: 'chunking',
        term: 'Chunking',
        definition: 'A memory strategy that involves breaking down large amounts of information into smaller, manageable units or "chunks." By organizing information into meaningful groups, chunking reduces cognitive load and makes it easier to store and retrieve information from long-term memory.',
        relatedTerms: ['cognitive-load', 'working-memory', 'knowledge-mapping'],
        category: 'Study Techniques'
    },
    {
        slug: 'neural-plasticity',
        term: 'Neural Plasticity',
        definition: 'The brain\'s ability to reorganize itself by forming new neural connections throughout life. Also known as neuroplasticity, this property allows the brain to adapt to new experiences, learn new information, and recover from injury. It is the biological basis for all learning.',
        relatedTerms: ['memory-consolidation', 'long-term-potentiation', 'growth-mindset'],
        category: 'Learning Science'
    },
    {
        slug: 'large-language-model',
        term: 'Large Language Model (LLM)',
        definition: 'A type of artificial intelligence model trained on vast amounts of text data to understand and generate human-like text. LLMs like GPT-4 and Claude can perform various language tasks including answering questions, writing content, and engaging in educational conversations.',
        relatedTerms: ['prompt-engineering', 'ai-tutor', 'natural-language-processing'],
        category: 'AI & Technology'
    },
    {
        slug: 'prompt-engineering',
        term: 'Prompt Engineering',
        definition: 'The practice of designing and optimizing text inputs (prompts) to get desired outputs from AI language models. Effective prompt engineering involves understanding how to structure questions and instructions to elicit accurate, relevant, and useful responses from AI systems.',
        relatedTerms: ['large-language-model', 'ai-tutor', 'conversational-ai'],
        category: 'AI & Technology'
    },
    {
        slug: 'branching-learning',
        term: 'Branching Learning',
        definition: 'An educational approach where learners can explore different paths or topics based on their interests and needs, similar to how knowledge naturally branches into related subtopics. This non-linear learning style allows for personalized, depth-first exploration of subjects.',
        relatedTerms: ['knowledge-mapping', 'personalized-learning', 'adaptive-learning'],
        category: 'Education'
    },
    {
        slug: 'knowledge-mapping',
        term: 'Knowledge Mapping',
        definition: 'The process of visually representing information, concepts, and their relationships in a structured diagram or map. Knowledge maps help learners see the big picture, understand how ideas connect, and identify gaps in their understanding.',
        relatedTerms: ['branching-learning', 'chunking', 'concept-map'],
        category: 'Study Techniques'
    },
    {
        slug: 'retrieval-practice',
        term: 'Retrieval Practice',
        definition: 'The act of recalling information from memory, which strengthens learning more effectively than simply reviewing material. Each successful retrieval makes the memory stronger and easier to access in the future. This is the core mechanism behind flashcards and practice tests.',
        relatedTerms: ['active-recall', 'spaced-repetition', 'testing-effect'],
        category: 'Learning Science'
    },
    {
        slug: 'memory-consolidation',
        term: 'Memory Consolidation',
        definition: 'The process by which short-term memories are converted into stable, long-term memories. This process occurs primarily during sleep and involves the strengthening of neural connections. Adequate rest and spaced learning sessions support better memory consolidation.',
        relatedTerms: ['spaced-repetition', 'neural-plasticity', 'sleep-learning'],
        category: 'Learning Science'
    },
    {
        slug: 'personalized-learning',
        term: 'Personalized Learning',
        definition: 'An educational approach that tailors instruction, content, pace, and learning paths to individual learners\' needs, strengths, and interests. AI-powered platforms can provide personalized learning experiences by adapting to each student\'s progress and preferences.',
        relatedTerms: ['adaptive-learning', 'branching-learning', 'ai-tutor'],
        category: 'Education'
    },
    {
        slug: 'adaptive-learning',
        term: 'Adaptive Learning',
        definition: 'Technology-driven educational systems that adjust the difficulty, content, and pace of instruction based on a learner\'s performance and behavior. Adaptive learning platforms use algorithms to provide customized learning experiences that meet each student where they are.',
        relatedTerms: ['personalized-learning', 'ai-tutor', 'learning-analytics'],
        category: 'Education'
    },
    {
        slug: 'ai-tutor',
        term: 'AI Tutor',
        definition: 'An artificial intelligence system designed to provide personalized instruction and support to learners. AI tutors can answer questions, explain concepts, provide practice problems, and adapt their teaching approach based on the learner\'s needs and progress.',
        relatedTerms: ['large-language-model', 'personalized-learning', 'adaptive-learning'],
        category: 'AI & Technology'
    },
    {
        slug: 'desirable-difficulties',
        term: 'Desirable Difficulties',
        definition: 'Learning conditions that make the initial learning process more challenging but lead to better long-term retention and transfer. Examples include spacing practice sessions, interleaving topics, and testing yourself rather than rereading material.',
        relatedTerms: ['interleaving', 'spaced-repetition', 'retrieval-practice'],
        category: 'Learning Science'
    },
    {
        slug: 'growth-mindset',
        term: 'Growth Mindset',
        definition: 'The belief that abilities and intelligence can be developed through dedication, hard work, and learning from failures. Coined by psychologist Carol Dweck, a growth mindset contrasts with a fixed mindset and is associated with greater motivation, resilience, and academic achievement.',
        relatedTerms: ['metacognition', 'self-regulated-learning', 'neural-plasticity'],
        category: 'Learning Science'
    },
    {
        slug: 'self-regulated-learning',
        term: 'Self-Regulated Learning',
        definition: 'The process by which learners actively monitor and control their own learning through goal-setting, strategy selection, self-monitoring, and self-evaluation. Self-regulated learners take ownership of their education and adapt their approaches based on results.',
        relatedTerms: ['metacognition', 'growth-mindset', 'active-recall'],
        category: 'Education'
    },
    {
        slug: 'learning-analytics',
        term: 'Learning Analytics',
        definition: 'The measurement, collection, analysis, and reporting of data about learners and their contexts to understand and optimize learning. Learning analytics help educators and AI systems identify patterns, predict outcomes, and personalize instruction.',
        relatedTerms: ['adaptive-learning', 'ai-tutor', 'personalized-learning'],
        category: 'AI & Technology'
    },
    {
        slug: 'concept-map',
        term: 'Concept Map',
        definition: 'A visual diagram that shows relationships between concepts, with nodes representing ideas and connecting lines or arrows showing how they relate. Concept maps help learners organize knowledge, see the big picture, and identify connections between topics.',
        relatedTerms: ['knowledge-mapping', 'chunking', 'elaboration'],
        category: 'Study Techniques'
    },
    {
        slug: 'transfer-learning',
        term: 'Transfer Learning',
        definition: 'The ability to apply knowledge or skills learned in one context to new, different situations. Transfer is a key goal of education, as it enables learners to use what they know flexibly rather than only in the specific situations where it was learned.',
        relatedTerms: ['interleaving', 'elaboration', 'deep-processing'],
        category: 'Learning Science'
    },
    {
        slug: 'working-memory',
        term: 'Working Memory',
        definition: 'The cognitive system responsible for temporarily holding and manipulating information needed for complex tasks like learning, reasoning, and comprehension. Working memory has limited capacity, which is why chunking and reducing cognitive load are important for learning.',
        relatedTerms: ['cognitive-load', 'chunking', 'memory-consolidation'],
        category: 'Learning Science'
    },
    {
        slug: 'test-anxiety',
        term: 'Test Anxiety',
        definition: 'The experience of intense worry, nervousness, and physical discomfort before or during exams. Test anxiety can cause students to freeze up, forget material they knew, and perform below their abilities. Understanding that test anxiety is a common response to pressure—not a reflection of intelligence—is the first step to managing it.',
        relatedTerms: ['metacognition', 'growth-mindset', 'self-regulated-learning'],
        category: 'Learning Science'
    },
    {
        slug: 'math-anxiety',
        term: 'Math Anxiety',
        definition: 'A feeling of tension, apprehension, or fear that interferes with math performance. Math anxiety often stems from negative past experiences or the belief that mathematical ability is fixed. Research shows that math anxiety can be overcome through building foundational understanding, celebrating small wins, and reframing mistakes as learning opportunities.',
        relatedTerms: ['growth-mindset', 'cognitive-load', 'test-anxiety'],
        category: 'Learning Science'
    },
    {
        slug: 'learning-plateau',
        term: 'Learning Plateau',
        definition: 'A period during learning when progress seems to stall despite continued effort. Plateaus are a normal part of skill development and often precede breakthroughs. They typically indicate that the brain is consolidating knowledge or that new learning strategies are needed to reach the next level.',
        relatedTerms: ['desirable-difficulties', 'neural-plasticity', 'spaced-repetition'],
        category: 'Learning Science'
    },
    {
        slug: 'foundational-gaps',
        term: 'Foundational Gaps',
        definition: 'Missing prerequisite knowledge that blocks understanding of more advanced concepts. When learning feels impossibly difficult, foundational gaps are often the cause. Identifying and filling these gaps—rather than pushing forward—is usually the fastest path to real understanding.',
        relatedTerms: ['chunking', 'adaptive-learning', 'personalized-learning'],
        category: 'Education'
    },
    {
        slug: 'aha-moment',
        term: 'Aha Moment',
        definition: 'The sudden flash of insight when a concept finally \'clicks\' and makes sense. Also called an insight or eureka moment, these breakthroughs occur when the brain successfully connects new information to existing knowledge. Creating conditions for aha moments—through exploration, questioning, and active engagement—is more effective than passive review.',
        relatedTerms: ['elaboration', 'neural-plasticity', 'active-recall'],
        category: 'Learning Science'
    },
    {
        slug: 'study-burnout',
        term: 'Study Burnout',
        definition: 'A state of mental, emotional, and physical exhaustion from prolonged or intense studying without adequate rest. Symptoms include decreased motivation, difficulty concentrating, and feeling overwhelmed. Preventing burnout requires balancing effort with recovery—the brain consolidates learning during rest, not during cramming.',
        relatedTerms: ['memory-consolidation', 'spaced-repetition', 'self-regulated-learning'],
        category: 'Learning Science'
    },
    {
        slug: 'imposter-syndrome',
        term: 'Imposter Syndrome in Learning',
        definition: 'The persistent feeling of being a fraud or not belonging, despite evidence of competence. In academic settings, imposter syndrome causes students to attribute success to luck and failures to ability. Recognizing that struggle is a normal part of learning—not proof of inadequacy—helps combat these feelings.',
        relatedTerms: ['growth-mindset', 'metacognition', 'self-regulated-learning'],
        category: 'Learning Science'
    },
    {
        slug: 'passive-learning',
        term: 'Passive Learning',
        definition: 'Learning activities where the learner receives information without actively engaging with it, such as reading, highlighting, or watching lectures. Research consistently shows that passive learning is far less effective than active approaches like self-testing, teaching others, or solving problems. The feeling of familiarity from passive review often creates an illusion of learning.',
        relatedTerms: ['active-recall', 'retrieval-practice', 'desirable-difficulties'],
        category: 'Study Techniques'
    }
]

// Helper function to get a term by slug
export function getTermBySlug(slug: string): GlossaryTerm | undefined {
    return GLOSSARY_TERMS.find(term => term.slug === slug)
}

// Helper function to get all terms sorted alphabetically
export function getAllTermsSorted(): GlossaryTerm[] {
    return [...GLOSSARY_TERMS].sort((a, b) => a.term.localeCompare(b.term))
}

// Helper function to get terms by category
export function getTermsByCategory(category: GlossaryTerm['category']): GlossaryTerm[] {
    return GLOSSARY_TERMS.filter(term => term.category === category)
}

// Helper function to get all unique categories
export function getAllCategories(): GlossaryTerm['category'][] {
    return [...new Set(GLOSSARY_TERMS.map(term => term.category))].sort()
}

// Helper function to get related terms as full objects
export function getRelatedTerms(slug: string): GlossaryTerm[] {
    const term = getTermBySlug(slug)
    if (!term || !term.relatedTerms) return []

    return term.relatedTerms
        .map(relatedSlug => getTermBySlug(relatedSlug))
        .filter((t): t is GlossaryTerm => t !== undefined)
}

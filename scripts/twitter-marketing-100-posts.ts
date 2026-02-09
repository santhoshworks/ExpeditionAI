// scripts/twitter-marketing-100-posts.ts
// Generates 100 Twitter posts following best practices for SaaS/EdTech marketing

import ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";

// ============================================
// CONFIGURATION
// ============================================

const WEBSITE_URL = "thoughtmap.space";
const PRODUCT_NAME = "ThoughtMap";

// Available images in public folder (can be attached to posts)
const AVAILABLE_IMAGES = [
  { file: "Dashboard.jpeg", description: "Dashboard overview" },
  { file: "GenerateTopics.jpeg", description: "Topic generation feature" },
  { file: "available_models.jpeg", description: "AI models selection" },
  { file: "chat_interface_screenshot.jpeg", description: "Chat interface" },
  { file: "create_journal.jpeg", description: "Journal creation" },
  { file: "creating_new_trails.jpeg", description: "Trail branching feature" },
  { file: "expedition_page.jpeg", description: "Expedition overview" },
  { file: "expedition_with_trails_example.jpeg", description: "Learning trails example" },
  { file: "flags_to_track_progress.jpeg", description: "Progress tracking" },
  { file: "generate_new_topics.jpeg", description: "New topics generation" },
  { file: "generate_quiz.jpeg", description: "Quiz generation feature" },
  { file: "learning_wishlist.jpeg", description: "Learning wishlist" },
  { file: "quick_check_tooltip.jpeg", description: "Quick check feature" },
  { file: "start_new_expedition.jpeg", description: "Starting new expedition" },
  { file: "start_new_exploration.jpeg", description: "Exploration start" },
];

// Target ICPs
const TARGET_ICPS = [
  "students",
  "researchers",
  "developers",
  "professionals",
  "lifelong_learners",
  "educators",
];

// Twitter/X Communities for maximum visibility
// These are real communities where EdTech/learning content performs well
const TWITTER_COMMUNITIES = {
  // Education & Learning Communities
  edu_general: {
    name: "EduTwitter",
    hashtag: "#EduTwitter",
    description: "General education community - teachers, students, EdTech",
    bestFor: ["learning_tips", "student_life", "knowledge_building", "educators"],
    audienceSize: "Large",
  },
  edtech: {
    name: "EdTech Community",
    hashtag: "#EdTech",
    description: "Education technology enthusiasts and professionals",
    bestFor: ["tech_learning", "feature_highlight", "productivity_hacks"],
    audienceSize: "Large",
  },
  academic: {
    name: "Academic Twitter",
    hashtag: "#AcademicChatter",
    description: "Researchers, PhD students, academics",
    bestFor: ["curiosity_insights", "knowledge_building", "student_life"],
    audienceSize: "Medium",
  },
  study_with_me: {
    name: "Study Community",
    hashtag: "#StudyWithMe",
    description: "Students sharing study sessions and tips",
    bestFor: ["student_life", "productivity_hacks", "learning_tips"],
    audienceSize: "Large",
  },

  // Tech & Developer Communities
  build_in_public: {
    name: "Build In Public",
    hashtag: "#BuildInPublic",
    description: "Indie hackers and makers sharing their journey",
    bestFor: ["build_in_public", "subtle_product", "feature_highlight"],
    audienceSize: "Large",
  },
  indie_hackers: {
    name: "Indie Hackers",
    hashtag: "#IndieHacker",
    description: "Solo founders and bootstrapped startups",
    bestFor: ["build_in_public", "testimonial_style", "feature_highlight"],
    audienceSize: "Medium",
  },
  dev_community: {
    name: "Dev Community",
    hashtag: "#DevCommunity",
    description: "Software developers learning and sharing",
    bestFor: ["tech_learning", "productivity_hacks", "curiosity_insights"],
    audienceSize: "Large",
  },
  learn_to_code: {
    name: "Learn To Code",
    hashtag: "#LearnToCode",
    description: "People learning programming",
    bestFor: ["tech_learning", "learning_tips", "curiosity_insights"],
    audienceSize: "Medium",
  },

  // AI & Future of Learning
  ai_community: {
    name: "AI Twitter",
    hashtag: "#AITwitter",
    description: "AI enthusiasts and practitioners",
    bestFor: ["feature_highlight", "subtle_product", "tech_learning"],
    audienceSize: "Large",
  },
  future_of_work: {
    name: "Future of Learning",
    hashtag: "#FutureOfLearning",
    description: "Forward-thinking educators and learners",
    bestFor: ["curiosity_insights", "subtle_product", "knowledge_building"],
    audienceSize: "Small",
  },

  // Productivity & Self-Improvement
  productivity: {
    name: "Productivity Twitter",
    hashtag: "#ProductivityTips",
    description: "Productivity enthusiasts and life hackers",
    bestFor: ["productivity_hacks", "learning_tips", "knowledge_building"],
    audienceSize: "Medium",
  },
  growth_mindset: {
    name: "Growth Mindset",
    hashtag: "#GrowthMindset",
    description: "Personal development and continuous learning",
    bestFor: ["curiosity_insights", "learning_tips", "engagement_questions"],
    audienceSize: "Medium",
  },
};

// Function to recommend communities for a post category
function getRecommendedCommunities(category: string): string[] {
  const recommended: string[] = [];

  Object.entries(TWITTER_COMMUNITIES).forEach(([key, community]) => {
    if (community.bestFor.includes(category)) {
      recommended.push(community.name);
    }
  });

  // Return top 3 communities, prioritizing by audience size
  return recommended.slice(0, 3);
}

// Get primary community hashtag for a category
function getPrimaryCommunityHashtag(category: string): string {
  const communityPriority: Record<string, string> = {
    learning_tips: "#EduTwitter",
    curiosity_insights: "#AcademicChatter",
    productivity_hacks: "#ProductivityTips",
    knowledge_building: "#EduTwitter",
    student_life: "#StudyWithMe",
    tech_learning: "#DevCommunity",
    engagement_questions: "#EduTwitter",
    subtle_product: "#BuildInPublic",
    build_in_public: "#BuildInPublic",
    feature_highlight: "#EdTech",
    testimonial_style: "#EdTech",
  };

  return communityPriority[category] || "#LearningTwitter";
}

// Content categories following 80/20 rule
// 80 value posts + 20 promotional posts
const CONTENT_CATEGORIES = {
  // VALUE POSTS (80%)
  learning_tips: 20,           // General learning tips (no product mention)
  curiosity_insights: 15,      // Observations about curiosity and learning
  productivity_hacks: 10,      // Study/work productivity tips
  knowledge_building: 10,      // How to build lasting knowledge
  student_life: 10,            // Relatable student content
  tech_learning: 8,            // Learning tech/programming tips
  engagement_questions: 7,     // Questions to spark discussion

  // PROMOTIONAL POSTS (20%)
  subtle_product: 8,           // Subtle product mentions with value
  build_in_public: 6,          // Building in public updates
  feature_highlight: 4,        // Feature showcases with CTA
  testimonial_style: 2,        // User success story style
};

// Hashtag pools by category
const HASHTAGS = {
  learning: ["#LearningTwitter", "#StudyTips", "#LifelongLearning", "#EdTech", "#LearnSomethingNew"],
  students: ["#StudyWithMe", "#StudentLife", "#ExamPrep", "#CollegeLife", "#GradSchool"],
  productivity: ["#ProductivityTips", "#DeepWork", "#FocusMode", "#StudySmart", "#TimeManagement"],
  tech: ["#TechTwitter", "#LearnToCode", "#DevLife", "#Programming", "#AILearning"],
  curiosity: ["#Curiosity", "#AlwaysLearning", "#GrowthMindset", "#KnowledgeIsPower"],
  buildinpublic: ["#BuildInPublic", "#IndieHacker", "#StartupLife", "#SaaS", "#Maker"],
  ai: ["#AITools", "#AIPowered", "#FutureOfLearning", "#EdTechStartup"],
};

// ============================================
// POST TEMPLATES BY CATEGORY
// ============================================

const POST_TEMPLATES = {
  learning_tips: [
    "The Feynman Technique in 4 steps:\n\n1. Pick a concept\n2. Explain it like you're teaching a child\n3. Find gaps in your explanation\n4. Simplify and use analogies\n\nIf you can't explain it simply, you don't understand it.",
    "Stop highlighting entire paragraphs.\n\nInstead:\n• Write questions in the margin\n• Summarize in your own words\n• Connect to what you already know\n\nActive reading > passive highlighting.",
    "The best way to learn something new:\n\n1. Get curious about it first\n2. Ask questions before reading\n3. Explore tangents\n4. Test yourself\n\nCuriosity turns passive reading into active learning.",
    "Spaced repetition is underrated.\n\nReviewing something 5 times over 2 weeks beats studying it for 5 hours straight.\n\nYour brain needs time between sessions to consolidate.",
    "Want to remember more of what you read?\n\nTake a 5-minute break after each chapter.\n\nYour brain uses that downtime to transfer information from short-term to long-term memory.",
    "The illusion of competence:\n\nRe-reading feels productive.\nBut recognition ≠ recall.\n\nClose the book. Write what you remember.\nThat's where real learning happens.",
    "Learning hack: Before you start studying, write down 3 questions you want answered.\n\nThis primes your brain to actively seek information instead of passively consuming it.",
    "The best learners don't have better memories.\n\nThey ask better questions.\n\nQuestions force your brain to engage, connect, and remember.",
    "Why do we forget 90% of what we learn?\n\nBecause we don't use it.\n\nThe fix: Apply new knowledge within 24 hours.\nTeach it. Use it. Write about it.",
    "The 2-minute rule for learning:\n\nIf a concept takes less than 2 minutes to review, review it now.\n\nSmall consistent reviews beat occasional marathon sessions.",
    "Your notes shouldn't be a transcript.\n\nThey should be a conversation with the material:\n\n• What surprised you?\n• What confused you?\n• How does this connect to what you know?",
    "Learning tip: Change your study location.\n\nYour brain links memories to context.\nMultiple contexts = more retrieval cues = better recall.",
    "The paradox of expertise:\n\nExperts often can't explain the basics.\nThey've automated too much.\n\nIf you're learning, find someone who learned it recently. They remember the struggle.",
    "Confusion is not failure—it's the beginning of understanding.\n\nThe moment you feel confused, you're at the edge of your knowledge.\n\nLean into it.",
    "Most people stop learning when they feel uncomfortable.\n\nBut discomfort = growth zone.\n\nIf learning feels easy, you're probably just reviewing what you know.",
    "The Zeigarnik Effect:\n\nYour brain remembers incomplete tasks better than completed ones.\n\nStop mid-problem. Sleep on it. Your brain will work on it overnight.",
    "Don't just learn facts. Learn frameworks.\n\nFacts are isolated.\nFrameworks connect everything.\n\nOne good mental model can explain hundreds of situations.",
    "The testing effect is real:\n\nStudents who quiz themselves remember 50% more than those who just re-read.\n\nSelf-testing > re-reading. Always.",
    "Why teaching is the best way to learn:\n\n1. Forces you to organize thoughts\n2. Reveals gaps in understanding\n3. Requires simplification\n4. Creates emotional investment\n\nExplain it to learn it.",
    "Learning is not linear.\n\nSometimes you need to:\n• Go deeper before going forward\n• Go sideways to find connections\n• Go backward to fill gaps\n\nFollow your curiosity.",
  ],

  curiosity_insights: [
    "Ever notice how your best learning happens when you're genuinely curious?\n\nNot when you \"should\" learn something.\nWhen you *want* to know.",
    "Curiosity is the only unfair advantage that compounds forever.",
    "The difference between good learners and great learners:\n\nGood learners find answers.\nGreat learners find better questions.",
    "Children ask 300 questions a day.\nAdults ask 20.\n\nWe don't lose curiosity. We just stop exercising it.",
    "Your brain doesn't store information in isolation.\n\nIt stores connections.\n\nThe more connections, the easier to remember.\nThe more you explore tangents, the stronger your understanding.",
    "Why does exploring tangents feel \"unproductive\"?\n\nBecause we've been trained to follow linear paths.\n\nBut knowledge isn't linear. It's a web.\nExploring connections IS the learning.",
    "The most interesting people aren't experts in one thing.\n\nThey're curious about everything.\n\nBreadth creates unexpected connections. Depth comes later.",
    "Boredom isn't the absence of stimulation.\n\nIt's the absence of curiosity.\n\nSame content. Different mindset. Completely different experience.",
    "Question worth asking:\n\nWhen was the last time you learned something just because you were curious?\n\nNot for work. Not for school. Just... curious.",
    "The curse of \"I'll learn it later\":\n\nCuriosity has a half-life.\nThe moment passes. The question fades.\n\nCapture curiosity when it strikes.",
    "Your attention goes where your questions go.\n\nIf you're not asking questions, you're not really paying attention.\n\nYou're just... present.",
    "Hot take: The best learning happens in rabbit holes.\n\nThose unexpected tangents that take you somewhere you never planned to go.\n\nThat's where insight lives.",
    "Curiosity is cheap. Following through is expensive.\n\nThat's why most people have ideas but few have insights.\n\nInsight requires exploration time.",
    "What if the goal of learning wasn't to \"finish\"?\n\nWhat if it was to find more interesting questions?\n\nInfinite games > finite games.",
    "The best conversations don't have agendas.\n\nThey follow curiosity wherever it leads.\n\nSame with the best learning sessions.",
  ],

  productivity_hacks: [
    "The Pomodoro Technique works because:\n\n1. Timeboxing creates urgency\n2. Breaks prevent burnout\n3. Small wins build momentum\n\nBut the real magic? Tracking makes you aware of where time goes.",
    "Your environment shapes your behavior.\n\nWant to study more? Make studying the path of least resistance.\n\n• Open tabs ready\n• Phone in another room\n• Materials prepared\n\nReduce friction.",
    "The 2-minute startup:\n\nCommit to just 2 minutes of studying.\n\nMost of the time, once you start, you'll keep going.\n\nStarting is 80% of the battle.",
    "Context switching kills deep learning.\n\nEvery time you check your phone, your brain needs 23 minutes to fully refocus.\n\nProtect your focus blocks.",
    "The paradox of progress:\n\nFeeling productive ≠ being productive.\n\nBusy work feels good.\nDeep work feels hard.\n\nChoose hard.",
    "Energy management > time management.\n\nYour best work happens in your peak hours.\n\nKnow when you're sharpest. Protect those hours for your hardest tasks.",
    "The power of \"done lists\":\n\nInstead of only tracking what you need to do, track what you've done.\n\nProgress visibility = motivation.",
    "Study hack: Study in the same place, at the same time, in the same way.\n\nRoutine reduces decision fatigue.\nYour brain learns: \"This is when we focus.\"",
    "The worst productivity advice: \"Work harder.\"\n\nThe best productivity advice: \"Work on the right things.\"\n\nBefore optimizing how, optimize what.",
    "Multitasking is a myth.\n\nWhat you call multitasking is actually rapid task-switching.\n\nAnd it costs you 40% of your productive time.",
  ],

  knowledge_building: [
    "The difference between information and knowledge:\n\nInformation is what you consume.\nKnowledge is what you can use.\n\nTransformation happens through application.",
    "Your brain is not a hard drive.\n\nIt doesn't store information in neat folders.\n\nIt stores relationships between ideas.\n\nBuild connections, not collections.",
    "Reading without taking notes is like eating without digesting.\n\nYou consume but don't absorb.",
    "The Collector's Fallacy:\n\nSaving articles ≠ learning.\nBookmarking resources ≠ understanding.\n\nConsumption feels productive. It's usually not.",
    "How experts think differently:\n\nNovices see isolated facts.\nExperts see patterns and connections.\n\nThe path to expertise is building these connections.",
    "Second-brain tip:\n\nDon't organize notes by source.\nOrganize by how you'll use them.\n\nAsk: \"When will I need this?\" not \"Where did this come from?\"",
    "The best notes are not summaries.\n\nThey're conversations with the material:\n\n• What surprised me?\n• What confused me?\n• How does this connect?\n• What should I do differently?",
    "Learning compounds. But only if you review.\n\nNew knowledge builds on old knowledge.\n\nIf the foundation fades, the structure collapses.",
    "The Map is not the Territory.\n\nYour understanding is a model of reality.\n\nThe more you explore, the more accurate your map becomes.",
    "Building knowledge is like building muscle.\n\nIt requires:\n• Consistent effort\n• Progressive overload\n• Recovery time\n• Proper nutrition (quality inputs)\n\nNo shortcuts.",
  ],

  student_life: [
    "POV: You finally understand a concept that's been confusing you for weeks.\n\nThat feeling > everything.",
    "The 3am realization that you actually don't understand the material you thought you knew.\n\nWe've all been there.",
    "Nobody tells you that the hardest part of studying isn't the studying.\n\nIt's sitting down to start.",
    "Exam season mood:\n\n\"I should have started earlier\"\n- Every student ever\n- Including you next semester",
    "That moment when the professor says \"this won't be on the exam\" and you feel like you just gained 3 hours of your life back.",
    "Study tip nobody talks about:\n\nSleep > cramming.\n\nYour brain consolidates memories during sleep.\n\nPulling an all-nighter often makes recall worse.",
    "The curve of understanding:\n\n📉 Day 1: \"I got this\"\n📉 Day 3: \"Wait what\"\n📈 Day 7: \"Ohhhh\"\n📈 Day 14: \"I can teach this\"\n\nConfusion is part of the process.",
    "Controversial opinion:\n\nGroup study sessions are usually social events disguised as productivity.\n\nExcept when you actually quiz each other.",
    "Signs you're actually learning vs. just reading:\n\n• You can explain it without looking\n• You can apply it to new situations\n• You can answer questions about it\n• You catch yourself thinking about it randomly",
    "The semester always feels long until finals week.\n\nThen suddenly 16 weeks of material needs to fit in your brain in 5 days.\n\nConsistent review > cramming. Every time.",
  ],

  tech_learning: [
    "Learning to code is not about memorizing syntax.\n\nIt's about:\n• Breaking problems into smaller problems\n• Pattern recognition\n• Knowing what to Google\n\nSyntax you can look up. Problem-solving you can't.",
    "The fastest way to learn a new framework:\n\n1. Build something small with it\n2. Break it\n3. Fix it\n4. Repeat\n\nDocumentation reading: 20%\nHands-on building: 80%",
    "Developer learning tip:\n\nDon't try to learn everything about a technology.\n\nLearn enough to build. Build. Hit walls. Learn what you need to overcome the wall.\n\nJust-in-time learning > just-in-case learning.",
    "The tutorial trap:\n\nWatching tutorials feels productive.\nBut following along ≠ understanding.\n\nClose the tutorial. Try to rebuild from memory.\nThat's where learning happens.",
    "Why senior developers learn faster:\n\nThey don't learn new technologies.\nThey map new technologies to patterns they already know.\n\nLearn patterns, not just tools.",
    "Hot take: Reading documentation is a skill.\n\nMost people skim. Few actually read.\n\nSlow down. Read examples. Try them. Understanding compounds.",
    "The stack doesn't matter as much as understanding fundamentals.\n\nFrameworks change every 2 years.\nComputer science principles don't.\n\nInvest in foundations.",
    "Learning a new programming language:\n\n1. Learn the syntax (1 week)\n2. Learn the idioms (1 month)\n3. Learn to think in the language (6 months)\n\nMost people stop at step 1.",
  ],

  engagement_questions: [
    "Question for learners:\n\nWhat's something you learned this week that you wish you knew earlier?",
    "Genuine question:\n\nHow do you decide what's worth learning vs. what to skip?",
    "Curious:\n\nWhat's the most valuable thing you've learned that wasn't taught in school?",
    "Poll time:\n\nWhen learning something new, do you prefer:\n\n• Structured courses\n• Self-directed exploration\n• Mix of both\n\n?",
    "Question for developers:\n\nWhat's one technology you keep putting off learning?",
    "For the students:\n\nWhat's your go-to study technique that actually works?",
    "Curious about your learning habits:\n\nDo you prefer learning alone or with others?",
  ],

  subtle_product: [
    "Building a learning tool that lets you branch into tangents without losing context.\n\nBecause the best insights often come from unexpected connections.\n\nMore at ${WEBSITE_URL}",
    "What if your learning conversations could branch like your thoughts do?\n\nExplore one question. Find three more. Follow each path.\n\nThat's what we're building at ${WEBSITE_URL}",
    "Traditional note-taking is linear.\nBut thinking isn't.\n\nWe're building something that maps knowledge the way your brain actually works.\n\n${WEBSITE_URL}",
    "The problem with AI chat: conversations become too long to navigate.\n\nOur solution: branching trails that let you explore tangents without losing your main thread.\n\nCheck it out: ${WEBSITE_URL}",
    "Learning should feel like exploring, not following a script.\n\nThat's why we built ${PRODUCT_NAME} - an AI learning platform where curiosity leads the way.\n\n${WEBSITE_URL}",
    "Ever have a learning session where one question leads to five more?\n\nWe built a tool that embraces that: visual trails, branching paths, and AI that keeps up with your curiosity.\n\n${WEBSITE_URL}",
    "Most AI chat interfaces assume linear conversation.\n\nBut learning is non-linear.\n\n${PRODUCT_NAME} lets you branch, explore, and see how everything connects.\n\n${WEBSITE_URL}",
    "What if you could see your entire learning journey as a map?\n\nEvery question, every tangent, every insight - all connected.\n\nThat's ${PRODUCT_NAME}. ${WEBSITE_URL}",
  ],

  build_in_public: [
    "Building ${PRODUCT_NAME} in public.\n\nToday's focus: improving how we visualize learning trails.\n\nThe challenge: making complex knowledge maps feel simple.\n\n#BuildInPublic",
    "Week 12 of building an AI learning platform.\n\nLesson learned: Users don't want more features.\nThey want the existing features to work better.\n\n#BuildInPublic #IndieHacker",
    "Shipping a small update today: better quiz generation from your learning sessions.\n\nSmall improvements compound.\n\n#BuildInPublic",
    "The hardest part of building an EdTech product?\n\nNot the tech. It's understanding how people actually learn.\n\nSpent this week talking to students. Eye-opening.\n\n#BuildInPublic",
    "Progress update on ${PRODUCT_NAME}:\n\n✅ 8 AI models integrated\n✅ Visual trail mapping\n✅ Quiz generation\n🔄 Journal summaries (in progress)\n\nSlowly building something people actually want.\n\n#BuildInPublic",
    "Building in public confession:\n\nWe shipped 3 features last month.\nUsers only cared about 1.\n\nListening > assuming.\n\n#BuildInPublic #StartupLife",
  ],

  feature_highlight: [
    "New feature: Generate quizzes from any learning session.\n\nYour AI conversation becomes a study guide.\nTest yourself. Find gaps. Learn faster.\n\nTry it free: ${WEBSITE_URL}",
    "${PRODUCT_NAME} now supports 8 AI models:\n\n• GPT-4o\n• Claude Sonnet\n• Gemini Flash\n• DeepSeek R1\n• And 4 more\n\nPick the right model for each topic.\n\n${WEBSITE_URL}",
    "Visual learning trails: See how all your topics connect.\n\nNo more scattered notes.\nNo more lost context.\n\nOne map. All your learning.\n\n${WEBSITE_URL}",
    "Free tier available:\n\n• Unlimited conversations\n• 4 AI models\n• Visual trails\n• Quiz generation\n\nNo credit card required.\n\nStart learning: ${WEBSITE_URL}",
  ],

  testimonial_style: [
    "From a student using ${PRODUCT_NAME}:\n\n\"Finally understood organic chemistry after 3 weeks of confusion. The branching trails helped me see how reactions connect.\"\n\nThis is why we build.\n\n${WEBSITE_URL}",
    "Best feedback we've received:\n\n\"It feels like talking to a tutor who never gets tired of my questions and always remembers what we talked about.\"\n\nExactly what we're going for.\n\n${WEBSITE_URL}",
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getRandomHashtags(categories: (keyof typeof HASHTAGS)[], count: number = 3): string[] {
  const pool = categories.flatMap(cat => HASHTAGS[cat]);
  return getRandomItems(pool, count);
}

function getRandomImage(): typeof AVAILABLE_IMAGES[0] | null {
  // 30% chance of including an image
  if (Math.random() > 0.3) return null;
  return AVAILABLE_IMAGES[Math.floor(Math.random() * AVAILABLE_IMAGES.length)];
}

function formatScheduledDate(daysFromNow: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  // Format: YYYY-MM-DD HH:MM:SS (Odoo format)
  return date.toISOString().replace("T", " ").split(".")[0];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

interface GeneratedPost {
  message: string;
  scheduled_date: string;
  state: string;
  image?: string;
  category: string;
  target_icp: string;
  recommended_communities: string;
  primary_community: string;
  community_hashtag: string;
}

function generatePosts(): GeneratedPost[] {
  const posts: GeneratedPost[] = [];
  let postId = 0;

  // Generate posts for each category based on distribution
  Object.entries(CONTENT_CATEGORIES).forEach(([category, count]) => {
    const templates = POST_TEMPLATES[category as keyof typeof POST_TEMPLATES];
    if (!templates) return;

    const selectedTemplates = getRandomItems(templates, Math.min(count, templates.length));

    // If we need more posts than templates, repeat some
    while (selectedTemplates.length < count && templates.length > 0) {
      selectedTemplates.push(templates[Math.floor(Math.random() * templates.length)]);
    }

    selectedTemplates.forEach((template, idx) => {
      const daysFromNow = Math.floor(postId / 3) + 1; // 3 posts per day
      const hours = [9, 13, 18]; // Morning, afternoon, evening
      const hour = hours[postId % 3];

      // Determine hashtag categories based on post category
      let hashtagCategories: (keyof typeof HASHTAGS)[] = ["learning"];
      if (category.includes("student")) hashtagCategories.push("students");
      if (category.includes("tech")) hashtagCategories.push("tech");
      if (category.includes("product") || category.includes("build")) hashtagCategories.push("buildinpublic", "ai");
      if (category.includes("curiosity")) hashtagCategories.push("curiosity");
      if (category.includes("productivity")) hashtagCategories.push("productivity");

      const hashtags = getRandomHashtags(hashtagCategories, 3);
      const image = getRandomImage();
      const targetIcp = TARGET_ICPS[Math.floor(Math.random() * TARGET_ICPS.length)];

      // Add hashtags to the end of the message
      let message = template;
      if (!message.includes("#")) {
        message += "\n\n" + hashtags.join(" ");
      }

      // Get community recommendations
      const recommendedCommunities = getRecommendedCommunities(category);
      const primaryCommunity = recommendedCommunities[0] || "EduTwitter";
      const communityHashtag = getPrimaryCommunityHashtag(category);

      posts.push({
        message,
        scheduled_date: formatScheduledDate(daysFromNow, hour),
        state: "scheduled",
        image: image?.file || "",
        category,
        target_icp: targetIcp,
        recommended_communities: recommendedCommunities.join(", "),
        primary_community: primaryCommunity,
        community_hashtag: communityHashtag,
      });

      postId++;
    });
  });

  // Shuffle posts to mix categories throughout the schedule
  return shuffleArray(posts);
}

// ============================================
// EXCEL EXPORT FUNCTION
// ============================================

async function exportToExcel(posts: GeneratedPost[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Twitter Posts");

  // Define columns matching Odoo Social Marketing expected format
  // Plus community recommendations for manual cross-posting
  worksheet.columns = [
    { header: "message", key: "message", width: 100 },
    { header: "scheduled_date", key: "scheduled_date", width: 20 },
    { header: "state", key: "state", width: 12 },
    { header: "primary_community", key: "primary_community", width: 20 },
    { header: "community_hashtag", key: "community_hashtag", width: 18 },
    { header: "recommended_communities", key: "recommended_communities", width: 50 },
    { header: "image", key: "image", width: 40 },
    { header: "category", key: "category", width: 20 },
    { header: "target_icp", key: "target_icp", width: 15 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1DA1F2" }, // Twitter blue
  };

  // Add posts
  posts.forEach((post) => {
    worksheet.addRow(post);
  });

  // Enable text wrapping for message column
  worksheet.getColumn("message").alignment = { wrapText: true, vertical: "top" };

  // Save to outputs directory
  const outputDir = path.join(__dirname, "..", "..", "outputs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `twitter-100-posts-${new Date().toISOString().split("T")[0]}.xlsx`;
  const filepath = path.join(outputDir, filename);

  await workbook.xlsx.writeFile(filepath);

  return filepath;
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log("🚀 Generating 100 Twitter Marketing Posts...\n");

  const posts = generatePosts();

  console.log(`📊 Post Distribution:`);
  const categoryCount: Record<string, number> = {};
  posts.forEach((p) => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });
  Object.entries(categoryCount).forEach(([cat, count]) => {
    const type = cat.includes("product") || cat.includes("build") || cat.includes("feature") || cat.includes("testimonial")
      ? "🎯 Promotional"
      : "💡 Value";
    console.log(`   ${type} ${cat}: ${count} posts`);
  });

  const valuePosts = posts.filter(p =>
    !["subtle_product", "build_in_public", "feature_highlight", "testimonial_style"].includes(p.category)
  ).length;
  const promoPosts = posts.length - valuePosts;

  console.log(`\n📈 Content Mix:`);
  console.log(`   Value posts: ${valuePosts} (${Math.round(valuePosts/posts.length*100)}%)`);
  console.log(`   Promotional: ${promoPosts} (${Math.round(promoPosts/posts.length*100)}%)`);

  console.log(`\n📅 Schedule: ${Math.ceil(posts.length / 3)} days (3 posts/day at 9am, 1pm, 6pm)`);

  // Community distribution
  const communityCount: Record<string, number> = {};
  posts.forEach((p) => {
    communityCount[p.primary_community] = (communityCount[p.primary_community] || 0) + 1;
  });

  console.log(`\n🌐 Community Distribution:`);
  Object.entries(communityCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([community, count]) => {
      console.log(`   ${community}: ${count} posts`);
    });

  const filepath = await exportToExcel(posts);

  console.log(`\n✅ Successfully generated ${posts.length} posts`);
  console.log(`📊 Excel file saved to: ${filepath}`);

  console.log(`\n📋 Sample posts:`);
  posts.slice(0, 3).forEach((post, idx) => {
    console.log(`\n${idx + 1}. [${post.category}] → ${post.primary_community}`);
    console.log(`   ${post.message.substring(0, 70)}...`);
  });

  console.log("\n📤 Next steps:");
  console.log("   1. Review and customize the posts in Excel");
  console.log("   2. Go to Odoo Social Marketing → Social Posts");
  console.log("   3. Click 'Upload Data File'");
  console.log(`   4. Select: ${filepath}`);
  console.log("   5. Map columns: message, scheduled_date, state");
  console.log("   6. Use 'primary_community' column for manual community cross-posting\n");

  console.log("💡 Odoo Column Mapping:");
  console.log("   - message → Message/Content");
  console.log("   - scheduled_date → Scheduled Date");
  console.log("   - state → Status");
  console.log("");
  console.log("🌐 Community Columns (for manual cross-posting):");
  console.log("   - primary_community → Best community for this post");
  console.log("   - community_hashtag → Hashtag to include");
  console.log("   - recommended_communities → All relevant communities");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

/**
 * Application-wide constants
 */

export const APP_NAME = 'CareerHub';
export const APP_DESCRIPTION =
  'AI-powered hiring platform for candidates, recruiters, and admins.';

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export const FEATURES = [
  {
    title: 'AI Resume Analysis',
    description:
      'Our AI engine scans and evaluates resumes in seconds, identifying key skills, experience gaps, and role fit with remarkable accuracy.',
    icon: 'Brain',
  },
  {
    title: 'Smart Matching',
    description:
      'Automatically match candidates with the right opportunities using advanced machine learning algorithms and semantic analysis.',
    icon: 'Zap',
  },
  {
    title: 'Interview Preparation',
    description:
      'AI-generated interview questions tailored to each role and candidate profile, with real-time feedback and coaching.',
    icon: 'MessageSquare',
  },
  {
    title: 'Analytics Dashboard',
    description:
      'Comprehensive analytics and insights into your hiring pipeline, candidate quality scores, and recruitment efficiency metrics.',
    icon: 'BarChart3',
  },
  {
    title: 'Team Collaboration',
    description:
      'Seamless collaboration tools for hiring teams. Share notes, schedule interviews, and make decisions together in real-time.',
    icon: 'Users',
  },
  {
    title: 'Enterprise Security',
    description:
      'SOC 2 compliant infrastructure with end-to-end encryption. Your data is protected with bank-grade security standards.',
    icon: 'Shield',
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Upload Your Resume',
    description:
      'Simply upload your resume or paste your LinkedIn profile. Our AI processes your information in seconds.',
  },
  {
    step: 2,
    title: 'AI Analysis & Matching',
    description:
      'Our engine analyzes skills, experience, and preferences to find the perfect roles tailored just for you.',
  },
  {
    step: 3,
    title: 'Get Matched & Hired',
    description:
      'Receive curated job matches, prepare with AI coaching, and land your dream role faster than ever.',
  },
];

export const STATISTICS = [
  { value: '10K+', label: 'Resumes Analyzed' },
  { value: '500+', label: 'Companies Trust Us' },
  { value: '95%', label: 'Match Accuracy' },
  { value: '24/7', label: 'AI Support' },
];

export const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'VP of Engineering',
    company: 'TechCorp',
    quote:
      'CareerHub cut our time-to-hire by 60%. The AI matching is incredibly accurate and saved our recruiting team hundreds of hours.',
    rating: 5,
  },
  {
    name: 'Marcus Rivera',
    role: 'Senior Developer',
    company: 'StartupXYZ',
    quote:
      'As a candidate, the interview prep feature was a game-changer. I felt genuinely prepared and confident walking into every interview.',
    rating: 5,
  },
  {
    name: 'Emily Watson',
    role: 'Head of Talent',
    company: 'GlobalFinance',
    quote:
      'The analytics dashboard gives us insights we never had before. We can now make data-driven hiring decisions with confidence.',
    rating: 5,
  },
];

export const PRICING_PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for individual candidates getting started.',
    features: [
      '5 Resume Analyses / month',
      'Basic AI Matching',
      'Interview Prep (3 sessions)',
      'Email Support',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'For active job seekers and small hiring teams.',
    features: [
      'Unlimited Resume Analyses',
      'Advanced AI Matching',
      'Unlimited Interview Prep',
      'Priority Support',
      'Analytics Dashboard',
      'Team Collaboration (5 seats)',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with advanced needs.',
    features: [
      'Everything in Professional',
      'Custom AI Models',
      'SSO & SAML',
      'Dedicated Account Manager',
      'API Access',
      'Custom Integrations',
      'SLA Guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export const FAQ_ITEMS = [
  {
    question: 'How does the AI resume analysis work?',
    answer:
      'Our AI uses natural language processing and machine learning to parse your resume, extract key information, evaluate skills against job requirements, and provide a comprehensive compatibility score with actionable improvement suggestions.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use end-to-end encryption, SOC 2 compliant infrastructure, and never share your personal data with third parties. Your resume data is only used to provide you with matches and insights.',
  },
  {
    question: 'Can I use CareerHub as a recruiter?',
    answer:
      'Yes! CareerHub offers dedicated recruiter accounts with features like candidate pipeline management, bulk resume analysis, team collaboration tools, and advanced analytics dashboards.',
  },
  {
    question: 'What makes CareerHub different from other platforms?',
    answer:
      'CareerHub combines cutting-edge AI with a human-centered approach. Our matching algorithm considers not just skills and experience, but also culture fit, growth potential, and career trajectory.',
  },
  {
    question: 'Do you offer a free trial?',
    answer:
      'Yes! Our Starter plan is completely free and includes 5 resume analyses per month. The Professional plan also comes with a 14-day free trial so you can experience the full power of CareerHub.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes, you can cancel your subscription at any time with no cancellation fees. Your account will remain active until the end of your current billing period.',
  },
];

export const FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'API', href: '#' },
    { label: 'Integrations', href: '#' },
  ],
  company: [
    { label: 'About', href: '/#about' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '/#contact' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Community', href: '#' },
    { label: 'Status', href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

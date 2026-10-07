const fs = require('fs');
const path = require('path');

console.log('=== VERIFYING UI/UX FIXES ===');

const baseDir = path.resolve(__dirname, '..');

// 1. Check globals.css for zero yellow/orange overrides
const globalsCss = fs.readFileSync(path.join(baseDir, 'app', 'globals.css'), 'utf-8');
const hasChatboxOverrides = globalsCss.includes('.careerhub-chat-input-box');
const hasZeroRing = globalsCss.includes('--tw-ring-color: transparent !important');
const hasSlateBorder = globalsCss.includes('border-color: #64748b !important');
console.log('1. globals.css input overrides:');
console.log('   - Has .careerhub-chat-input-box rule:', hasChatboxOverrides);
console.log('   - Has zero-ring / transparent override:', hasZeroRing);
console.log('   - Has neutral slate border override:', hasSlateBorder);

if (!hasChatboxOverrides || !hasZeroRing || !hasSlateBorder) {
  console.error('FAIL: globals.css is missing strict chatbot input overrides');
} else {
  console.log('PASS: globals.css input focus overrides verified.');
}

// 2. Check assistant-chat-panel.jsx
const chatPanel = fs.readFileSync(path.join(baseDir, 'components', 'assistant', 'assistant-chat-panel.jsx'), 'utf-8');
const hasChatboxClass = chatPanel.includes('careerhub-chat-input-box');
const hasOutlineNoneStyle = chatPanel.includes("outline: 'none'");
const hasBotMessageSquare = chatPanel.includes('BotMessageSquare');
const hasBounceIndicator = chatPanel.includes('animate-bounce');
const hasAutoGrowMax = chatPanel.includes('maxHeight = 160');
console.log('\n2. assistant-chat-panel.jsx:');
console.log('   - Uses .careerhub-chat-input-box:', hasChatboxClass);
console.log('   - Explicit style outline none:', hasOutlineNoneStyle);
console.log('   - Uses BotMessageSquare icon:', hasBotMessageSquare);
console.log('   - Has KDL 3-dot bounce indicator:', hasBounceIndicator);
console.log('   - Has 160px ~7-line auto-grow limit:', hasAutoGrowMax);

// 3. Check assistant-context.jsx
const assistantContext = fs.readFileSync(path.join(baseDir, 'components', 'assistant', 'assistant-context.jsx'), 'utf-8');
const hasTypingInterval = assistantContext.includes('typingIntervalRef');
const hasProgressivePace = assistantContext.includes('remaining / 7') || assistantContext.includes('remaining / 8');
const hasNoCtrlShortcut = !assistantContext.includes("e.key === '/'");
console.log('\n3. assistant-context.jsx:');
console.log('   - Has progressive typing interval queue:', hasTypingInterval);
console.log('   - Has adaptive progressive reveal step:', hasProgressivePace);
console.log('   - Removed Ctrl+/ keyboard shortcut:', hasNoCtrlShortcut);

// 4. Check assistant-floating-button.jsx
const floatingBtn = fs.readFileSync(path.join(baseDir, 'components', 'assistant', 'assistant-floating-button.jsx'), 'utf-8');
const hasNoPing = !floatingBtn.includes('animate-ping');
const hasNoCtrlBadge = !floatingBtn.includes('Ctrl+/');
const hasBotMsgSquare = floatingBtn.includes('BotMessageSquare');
console.log('\n4. assistant-floating-button.jsx:');
console.log('   - No flashing neon animate-ping:', hasNoPing);
console.log('   - No Ctrl+/ badge:', hasNoCtrlBadge);
console.log('   - Clean BotMessageSquare icon:', hasBotMsgSquare);

// 5. Check dashboard-shell.jsx
const dashboardShell = fs.readFileSync(path.join(baseDir, 'components', 'layout', 'dashboard-shell.jsx'), 'utf-8');
const hasCompassCoach = dashboardShell.includes("label: 'AI Career Coach', href: '/dashboard/career-coach', icon: Compass");
const hasFileCheckResume = dashboardShell.includes("label: 'AI Resume Score', href: '/dashboard/ai-analysis', icon: FileCheck2");
const hasHeaderCompass = dashboardShell.includes('<Compass className="h-3 w-3 text-primary" />');
console.log('\n5. dashboard-shell.jsx:');
console.log('   - AI Career Coach uses Compass icon:', hasCompassCoach);
console.log('   - AI Resume Score uses FileCheck2 icon:', hasFileCheckResume);
console.log('   - Header quick-link uses Compass icon:', hasHeaderCompass);

// 6. Check dashboard/page.js
const dashboardPage = fs.readFileSync(path.join(baseDir, 'app', '(dashboard)', 'dashboard', 'page.js'), 'utf-8');
const hasPageCompass = dashboardPage.includes("title: 'AI Career Coach'") && dashboardPage.includes("icon: Compass");
const hasPageFileCheck = dashboardPage.includes("title: 'AI Resume Score & ATS Audit'") && dashboardPage.includes("icon: FileCheck2");
const hasInsightCompass = dashboardPage.includes('<Compass className="h-4 w-4 text-primary" />');
console.log('\n6. dashboard/page.js:');
console.log('   - Dashboard AI Career Coach card uses Compass:', hasPageCompass);
console.log('   - Dashboard AI Resume Score card uses FileCheck2:', hasPageFileCheck);
console.log('   - Dashboard Career Coach Insight uses Compass:', hasInsightCompass);

// 7. Check career-coach-client.js
const coachClient = fs.readFileSync(path.join(baseDir, 'app', '(dashboard)', 'dashboard', 'career-coach', 'career-coach-client.js'), 'utf-8');
const hasCoachHeaderCompass = coachClient.includes('<Compass className="h-6 w-6 text-primary shrink-0" />');
const hasCoachButtonCompass = coachClient.includes('<Compass className="mr-2 h-3.5 w-3.5" />');
console.log('\n7. career-coach-client.js:');
console.log('   - Page header uses Compass icon:', hasCoachHeaderCompass);
console.log('   - CTA button uses Compass icon:', hasCoachButtonCompass);

console.log('\n=== AUDIT COMPLETE ===');

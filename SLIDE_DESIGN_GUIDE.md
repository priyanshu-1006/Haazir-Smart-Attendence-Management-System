# Haazir - Slide Design Guide
## Visual Layout & Content for Each Slide

---

## 🎨 Overall Design System

**Theme:** Modern, Clean, Tech-Forward  
**Primary Colors:** 
- Blue (#3B82F6) - Trust, Technology
- Purple (#8B5CF6) - Innovation, AI
- Green (#10B981) - Success, Growth
- Gray (#1F2937) - Text, Professional

**Fonts:**
- Headings: **Poppins Bold** or **Inter Bold** (32-48pt)
- Subheadings: **Poppins SemiBold** (24-28pt)
- Body: **Inter Regular** (16-20pt)
- Code/Numbers: **JetBrains Mono** (14-18pt)

**Layout Principles:**
- 60/40 split (content/visual) or centered content
- Generous white space (don't cram)
- Consistent 40px padding on all sides
- Max 5-7 bullet points per slide
- Icons from Lucide Icons or Heroicons

---

## SLIDE 1: Title Slide

### Layout: Centered Content

```
┌─────────────────────────────────────────────┐
│                                              │
│                                              │
│              [Logo: Haazir 🎓]               │
│                   हाज़िर                      │
│                                              │
│    Smart Attendance Management System        │
│         with AI-Powered Solutions            │
│                                              │
│   "Making Attendance Smart, Secure, Seamless" │
│                                              │
│   [Tech Icons: React Node PostgreSQL TF.js]  │
│                                              │
│         Priyanshu Chaurasia & Team           │
│              IIIT Gwalior                    │
│                                              │
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- Large Haazir logo (custom design or modern "H" monogram)
- Devanagari script "हाज़िर" in elegant font
- Tech stack icons in a row (colored, modern style)
- Gradient background (blue-to-purple, subtle)
- Professional headshot or team photo (small, bottom corner)

**Animation:** Fade in title → Tech icons slide up → Tagline appears

**Color Scheme:** 
- Background: Linear gradient (#EEF2FF to #F3E8FF)
- Title: #1F2937 (dark gray)
- Tagline: #6B7280 (medium gray, italic)
- Icons: Full color (brand colors)

---

## SLIDE 2: The Problem

### Layout: Left Content (60%) + Right Visual (40%)

```
┌─────────────────────────────────────────────┐
│  The Problem                    │ [Visual]   │
│                                 │            │
│  🚨 Critical Issues:            │ [Time      │
│                                 │  Waste     │
│  1. Proxy Attendance (30-40%)   │  Graphic]  │
│     • Identity fraud            │            │
│     • No biometric verification │ [Proxy     │
│                                 │  Stats     │
│  2. Time Wastage (750 hrs/sem) │  Chart]    │
│     • 10-15 min per class       │            │
│     • 20% of class time lost    │            │
│                                 │ [Timetable │
│  3. Timetable Chaos (60 hrs)    │  Conflict  │
│     • Manual scheduling         │  Icons]    │
│     • Frequent conflicts        │            │
│                                 │            │
│  👥 Who's Affected:             │            │
│  Students • Teachers • Admins   │            │
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- **Top Right:** Stopwatch icon with "750 HOURS WASTED" in bold red
- **Middle Right:** Donut chart showing 40% proxy attendance (red segment)
- **Bottom Right:** Overlapping calendar icons (symbolizing conflicts)
- Icons next to each point (🚫 for proxy, ⏰ for time, 📅 for chaos)

**Data Visualization:**
```
10 min × 5 classes × 100 days = 5,000 minutes lost
                                 (83 hours per student!)
```

**Color Scheme:**
- Problem text: Dark gray (#1F2937)
- Statistics: Bold red (#EF4444) or orange (#F59E0B)
- Icons: Red for problems, gray for affected parties

---

## SLIDE 3: The Solution

### Layout: Three-Column Architecture

```
┌─────────────────────────────────────────────┐
│         The Solution - Three Pillars         │
│                                              │
│  ┌────────┐   ┌────────┐   ┌────────┐      │
│  │   🤖   │   │   🧠   │   │   📊   │      │
│  │ Smart  │   │   AI   │   │ Compre-│      │
│  │Attend  │   │Timetable│  │ hensive│      │
│  │        │   │         │   │Analytics│     │
│  ├────────┤   ├────────┤   ├────────┤      │
│  │QR Code │   │ Gemini  │   │Real-time│     │
│  │   +    │   │ Powered │   │ Dash-  │     │
│  │  Face  │   │         │   │ boards │     │
│  │Recog   │   │ CSP     │   │         │     │
│  │        │   │ Solver  │   │Predict-│     │
│  │GPS     │   │         │   │  ive   │     │
│  │Validate│   │3 Solut- │   │Insights│     │
│  │        │   │  ions   │   │         │     │
│  │        │   │ 30 sec  │   │         │     │
│  └────────┘   └────────┘   └────────┘      │
│                                              │
│  💡 Key Differentiators:                    │
│  ✓ Dual verification  ✓ GenAI-powered       │
│  ✓ 98% accuracy      ✓ 90% time reduction   │
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- Large emoji icons at top of each column (animated)
- Each column has light background color (#F9FAFB)
- Rounded corners on columns (12px border-radius)
- Checkmarks in green (#10B981)
- Subtle drop shadows on columns

**Animation:** Columns slide in from bottom (staggered)

**Color Scheme:**
- Column 1 background: Light blue (#EFF6FF)
- Column 2 background: Light purple (#F5F3FF)
- Column 3 background: Light green (#ECFDF5)
- Text: Dark gray (#1F2937)
- Checkmarks: Green (#10B981)

---

## SLIDE 4: The GenAI Core (MOST IMPORTANT)

### Layout: Process Flow with Visual Explanations

```
┌─────────────────────────────────────────────┐
│     Why Generative AI is Essential          │
│                                              │
│  [Google Gemini Logo]                       │
│                                              │
│  INPUT                                       │
│  ┌──────────────────────────────────┐       │
│  │ Courses • Teachers • Constraints │       │
│  └──────────────────────────────────┘       │
│              ⬇                              │
│  [Gemini AI Brain Illustration]             │
│              ⬇                              │
│  GEMINI ANALYZES:                            │
│  • Teacher workload distribution            │
│  • Room utilization                         │
│  • Student convenience                      │
│  • Gap minimization                         │
│              ⬇                              │
│  OUTPUT                                      │
│  ┌──────────────────────────────────┐       │
│  │ Solution 1 | Solution 2 | Solution 3│    │
│  │  Score: 92 |  Score: 88 |  Score: 85│   │
│  │ [Reasoning Explanation Box]        │       │
│  └──────────────────────────────────┘       │
│                                              │
│  ⚡ Why Traditional Algorithms Fail:         │
│  ❌ Rigid rules  ❌ No reasoning            │
│  ✅ Gemini: Intelligent + Explainable       │
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- Google Gemini logo (official branding)
- **Central visual:** Brain/neural network illustration (animated)
- **Input box:** Icons for courses (📚), teachers (👨‍🏫), constraints (⚙️)
- **Output box:** Three timetable previews (miniature calendars)
- **Reasoning box:** Speech bubble with AI quote

**Example Reasoning Quote:**
> "Solution 1 is optimal because it minimizes teacher gaps (avg 30 min vs 90 min), balances workload (max 6 classes/day), and allocates labs sequentially."

**Key Visual:** Before/After comparison
- **Before:** Crossed-out hourglass "60 hours manual"
- **After:** Rocket "30 seconds AI"

**Animation:** 
1. Input flows down
2. Brain lights up (thinking animation)
3. Output appears with scores
4. Reasoning box pops up

**Color Scheme:**
- Input/Output boxes: Light purple (#F5F3FF) background
- Gemini branding: Official purple/blue
- Success elements: Green (#10B981)
- Failure elements: Red (#EF4444)

---

## SLIDE 5: Core Features

### Layout: Grid with Screenshots

```
┌─────────────────────────────────────────────┐
│           Core Features Showcase             │
│                                              │
│  🔐 Smart Attendance         [Screenshot]   │
│  ┌────────────────────┐     ┌────────────┐  │
│  │1. Teacher starts QR│     │[QR Scanner]│  │
│  │2. Student scans QR │     │[Face Recog]│  │
│  │3. Face verification│     │[GPS Check] │  │
│  │4. GPS validation   │     │            │  │
│  │5. ✅ Attendance    │     │            │  │
│  └────────────────────┘     └────────────┘  │
│                                              │
│  🧩 AI Timetable Generator   [Screenshot]   │
│  ┌────────────────────┐     ┌────────────┐  │
│  │Hard Constraints ✓  │     │[3 Solutions]│ │
│  │Soft Constraints ✓  │     │[Scores]    │  │
│  │3 Solutions in 30s  │     │[Rankings]  │  │
│  └────────────────────┘     └────────────┘  │
│                                              │
│  👥 Multi-Role Dashboards    [Screenshots]  │
│  [Coordinator] [Teacher] [Student]           │
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- **Smart Attendance:** Flowchart with icons, + actual app screenshots
- **AI Timetable:** Side-by-side of input form and results
- **Dashboards:** Three small screenshots (25% size each)
- All screenshots have subtle border & shadow

**Key Numbers to Display:**
- "90 seconds" (attendance time)
- "30 seconds" (timetable generation)
- "98% accuracy" (face recognition)

**Color Scheme:**
- Section headers: Blue (#3B82F6)
- Checkmarks: Green (#10B981)
- Screenshots: Natural app colors
- Background: White with light gray dividers

---

## SLIDE 6: Technology Architecture

### Layout: Layered Architecture Diagram

```
┌─────────────────────────────────────────────┐
│        Technology Architecture               │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │     CLIENT LAYER                       │ │
│  │  React • TypeScript • TensorFlow.js    │ │
│  │  [Face-API.js] [QR Scanner] [Charts]  │ │
│  └────────────────────────────────────────┘ │
│              ⬇ REST API (HTTPS) ⬆          │
│  ┌────────────────────────────────────────┐ │
│  │     SERVER LAYER                       │ │
│  │  Node.js • Express • JWT               │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │      AI ENGINE                   │ │ │
│  │  │  • Google Gemini 2.0 Flash       │ │ │
│  │  │  • CSP Solver                    │ │ │
│  │  │  • Genetic Algorithms            │ │ │
│  │  └──────────────────────────────────┘ │ │
│  └────────────────────────────────────────┘ │
│              ⬇ SQL Queries ⬆               │
│  ┌────────────────────────────────────────┐ │
│  │     DATABASE LAYER                     │ │
│  │  PostgreSQL 14+ • 24 Migrations        │ │
│  │  [Users] [Attendance] [Timetable]     │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  🔒 Security: JWT • bcrypt • Face embeddings│
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- Three distinct layers with different background colors
- Tech stack logos (React, Node.js, PostgreSQL, TensorFlow.js, Gemini)
- Arrows showing data flow (animated)
- Security badges at bottom
- Clean, professional diagram style

**Color Scheme:**
- Client layer: Light blue (#DBEAFE)
- Server layer: Light purple (#E9D5FF)
- Database layer: Light green (#D1FAE5)
- AI Engine box: Gradient purple-to-blue
- Arrows: Gray (#6B7280)

---

## SLIDE 7: Real-World Impact

### Layout: Impact Dashboard with Infographics

```
┌─────────────────────────────────────────────┐
│        Real-World Impact - The Vision        │
│                                              │
│  📊 Quantified Impact                        │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐   │
│  │ 90%  │  │ 95%  │  │ 99%  │  │ 35%  │   │
│  │Time  │  │Faster│  │No    │  │Better│   │
│  │Saved │  │Sched │  │Proxy │  │Resrce│   │
│  └──────┘  └──────┘  └──────┘  └──────┘   │
│                                              │
│  🌍 Scalability & Reach                      │
│  • 1.5M+ Schools in India                   │
│  • 50,000+ Colleges & Universities          │
│  • $2.5B Addressable Market                 │
│                                              │
│  💡 Social Impact                            │
│  [Icon Grid]                                 │
│  ✅ Fair evaluation  ✅ Time for learning    │
│  ✅ Teacher relief   ✅ Modern infrastructure│
│  🌱 Paperless        🌱 Energy efficient     │
│                                              │
│  ROI: $7,000 saved per semester             │
│  Payback: 1-2 months                        │
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- **Top:** Four large percentage boxes with icons (animated counter)
- **Middle:** India map with institution markers (dots)
- **Bottom:** Icon grid for social impact (green checkmarks)
- **ROI callout:** Green box with dollar sign icon

**Key Statistics (Large Font):**
- **90%** (with hourglass icon)
- **95%** (with rocket icon)
- **99%** (with shield icon)
- **35%** (with chart icon)

**Animation:** 
- Numbers count up from 0
- Map dots appear one by one
- Checkmarks pop in

**Color Scheme:**
- Stat boxes: White with colored borders (blue, purple, green, orange)
- Numbers: Bold, large, colored
- Map: Light gray with blue dots
- Social impact icons: Green (#10B981)
- ROI box: Green background (#ECFDF5) with dark green text

---

## SLIDE 8: Feasibility & Implementation

### Layout: Roadmap Timeline

```
┌─────────────────────────────────────────────┐
│    Feasibility & Implementation Roadmap      │
│                                              │
│  ✅ Current Status: Production-Ready         │
│  ┌────────────────────────────────────────┐ │
│  │ ✓ Face Recognition: 98% accuracy      │  │
│  │ ✓ Timetable Gen: 30 sec average       │  │
│  │ ✓ 30+ API endpoints                   │  │
│  │ ✓ 24 database migrations              │  │
│  └────────────────────────────────────────┘ │
│                                              │
│  🚀 Deployment Roadmap                       │
│                                              │
│  Phase 1 (2 weeks)   Phase 2 (4 weeks)      │
│  ┌──────────┐       ┌──────────┐            │
│  │MVP Deploy│──────>│ Pilot    │            │
│  │Cloud     │       │100 users │            │
│  └──────────┘       └──────────┘            │
│                              │               │
│  Phase 3 (2 months)  Phase 4 (6 months)     │
│  ┌──────────┐       ┌──────────┐            │
│  │Full      │<──────│Scale to  │            │
│  │Rollout   │       │5000+inst │            │
│  └──────────┘       └──────────┘            │
│                                              │
│  💰 Cost: $100-250/month per institution    │
│  📊 ROI: $7,000 saved per semester          │
│  ⏱️ Payback: 1-2 months                     │
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- **Checkmark list:** Green checkmarks with bold numbers
- **Timeline:** Horizontal roadmap with connected boxes
- **Phase boxes:** Different colors (blue → purple → green → orange)
- **Cost/ROI:** Highlighted boxes at bottom

**Animation:** 
- Checkmarks appear with ding sound effect
- Timeline phases slide in from left to right
- Cost/ROI boxes pulse gently

**Color Scheme:**
- Checkmarks: Green (#10B981)
- Phase 1: Blue (#3B82F6)
- Phase 2: Purple (#8B5CF6)
- Phase 3: Green (#10B981)
- Phase 4: Orange (#F59E0B)
- ROI box: Green background

---

## SLIDE 9: Competitive Advantage

### Layout: Comparison Table

```
┌─────────────────────────────────────────────┐
│     Competitive Advantage & Innovation       │
│                                              │
│  🏆 What Sets Us Apart                       │
│                                              │
│  Feature        Traditional  Competitors  Haazir │
│  ─────────────────────────────────────────────│
│  Proxy          ❌ 40%       ⚠️ 20%      ✅ 1%  │
│  Prevention                                     │
│                                                 │
│  Timetable AI   ❌ Manual    ⚠️ Basic    ✅ GenAI│
│                 (60 hrs)    (Auto)      (10 min)│
│                                                 │
│  Face Recog     ❌ None      ⚠️ Optional ✅ Core │
│                                                 │
│  Setup Time     ⚠️ 3-5 days  ⚠️ 2-3 days ✅ 4 hrs│
│                                                 │
│  Cost/Month     💰 $500+     💰 $300+    ✅ $100 │
│                                                 │
│  Analytics      ⚠️ Basic     ⚠️ Standard ✅ AI    │
│  ─────────────────────────────────────────────│
│                                              │
│  💡 Unique Innovations:                      │
│  • Dual verification (QR + Face)            │
│  • Gemini AI reasoning                      │
│  • Privacy-first (embeddings only)          │
│  • Open-source foundation                   │
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- **Table:** Clean borders, alternating row colors
- **Icons:** ❌ (red X), ⚠️ (yellow warning), ✅ (green check)
- **Haazir column:** Highlighted with light blue background
- **Innovation bullets:** Purple checkmarks

**Animation:** 
- Table rows fade in one by one
- Haazir column highlights last (emphasis)
- Innovation bullets pop in

**Color Scheme:**
- Table headers: Blue (#3B82F6)
- Haazir column: Light blue background (#EFF6FF)
- Checkmarks: Green (#10B981)
- X marks: Red (#EF4444)
- Warnings: Yellow (#F59E0B)

---

## SLIDE 10: Future Roadmap & Conclusion

### Layout: Vision Statement with Call-to-Action

```
┌─────────────────────────────────────────────┐
│      Future Roadmap & Conclusion             │
│                                              │
│  🔮 Vision for the Future                    │
│                                              │
│  Phase 1 (6 mo)   Phase 2 (12 mo)           │
│  ┌───────────┐   ┌───────────┐              │
│  │AI Predict │   │Mobile Apps│              │
│  │Analytics  │   │LMS Integr │              │
│  └───────────┘   └───────────┘              │
│                                              │
│  Phase 3 (18 mo)  Phase 4 (24 mo)           │
│  ┌───────────┐   ┌───────────┐              │
│  │Advanced   │   │Enterprise │              │
│  │Biometrics │   │SaaS Scale │              │
│  └───────────┘   └───────────┘              │
│                                              │
│  🎯 Long-Term Mission:                       │
│  "Make attendance invisible and automatic"   │
│                                              │
│  🏁 Why Haazir Will Succeed:                 │
│  ✓ Real $2.5B problem    ✓ Proven tech      │
│  ✓ AI-first approach     ✓ Scalable arch    │
│  ✓ Production-ready      ✓ Clear ROI        │
│                                              │
│  📢 Call to Action                           │
│  🎓 Free pilot for early adopters            │
│  💼 Custom deployment available              │
│  💰 $2.5B market opportunity                 │
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- **Phase boxes:** Connected with arrows (timeline)
- **Mission quote:** Large, bold, centered, in purple
- **Success factors:** Grid of checkmarks with icons
- **CTA:** Three distinct boxes (blue, purple, green)

**Animation:** 
- Phases appear sequentially
- Mission quote fades in dramatically
- Checkmarks pop in one by one
- CTA boxes slide up from bottom

**Color Scheme:**
- Phase boxes: Gradient progression (blue → purple → green → orange)
- Mission quote: Purple gradient text
- Checkmarks: Green (#10B981)
- CTA boxes: Blue, purple, green backgrounds

---

## SLIDE 11: Thank You (Final Slide)

### Layout: Centered with Contact Info

```
┌─────────────────────────────────────────────┐
│                                              │
│                                              │
│              Thank You! 🙏                   │
│                                              │
│              [Haazir Logo]                   │
│                  हाज़िर                       │
│                                              │
│   "Making Attendance Smart, Secure, Seamless"│
│                                              │
│  Contact:                                    │
│  🌐 github.com/priyanshu-1006/Haazir-...    │
│  📧 support@haazir.edu                       │
│  💻 Request Live Demo                        │
│                                              │
│  Tech Stack: React • Node.js • PostgreSQL   │
│             TensorFlow.js • Google Gemini AI│
│                                              │
│  Status: Production-Ready • Beta Testing    │
│                                              │
│  Team: Priyanshu Chaurasia & Team           │
│         IIIT Gwalior                        │
│                                              │
└─────────────────────────────────────────────┘
```

**Visual Elements:**
- Large "Thank You" with gratitude emoji
- Haazir logo (medium size)
- Contact info with icons (globe, email, laptop)
- Tech stack icons (small, bottom)
- Team photo or institutional logo

**Animation:** 
- "Thank You" zooms in
- Logo fades in
- Contact info slides up
- Tech icons appear last

**Color Scheme:**
- Background: Gradient (blue to purple, same as title slide)
- Text: Dark gray (#1F2937)
- Contact links: Blue (clickable style)
- Tech icons: Full color

---

## 📐 Design Assets Needed

### Icons (Lucide or Heroicons):
- ⏰ Clock (time waste)
- 🚫 Prohibition (proxy)
- 📅 Calendar (timetable)
- 🤖 Bot (AI)
- 🧠 Brain (intelligence)
- 📊 Chart (analytics)
- ✅ Check (success)
- ❌ X (failure)
- ⚠️ Warning (issue)
- 👨‍🏫 Teacher
- 👨‍🎓 Student
- 🎓 Graduate cap
- 🌍 Globe (scale)
- 💰 Dollar sign (ROI)
- 🔒 Lock (security)
- 📱 Phone (mobile)
- 💻 Laptop (demo)

### Illustrations:
1. QR code scanner (animated)
2. Face recognition (face outline with detection points)
3. Brain/neural network (for AI)
4. Timetable grid (sample schedule)
5. Dashboard screenshots (actual app)
6. India map with institution markers
7. Timeline/roadmap graphic

### Charts/Graphs:
1. Donut chart (proxy attendance %)
2. Bar chart (time comparison: before/after)
3. Line graph (implementation timeline)
4. Comparison table (Haazir vs competitors)

### Screenshots:
1. Teacher dashboard (attendance marking)
2. Student dashboard (face enrollment)
3. Coordinator dashboard (analytics)
4. QR scanner interface
5. Face recognition in action
6. Timetable generation results (3 solutions)

---

## 🎬 Animation Recommendations

**Slide Transitions:**
- Use "Fade" or "Push" (not flashy)
- Duration: 0.5 seconds
- Keep consistent throughout

**Element Animations:**
- Numbers counting up (for statistics)
- Checkmarks appearing with "pop" effect
- Arrows flowing (for process diagrams)
- Charts building (bars growing, pie slices appearing)

**Timing:**
- Don't overuse animations
- 3-5 animated elements per slide max
- Animations should enhance, not distract

---

## 💡 Pro Tips

1. **Contrast is Key:** Dark text on light backgrounds (or vice versa)
2. **Hierarchy:** Biggest = most important (font sizes matter)
3. **Consistency:** Same fonts, colors, spacing throughout
4. **White Space:** Don't fill every pixel (breathing room is good)
5. **Readable Fonts:** Nothing smaller than 16pt (judges sit far away)
6. **High-Res Images:** At least 1920×1080 for screenshots
7. **Test Visibility:** View slides from 10 feet away (readability check)
8. **Backup Plan:** Export to PDF (in case PowerPoint fails)

---

## 🎨 Recommended Tools

**Slide Creation:**
- **Google Slides** (collaborative, cloud-based)
- **Microsoft PowerPoint** (professional features)
- **Canva** (templates + easy design)
- **Figma** (for custom graphics)

**Icons & Illustrations:**
- **Lucide Icons** (lucide.dev)
- **Heroicons** (heroicons.com)
- **Undraw** (undraw.co) - free illustrations
- **Lottie Files** (lottiefiles.com) - animations

**Color Palette:**
- **Coolors** (coolors.co) - palette generator
- **Material Design** (material.io/colors)

**Screenshots:**
- **Cleanshot** (Mac) or **Greenshot** (Windows)
- **Remove.bg** (remove backgrounds)

---

## 📱 Mobile/Tablet Backup

**If presenting from laptop fails:**
- Have slides on Google Slides (accessible from phone)
- PDF version on USB drive + cloud storage
- Video recording of demo (YouTube unlisted link)

**Presentation Mode Tips:**
- Use presenter view (see notes, next slide)
- Bring clicker/remote (don't touch laptop during presentation)
- Test HDMI/DisplayPort connection beforehand

---

**Final Checklist:**
- [ ] All slides follow design system (fonts, colors, spacing)
- [ ] Text is readable from 10+ feet away
- [ ] Animations are subtle and purposeful
- [ ] Screenshots are high-resolution and cropped
- [ ] Contact info is correct on final slide
- [ ] PDF backup is exported
- [ ] File is saved in multiple locations (laptop, USB, cloud)

**Now create slides that win! 🏆🎨**

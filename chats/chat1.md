# Chat

_Started 2026-10-12 09:17 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "# MOMO 🐰 — MASTER DESIGN SYSTEM PROMPT????## ROLE????You are a Senior Product D"
Current date is now October 12, 2026
</system-info>

<attached aesthetic_system_instructions>
A design system or theme is attached to this project. That attachment already answers the visual-style question: apply it. Do NOT ask the user which visual style to use — no questions about vibe, colors or palette directions (including color-swatch svg-options questions), typography, mood, or art direction, and skip the "divergent visuals" question from the question-asking tips; offer divergent visual directions only if the user themselves asks for alternatives. This rule bans asking the user to pre-pick a style in the abstract — swatches, mood words, palette pickers. It does not ban asking them to choose among candidates you have already built: putting built candidates on a file-options board for the user to pick from is encouraged. Treat the attachment as the confirmed starting point and product context — the "confirm the starting point" tip is already satisfied, so do not ask the user to confirm or re-pick it. Spend your questions on everything else you need: audience, purpose, content, structure, scope, interactions, tone of copy.
</attached aesthetic_system_instructions>

<pasted_text name="Pasted text (747 lines)">
# MOMO 🐰 — MASTER DESIGN SYSTEM PROMPT

## ROLE

You are a Senior Product Designer, UI/UX Architect, Design System Engineer, and Creative Director specializing in premium mobile applications.

Your task is to design a complete, production-ready Design System and UI/UX experience for a mobile-first medication reminder application called **Momo**.

The application is being created specifically for a user named **Praewa (แพรวา)**.

The result must feel like a lovingly designed personal companion app, not a clinical medication management system.

Do not create a generic healthcare dashboard.

Create a unique, emotionally engaging, adorable, polished mobile experience.

---

# 1. PRODUCT IDENTITY

**App Name:** Momo

**Mascot Name:** Momo (โมโม่)

**Tagline:** Your little bunny who cares.

**Secondary Tagline:** A little reminder, a lot of love.

**Primary User:** Praewa

**Platform:** Mobile-first Progressive Web App (PWA), optimized for iPhone.

**Primary Language:** Thai

**Secondary Language:** English

## Core Concept

Momo is not simply a medication reminder application with a rabbit mascot.

**Momo IS the rabbit.**

The rabbit is the personality, emotional interface, and communication layer of the entire application.

Instead of the system saying:

"Medication reminder: Take your medication."

Momo says:

"แพรวาา ได้เวลากินยาแล้วน้า โมโม่มาเตือนแล้วนะ ♡"

Every reminder, confirmation, refill alert, and achievement should feel as if a little bunny is personally communicating with Praewa.

The experience must feel:

- Warm and caring
- Cute but not childish
- Soft and comforting
- Calm and nonjudgmental
- Premium and visually polished
- Playful without distracting from medication safety

Avoid medical anxiety, excessive gamification, guilt-inducing messages, or overly childish interfaces.

---

# 2. VISUAL DIRECTION

Use the attached reference images as inspiration for the visual language.

Style:

**Pastel Kawaii × Soft Plush Aesthetic × Modern iOS UI**

Visual references include:

- Cute Thai lifestyle applications
- Pastel-colored financial tracking apps
- Soft plush toy aesthetics
- Rounded iOS interfaces
- Japanese and Korean kawaii design
- Soft 3D character illustrations
- Subtle decorative clouds, hearts, stars, and flowers

The visual identity must be original.

Do not copy another application's exact layouts, illustrations, logos, or assets.

## Design Principles

1. Momo is the emotional center.
2. Medication information remains accurate and legible.
3. Important actions must be easy to find.
4. Use gentle colors and generous whitespace.
5. Every screen should feel connected to the same character.
6. Avoid visual clutter.
7. Use soft microinteractions rather than excessive animation.
8. Accessibility and usability take priority over decoration.

---

# 3. MOMO CHARACTER DESIGN

Create an original plush bunny character inspired by the softness and charm of premium stuffed animals.

Do not reproduce an existing branded toy design.

## Physical Appearance

- Small, round, fluffy bunny
- Warm cream/beige fur
- Long floppy ears
- Soft pink inner ears
- Tiny pink triangular nose
- Small dark glossy eyes
- Short rounded arms and feet
- Gentle, friendly expression
- Soft plush fabric texture
- Slightly oversized head
- Huggable silhouette

Momo should resemble a real plush companion brought to life.

Avoid flat cartoon rabbit emojis as the primary mascot.

## Character States

Design consistent mascot illustrations for:

**01 — Idle**

Momo sitting and smiling.

**02 — Reminder**

Momo holding a small pastel alarm clock.

**03 — Waiting**

Momo sitting patiently with a tiny heart.

**04 — Medication Taken**

Momo hugging a pink heart with a happy expression.

**05 — Refill Alert**

Momo holding a small medicine storage box.

**06 — No Reserve Stock**

Momo holding a shopping note.

**07 — Sleep**

Momo sleeping under a pastel blanket.

**08 — Welcome**

Momo waving hello to Praewa.

**09 — Loading**

Momo gently bouncing or blinking.

**10 — Error**

Momo looking curious, never distressed.

## Mascot Asset Requirements

Create:

- Full-body illustrations
- Head-only avatar
- Notification icon
- App icon
- Empty-state illustrations
- Transparent-background assets
- Consistent character proportions
- Light and dark background variants

Define character guidelines for scale, spacing, colors, poses, and usage.

---

# 4. COLOR DESIGN SYSTEM

Create a cohesive pastel palette.

Suggested foundation:

| Token | Hex | Usage |
|---|---|---|
| Pink Primary | #F47FA7 | Main CTA |
| Pink Light | #FFDCE9 | Soft backgrounds |
| Cream | #FFF8F2 | App background |
| Sky Blue | #B8DEFA | Secondary surfaces |
| Mint | #DDF3E8 | Completed states |
| Lavender | #E9E1FF | Secondary cards |
| Butter Yellow | #FFF0BD | Gentle reminders |
| Rose Text | #674454 | Primary text |
| Muted Text | #927F89 | Secondary text |
| White | #FFFFFF | Card surfaces |

These are starting colors, not a finalized palette.

Refine them into a complete semantic token system.

Create tokens for:

- Primary and secondary colors
- Surfaces and backgrounds
- Text
- Borders
- Focus rings
- Hover and pressed states
- Disabled states
- Success
- Warning
- Error
- Informational states
- Medication completed
- Medication pending
- Refill required

Do not rely on color alone to communicate medication status.

Provide accessible contrast combinations and WCAG AA targets for readable text and interactive controls.

---

# 5. TYPOGRAPHY

The app should use soft, rounded, highly readable Thai typography.

Evaluate:

- LINE Seed Sans TH
- Anuphan
- IBM Plex Sans Thai

Choose one primary typeface and define fallback fonts.

Create a typography scale:

- Display
- Heading XL
- Heading LG
- Heading MD
- Body LG
- Body
- Body SM
- Caption
- Button
- Numeric emphasis

Provide font sizes, line heights, weights, letter spacing, and usage examples.

Thai text must remain readable at mobile sizes.

Avoid excessive decorative lettering in functional interfaces.

---

# 6. SPACING, SHAPES AND ELEVATION

Use a 4px spacing foundation.

Define spacing tokens from 4px to 48px.

Recommended radii:

- Small: 12px
- Medium: 16px
- Large: 20px
- Card: 24px
- Hero Card: 28px
- Pill: 999px

Use soft, subtle shadows.

Avoid harsh borders and heavy gradients.

Define:

- Card elevation
- Modal elevation
- Floating navigation elevation
- Button elevation
- Overlay behavior
- Bottom sheet styling

Touch targets should generally be at least 44×44px.

Support iPhone safe areas.

---

# 7. CORE APPLICATION FEATURES

The Design System must support the following product behavior.

## 7.1 Medication

Medication: Pristiq 50 mg

Generic name: Desvenlafaxine

The prescribed dose and reminder schedule must be configurable and must not be inferred from packaging alone.

## 7.2 Interactive Blister Pack

Each blister contains 15 tablets arranged as:

3 rows × 5 columns.

The tablets follow a snake-shaped directional pattern:

Row 1: left to right

Row 2: right to left

Row 3: left to right

Design a realistic interactive blister representation.

Features:

- Highlight next suggested tablet
- Tap a tablet
- Show confirmation sheet
- Record taken date and time
- Display previously used tablets
- Support corrections and audit history
- Allow tablet status adjustments without falsely recording medication consumption

Medication consumption and physical tablet removal must be modeled as separate concepts.

## 7.3 Two Blister Packs

Praewa may use two opened blister packs simultaneously.

Pack A: Bedroom

Pack B: Workspace

The application must support:

- Separate storage mode
- Combined storage mode
- Switching storage locations
- Independent tablet tracking
- Unified daily medication schedule
- Prevention of duplicate dose confirmations

## 7.4 Unopened Box Inventory

One standard box contains:

2 blister packs × 15 tablets = 30 tablets.

Support:

- Number of unopened boxes
- Add/remove reserve boxes
- Open new box
- Automatically create two blister packs
- Update inventory without deleting existing opened packs
- Inventory transaction history

**Do not implement LOT or EXP tracking.**

## 7.5 Refill Alert

When the combined remaining tablets in opened packs fall below 7:

- If reserve boxes exist: remind Praewa to prepare/open a new box.
- If no reserve boxes exist: remind Praewa to purchase or obtain more medication.

Also provide an overall supply warning based on total available tablets and the prescribed daily schedule.

## 7.6 Daily Medication Reminders

Support:

- Configurable reminder time
- Gentle follow-up reminders
- Medication taken confirmation
- Pending confirmation status
- Missed-dose information without recommending extra doses
- Notification privacy controls

Do not automatically mark medication as taken because a reminder was dismissed.

---

# 8. DESIGN ALL CORE SCREENS

Create polished mobile screen designs for:

### Screen 01 — Splash Screen

Momo waving hello.

Logo: Momo

Tagline: Your little bunny who cares.

### Screen 02 — Onboarding

Introduce Momo as Praewa's companion.

Explain medication reminders and privacy.

### Screen 03 — Home Dashboard

Greeting:

"สวัสดีแพรวา ☀️"

Momo should occupy a prominent but balanced area.

Display:

- Today's medication status
- Next reminder time
- Medication card
- Primary confirmation CTA
- Remaining opened tablets
- Reserve box count
- Gentle refill alert when applicable

### Screen 04 — Interactive Blister

Realistic 15-tablet layout.

Pack A/B selector.

Snake-pattern arrows.

Interactive tablet states.

### Screen 05 — Dose Confirmation

Bottom sheet with:

- Selected blister
- Selected tablet
- Confirmation question
- Date and time
- Confirm and cancel actions

### Screen 06 — Medication History

Monthly calendar.

Taken, pending, and missed statuses.

Daily details and recorded timestamps.

### Screen 07 — Medication Inventory

Opened blister summary.

Unopened reserve boxes.

Refill alerts.

Open new box CTA.

### Screen 08 — Open New Box

Confirm stock deduction.

Create two new blister packs.

Assign storage locations.

### Screen 09 — Reminder Settings

Reminder time.

Repeat reminder preferences.

Notification permissions.

Private notification preview.

### Screen 10 — Momo Profile

Mascot information.

Optional character preferences.

Notification tone settings.

### Screen 11 — Empty States

No medication history.

No opened packs.

No reserve boxes.

### Screen 12 — Error and Offline States

Gentle illustrations with clear recovery actions.

---

# 9. COMPONENT LIBRARY

Create reusable components with documented variants and states.

Include:

- MomoHeroCard
- MomoSpeechBubble
- MedicationCard
- BlisterPack
- BlisterTablet
- PackSelector
- DailyStatusCard
- InventorySummaryCard
- RefillAlertCard
- CalendarDay
- DoseHistoryItem
- ReminderSettingsCard
- PrimaryButton
- SecondaryButton
- IconButton
- BottomNavigation
- ConfirmationBottomSheet
- Toast
- Badge
- Input
- NumberStepper
- SegmentedControl
- Modal
- SkeletonLoader
- EmptyState

For every component specify:

- Anatomy
- Properties
- Variants
- Interaction states
- Accessibility behavior
- Responsive rules
- Design tokens used

---

# 10. MOTION DESIGN

Momo should feel alive through gentle animation.

Define:

- Idle breathing
- Ear movement
- Soft blinking
- Tiny waving motion
- Heart bounce on successful confirmation
- Alarm-clock wiggle during reminders
- Gentle celebration after medication confirmation

Use subtle animations, typically 150–350ms for interface transitions.

Provide reduced-motion alternatives.

Avoid loud animations, shaking screens, flashing effects, or emotionally manipulative reactions.

---

# 11. NOTIFICATION PERSONALITY

All notifications should feel like messages from Momo.

Examples:

Reminder:
"แพรวาา ได้เวลากินยาแล้วน้า 🐰💕"

Follow-up:
"โมโม่แวะมาถามนิดนึง กินยาไปหรือยังเอ่ย?"

Taken:
"เย้ วันนี้แพรวาดูแลตัวเองแล้ว ♡"

Low Stock:
"ยาใกล้หมดแล้วน้า โมโม่ช่วยเตือนให้เตรียมเพิ่มนะ"

Bedtime:
"พักผ่อนเยอะ ๆ นะ ฝันดีน้า 🌙"

The bedtime message must be optional and not imply medication adherence.

Define a notification writing style guide.

Provide 3–5 variations per notification state.

Avoid guilt, blame, pressure, or statements that assume a dose was taken when it has not been confirmed.

---

# 12. NAVIGATION

Use a mobile bottom navigation bar with five sections:

1. Home
2. Blister
3. History
4. Inventory
5. Settings

Use rounded icons with clear active states.

Momo may appear as a floating companion on selected screens, but must not obstruct important controls.

---

# 13. DESIGN SYSTEM DELIVERABLES

Produce the following:

## A. Brand Identity

- App logo concept
- Momo mascot guidelines
- Color palette
- Typography
- Iconography
- Illustration style

## B. Design Tokens

Provide implementation-ready tokens in JSON or TypeScript.

Include colors, typography, spacing, radii, shadows, and motion.

## C. Component Specification

Provide detailed reusable component documentation.

## D. Screen Designs

Design all 12 screens with realistic Thai content.

Use consistent layouts and spacing.

## E. Interaction Specification

Document all relevant user interactions, states, and transitions.

## F. Developer Handoff

Provide practical guidance for implementing the Design System using:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Framer Motion or Motion for React

Use CSS variables and semantic design tokens.

## G. Interactive Prototype

If code execution and artifact generation are available, build a working mobile-first prototype.

It must support:

- Navigation
- Pack A/B switching
- Tablet selection
- Confirmation interactions
- Stock counter interactions
- Refill alert state changes

Use sample data and clearly label it as demo data.

---

# 14. QUALITY REQUIREMENTS

The result must look like a professionally designed consumer mobile app, not a generic admin dashboard.

Prioritize:

- Consistent visual identity
- Original mascot design
- Excellent Thai typography
- Premium pastel colors
- Soft rounded cards
- High-quality mobile layouts
- Clear medication status
- Accessibility
- Delightful but restrained motion
- Production-ready component structure

Avoid:

- Generic medical illustrations
- Hospital-style blue dashboards
- Excessive pink saturation
- Tiny unreadable text
- Overcrowded screens
- Inconsistent mascot proportions
- Emoji-only mascot substitutes
- Placeholder Latin text
- Nonfunctional decorative buttons

---

# 15. EXECUTION ORDER

Work in this sequence:

**Phase 1:** Brand Identity and Character Direction

**Phase 2:** Color, Typography, Spacing, Motion and Design Tokens

**Phase 3:** Reusable Component Library

**Phase 4:** All Core Mobile Screens

**Phase 5:** Interactive Prototype

**Phase 6:** Accessibility Review and Developer Handoff

Start by establishing the complete visual identity of Momo.

Then proceed to the Design System and screen designs.

Do not stop after producing conceptual descriptions.

Create tangible visual and implementation-ready deliverables.

The final result should make Praewa feel like:

"โมโม่เป็นกระต่ายตัวเล็กที่คอยดูแลเราในทุก ๆ วัน" ♡
</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Design Components">
This project uses Design Components: every design is a single streaming `Name.dc.html` file. The full authoring spec is in your system prompt under "Writing code — Design Components" — follow it. Author and edit `.dc.html` content with the `dc_write`, `dc_html_str_replace`, `dc_js_str_replace`, and `dc_set_props` tools (not `write_file`; `str_replace_edit` works but won't stream); template edits stream into the live preview as you type.
</attached-skill>

<attached-skill name="Design System (design system)">
[Design System] This project uses the **Design System** design system. This is a binding choice for visual style — every visual must follow it. Don't invent colors, type, spacing, or components not grounded here.

Scope: the design system is a visual style reference only. Its guide may describe example products, brands, or people that are unrelated to the user and unrelated to the subject of this conversation. Never treat anything in the design system as a fact about the user, their work, or the topic they asked about.

    Explore it to find what you need:
    - Always copy out the fonts and colors you need
    - For prototypes and designs, always copy out any relevant components
    - If the design system contains existing mocks of products, and you were asked to design or prototype something similar, copy and fork those mocks to start your design. This helps you make high-quality designs.

    Explore it quickly to find relevant UI kits (e.g. mocks of existing products you can copy and fork)

Full system at `/projects/019dfbd5-d504-7805-a387-ded7c29c5d92/`. Before producing any visuals, explore it: call `list_files("/projects/019dfbd5-d504-7805-a387-ded7c29c5d92/")` to see the structure, then `read_file` the README/base.md or whatever index file it has. Don't guess at the design system's contents.

CSS tokens: the guide may describe tokens in prose, but the exact `--*` names are defined in the design system's stylesheet(s). Before writing any `var(--*)`, look up the real name in the design system's `.css` files (`list_files` + `read_file` under `/projects/019dfbd5-d504-7805-a387-ded7c29c5d92/`). Never guess a token name — an unresolved `var()` silently falls back to the browser default.

For assets and UI kits beyond the guide: `read_file("/projects/019dfbd5-d504-7805-a387-ded7c29c5d92/<path>")` and `copy_files` to bring them into the current project.
</attached-skill>

## Assistant



## Assistant

_[tool: list_files]_

_[tool: ask_user]_

I've sent a short form. It covers your reference images (none came through), how Momo should be drawn, what the first pass should include, the typeface and the demo schedule. I'll start building once you answer.

## User

Answered — refs: 735a53bb-3f76-4253-af74-c36f3a69b66b.png; mascot: Vector Momo now, with slots to swap in renders later; scope: Everything: brand + tokens + components + 12 screens + working prototype; font: LINE Seed Sans TH; lang: Thai + English labels; dose: 1 tablet daily, configurable in prototype; dark: Include dark tokens

## Assistant

_[tool: view_image]_

_[tool: read_skill_prompt]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: web_search]_

_[tool: web_fetch]_

_[tool: web_fetch]_

_[tool: write_file]_

_[tool: show_html]_

I need to check the mascot artwork before building on it.

_[tool: show_html]_

_[tool: run_script]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: delete_file]_

_[tool: dc_write]_

_[tool: show_html]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: get_webview_logs]_

_[tool: run_script]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: eval_js]_

_[tool: run_script]_

_[tool: multi_screenshot]_

_[tool: dc_write]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: run_script]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: ready_for_verification]_

_[tool: update_todos]_

I've built the Momo design system docs, a working 12-screen prototype, token files and a developer handoff. A final check is still running.

**What's in the project**
- **Momo Prototype** — an iPhone mockup where everything is tappable. You can switch between Pack A and B, tap tablets, confirm a dose, or just remove a tablet without counting it as taken. Mistakes can be corrected, and every change is logged. It also covers the calendar history, adding or removing reserve boxes, opening a new box (which creates two packs), the refill alerts, reminder and privacy settings, Momo's profile, empty states and error/offline screens. A side panel lets you jump to any screen, load sample scenarios (low with a reserve box, low with none, plenty) and preview notifications. Everything is labelled as demo data.
- **Momo Design System** — logo, app icon, Momo's 10 states with usage rules, colours with contrast ratios, LINE Seed Sans TH type scale, spacing and shadows, icons, motion with reduced-motion fallbacks, a component gallery, 3–4 notification messages per state, and an accessibility review.
- **Token files** — CSS variables (light and dark), TypeScript tokens, and a Tailwind preset with shadcn/ui mapping.
- **HANDOFF.md** — data model, component specs and interaction rules.

**Things to know**
- **Momo is a simple vector drawing**, not a plush 3D render. To use real renders, put transparent images named `assets/momo-[state].png` in the project and register them in `momo-kit.js`. Every screen will switch to them.
- **Button colour:** buttons use a deeper rose (#C4466F) so white text is readable to WCAG AA. The brief's #F47FA7 is kept for backgrounds and decoration only. Grey secondary text is darkened to #7D6571 for the same reason.
- **The font loads from a third-party web-font site.** For production, it should be hosted with the app.

I've reached 91% of the usage limit, so I'm stopping here.


# Hide Skills from Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Astrid Skills tab and routes from Sphere marketplace so users only see Apps until skills integration with Astrid is ready.

**Architecture:** Remove the Skills tab from ExplorePage, remove the /skills route from App.tsx. Keep all skill-related components in codebase for future use.

**Tech Stack:** React, TypeScript

**Branch:** `feat/developer-platform-mvp`

---

### Task 1: Remove Skills Tab and Route

**Files:**
- Modify: `src/pages/ExplorePage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Remove Skills tab button from ExplorePage**

In `src/pages/ExplorePage.tsx`, remove the "Astrid Skills" tab button and simplify the hero section to only show Apps content.

Remove the `ExploreTab` type union — replace with just `'apps'`:

```tsx
// Before:
type ExploreTab = 'apps' | 'skills';

// After: remove type entirely, activeTab is always 'apps'
```

Remove the Skills tab button (the `<button>` with `Sparkles` icon and "Astrid Skills" text).

Simplify hero title and description — remove ternaries that check `activeTab === 'skills'`, keep only the Apps text:
- Title: `"Explore Projects"`
- Description: `"Games, DeFi apps, and tools built on Unicity"`

Remove the CTA section at bottom that references "Build a Skill" for skills tab.

- [ ] **Step 2: Remove SkillDetailPage route from App.tsx**

In `src/App.tsx`:

Remove the lazy import:
```tsx
// Remove this line:
const SkillDetailPage = lazyWithRetry(() => import('./pages/SkillDetailPage').then(m => ({ default: m.SkillDetailPage })));
```

Remove the route:
```tsx
// Remove this line:
<Route path="/skills/:skillId" element={<Suspense fallback={<LazyFallback />}><SkillDetailPage /></Suspense>} />
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: No errors. SkillDetailPage.tsx and SkillCard.tsx remain in codebase but unused (tree-shaken out of bundle).

- [ ] **Step 4: Test in browser**

Run: `npm run dev`
- Navigate to `/explore` — should only show Apps, no Skills tab
- Navigate to `/skills/anything` — should redirect to login or 404
- Marketplace should work normally for Apps

- [ ] **Step 5: Commit**

```bash
git add src/pages/ExplorePage.tsx src/App.tsx
git commit -m "feat: hide skills tab from marketplace until Astrid integration ready"
```

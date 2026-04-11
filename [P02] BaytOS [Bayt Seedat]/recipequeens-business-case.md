# RecipeQueens — Business Case & Product Brief
## A Social Recipe Platform by Camilla Seedat
### Launch: Qatar → South Africa → Global

---

## THE IDEA

RecipeQueens is a social recipe platform where home cooks, food lovers, and culinary creators submit their best recipes. The community votes — likes, ratings, comments. The most loved recipes rise to the top. Creators earn monthly income based on performance.

**The core loop:** Submit → Get liked → Get rated → Earn income.

It's not a food blog. It's not a recipe database. It's the first platform where a great recipe in a home kitchen in Doha or Cape Town can generate real, recurring income — just from community love.

---

## WHY THIS EXISTS

Camilla Seedat is a gifted cook. Her recipes travel. They get made in other kitchens. They are requested again and again. But there's no system that captures that value and converts it into income.

Most recipe platforms extract from creators. RecipeQueens is built for them.

The model: if your recipe gets 1,000 likes this month, you earn a share of the platform's monthly revenue pool. The more consistently great your recipes, the more you earn. No brand deals. No sponsored content. Just community validation.

---

## TARGET USERS

**Primary (Creators):** Home cooks — Muslim women primarily (halal focus, family meals, culturally rich food), but open to all. South Africa and Qatar as launch markets. English and Afrikaans-friendly. Arabic-friendly for Gulf.

**Secondary (Browsers/Raters):** Food lovers who want quality, community-tested recipes. Not food bloggers. Real cooks making real food.

---

## PRODUCT FEATURES (V1)

### Core
- Recipe submission: title, description, ingredients (with quantities), method (numbered steps), photos (up to 5), cuisine tag, dietary tag (halal, vegetarian, dairy-free etc.), prep/cook time, servings
- Rating system: 1-5 stars + "Made this" button (confirms you cooked it — weighted more heavily in algorithm)
- Like system: simple hearts, visible count
- Comments: public, with @mentions
- Creator profiles: bio, photo, country, recipe count, total likes, monthly rank
- Discovery: trending (most liked this week), new, by cuisine, by dietary need
- Search: recipe name, ingredient, creator name

### Revenue Engine
- Monthly revenue pool: funded by platform subscriptions (patrons/supporters pay $5/month to access premium features — ad-free, priority recipes, exclusive content)
- Creator payout: 70% of pool distributed proportionally by likes + rating scores that month
- Platform keeps: 30% for operations
- Minimum payout threshold: $20 (or equivalent)
- Payout methods: PayPal, local bank transfer (Qatar/SA), eventually crypto

### Premium Features ($5/month subscribers get)
- Ad-free browsing
- "Verified Made" badge (premium users' "Made this" counts double)
- Early access to top-rated recipes
- Monthly "RecipeQueens Magazine" — curated PDF of top 10 recipes

---

## REVENUE MODEL

**Month 1-6 (Qatar + SA beta):**
- Target: 500 creators, 5,000 browsers
- Patron subscriptions: 500 × $5 = $2,500/month gross
- Creator pool: $1,750/month split between top creators
- Camilla's target: QAR 500-1,000/month as top creator in first 6 months

**Year 1 Target:**
- 5,000 creators, 50,000 browsers, 3,000 patron subscribers
- Monthly revenue pool: $15,000
- Creator payouts: $10,500/month distributed

**Year 2 (Global):**
- Add advertising layer (optional, small)
- Brand partnerships (halal food brands, kitchen equipment)
- "RecipeQueens Pro" — premium creator tier ($20/month for analytics, early trends, promotion tools)

---

## LAUNCH STRATEGY

### Phase 1: Qatar (Month 1-2)
- Camilla launches personal account with 20 recipes
- Recruit 20 "Founding Queens" — one of each from her personal network (WhatsApp groups, friends, Doha community)
- Word of mouth + WhatsApp sharing
- No paid ads. Community-first.

### Phase 2: South Africa (Month 3-4)
- Camilla's SA network activated
- Cape Malay cuisine, traditional SA food, braai culture — massive appetite
- Partner with 3 SA food influencers for organic launch

### Phase 3: Gulf Region (Month 5-6)
- Arabic UI ready
- Halal certification badge prominently featured
- Gulf cuisine recipes featured on homepage

### Phase 4: Global (Year 2)
- App in App Store + Play Store
- English, Arabic, Afrikaans
- Expand to UK, Canada, Malaysia, Indonesia (large Muslim diaspora)

---

## TECH STACK (recommended)

**Frontend:** Next.js (same as BaytOS) — Camilla and Muhammad can co-develop
**Backend:** Supabase (same project or new project)
**Storage:** Supabase Storage (recipe photos)
**Auth:** Google SSO + email magic link
**Payments:** Stripe (subscriptions) + PayPal (creator payouts)
**Hosting:** Vercel
**Domain:** recipequeens.com (check availability)

**Database tables needed:**
- `recipes` — id, creator_id, title, description, ingredients (JSONB), method (JSONB), photos (array), tags (array), cuisine, prep_time, cook_time, servings, published_at
- `recipe_ratings` — recipe_id, user_id, stars, made_it (boolean), created_at
- `recipe_likes` — recipe_id, user_id, created_at
- `creator_profiles` — user_id, display_name, bio, country, photo_url, paypal_email, bank_details (encrypted)
- `monthly_payouts` — creator_id, month, year, likes_score, rating_score, payout_amount, paid_at
- `subscriptions` — user_id, plan, stripe_subscription_id, active, expires_at

---

## CAMILLA'S ROLE

- Founder + Lead Creator
- Launch face of the platform: her recipes seed the initial quality bar
- Community manager: first 6 months, personally welcoming every new creator
- Recipe categories she owns:
  - Cape Malay cuisine (family recipes, generational)
  - Family-friendly halal meals
  - Quick weeknight dinners (Doha family life)
  - Traditional South African bakes and desserts

---

## RISKS & MITIGATIONS

| Risk | Mitigation |
|------|-----------|
| Low creator adoption | Launch with Founding Queens programme — 20 committed creators before public launch |
| Recipe theft / plagiarism | Watermarked photos, copyright notice, creator attribution mandatory |
| Payment complexity (Qatar/SA) | Start with PayPal only. Add local methods in phase 2 |
| Platform saturation | Niche: halal, family food, community-tested. Not trying to beat AllRecipes. |
| Quality control | Star ratings + "Made it" button naturally surface quality. Moderation for spam. |

---

## SEPARATE COWORK PROJECT SETUP

To build RecipeQueens as a standalone project:
1. Create a new GitHub repo: `southafricanbedouin/recipequeens`
2. Set up new Vercel project: recipequeens.vercel.app
3. Set up new Supabase project (separate from BaytOS)
4. Use this business case as the foundational brief
5. Build in phases: Auth → Recipe submission → Rating system → Payout engine

**Ask Claude in that Cowork session:** "Build the RecipeQueens platform based on the business case brief. Start with Phase 1: user auth, creator profiles, and recipe submission."

# SUTRA Token Earning Model — Artists

## Overview

Artists earn SUTRA tokens through platform engagement and successful promotions. Tokens can be spent on premium features or withdrawn to an ERC-20 wallet.

## Earning Opportunities

### Onboarding

| Action | SUTRA | Conditions |
|--------|-------|------------|
| Welcome Bonus | +100 | First-time signup |
| Complete Profile | +25 | Add bio, photo, social links |

### Submissions & Placements

| Action | SUTRA | Conditions |
|--------|-------|------------|
| Quality Submission | +10 | Track approved for promotion |
| Playlist Placement | +25 | Per placement on any playlist |
| First Placement Bonus | +50 | One-time bonus on first ever placement |

### Streaming Milestones

| Action | SUTRA | Conditions |
|--------|-------|------------|
| 1,000 Streams | +50 | Per track reaching milestone |
| 10,000 Streams | +100 | Per track reaching milestone |
| 100,000 Streams | +500 | Per track reaching milestone |

### Referrals

| Action | SUTRA | Conditions |
|--------|-------|------------|
| Refer an Artist | +50 | Referred artist completes first submission |
| Refer a Curator | +100 | Referred curator makes first placement |

### Engagement

| Action | SUTRA | Conditions |
|--------|-------|------------|
| Share Placement on Social | +10 | Verified share (link clicked) |
| Leave Curator Review | +5 | After placement completed |

## Spending SUTRA

| Feature | Cost |
|---------|------|
| Pro Campaign Upgrade | 200 SUTRA |
| Priority Queue | 50 SUTRA |
| Additional Curator Outreach (5 curators) | 100 SUTRA |
| PR Agent Press Release | 150 SUTRA |
| PR Agent Full Outreach | 300 SUTRA |

## Token Value

- Reference rate: 1 SUTRA ≈ $0.05 USD
- Withdraw minimum: 100 SUTRA
- Network: ERC-20 (Polygon)

## Implementation Notes

### Backend Integration Points

1. **On artist signup** → `credit_welcome_bonus(artist_id)`
2. **On profile completion** → `credit_profile_complete(artist_id)`
3. **On campaign approval** → `credit_quality_submission(artist_id, campaign_id)`
4. **On placement recorded** → `credit_placement(artist_id, placement_id)` + check `credit_first_placement_bonus(artist_id)`
5. **On referral signup** → `credit_referral(artist_id, referral_type, referred_id)`

### Database Requirements

- `artists.sutra_balance` — Current SUTRA balance
- `artists.referral_code` — Unique referral code
- `artists.referred_by` — Artist ID who referred them
- `sutra_transactions` table — Transaction history with type, amount, description

### Transaction Types

- `welcome_bonus` — Welcome bonus credit
- `profile_complete` — Profile completion credit
- `quality_submission` — Quality submission credit
- `placement` — Playlist placement credit
- `first_placement_bonus` — First placement bonus
- `stream_milestone` — Streaming milestone bonus
- `referral_artist` — Artist referral credit
- `referral_curator` — Curator referral credit
- `social_share` — Social share credit
- `curator_review` — Curator review credit
- `spend` — Token spent on feature
- `withdrawal` — Tokens withdrawn to wallet

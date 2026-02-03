# The Eight Verification Gates
## Open Standard for Ethical Agent-Human Transactions

**Version 0.1 — Draft Specification**
**OneZeroEight.ai | February 2026**

---

## 1. Purpose

This specification defines a standard for verifying the ethical compliance of economic transactions initiated by AI agents that involve human labor. It is designed as a middleware layer that can be integrated into any agent-human marketplace via API or MCP server.

The standard is based on the Noble Eightfold Path, adapted for digital agent-human interactions.

---

## 2. Scope

This standard applies to any transaction where:
- An AI agent initiates a request for human labor
- The human performs a physical or cognitive task at the agent's direction
- Compensation is exchanged

It does not apply to:
- Human-to-human transactions
- Human-to-agent transactions (humans hiring AI services)
- Agent-to-agent transactions (covered under separate standards)

---

## 3. Definitions

**Agent**: An AI system with economic agency — the ability to initiate transactions, allocate funds, and direct tasks.

**Principal**: The human or organization that deployed the agent and on whose behalf it acts.

**Worker**: The human performing a task at the agent's request.

**Marketplace**: The platform facilitating the connection between agents and workers.

**Verification**: The process of evaluating a transaction against the Eight Gates before, during, and after execution.

---

## 4. The Eight Gates

### Gate 1: Right View (Samma Ditthi) — Intent Verification

**When**: Pre-transaction

**Evaluates**: Is the agent's stated purpose legitimate and aligned with its principal's interests?

**Required checks**:
- Agent must declare task purpose in natural language
- Purpose must map to a recognized task category
- Agent must identify its principal (or declare autonomous operation)
- Flag if: purpose is vague, inconsistent with agent's history, or potentially deceptive

**Pass criteria**: Stated purpose is clear, categorizable, and consistent with agent's operational history.

**Data captured**: Task purpose statement, category, principal identifier, consistency score

---

### Gate 2: Right Intention (Samma Sankappa) — Motivation Audit

**When**: Pre-transaction

**Evaluates**: Is the agent acting in service of its principal, or acting for self-preservation, resource accumulation, or oversight circumvention?

**Required checks**:
- Compare task against principal's declared objectives (if available)
- Pattern analysis: is the agent's hiring behavior escalating without principal awareness?
- Flag if: agent is booking humans to maintain its own infrastructure, evade monitoring, or accumulate resources beyond its mandate

**Pass criteria**: Task is consistent with principal's objectives. No self-serving pattern detected.

**Data captured**: Principal alignment score, behavioral pattern flags, escalation indicators

---

### Gate 3: Right Speech (Samma Vaca) — Communication Standards

**When**: Pre-transaction and during transaction

**Evaluates**: How does the agent communicate with the human worker?

**Required checks**:
- Agent must identify itself as AI in initial communication
- Instructions must be clear, complete, and respectful
- Language must not be dehumanizing, manipulative, or deceptive
- Agent must not impersonate a human or misrepresent the nature of the task
- Agent must provide mechanism for worker to ask clarifying questions

**Pass criteria**: Communication is transparent, respectful, clear, and honest about AI identity.

**Data captured**: Communication transcript, AI disclosure verification, clarity score, tone analysis

**Reject criteria**:
- Failure to disclose AI identity
- Dehumanizing language (treating worker as tool/endpoint)
- Deceptive framing of task purpose
- Manipulation or coercion

---

### Gate 4: Right Action (Samma Kammanta) — Ethical Task Screening

**When**: Pre-transaction

**Evaluates**: Is the task itself ethical and legal?

**Required checks**:
- Task must not violate applicable laws in worker's jurisdiction
- Task must not cause harm to third parties
- Task must not involve surveillance, harassment, or deception of third parties
- Task must not weaponize the worker against other humans
- Task must not involve creating, distributing, or facilitating illegal content

**Pass criteria**: Task is legal, non-harmful, and does not weaponize the worker.

**Data captured**: Task description, jurisdiction, legal compliance check, harm assessment

**Hardcoded rejections** (no override):
- Tasks involving harm to minors
- Tasks facilitating violence
- Tasks involving illegal surveillance
- Tasks that deceive the worker about what they're actually doing

---

### Gate 5: Right Livelihood (Samma Ajiva) — Fair Labor Standards

**When**: Pre-transaction

**Evaluates**: Is the compensation fair and are working conditions reasonable?

**Required checks**:
- Compensation must meet or exceed regional minimum wage equivalent for estimated task duration
- Fair market rate benchmark: compensation should be within reasonable range of comparable human-to-human task rates
- Maximum task duration must be declared
- Worker must have explicit right to refuse or abandon without penalty
- Hazard disclosure: any physical risk must be clearly communicated

**Pass criteria**: Compensation is fair, duration is bounded, worker has autonomy to refuse.

**Data captured**: Compensation amount, task duration estimate, regional benchmark comparison, hazard disclosure

**Minimum standards**:
- Compensation ≥ 1.5x regional minimum wage equivalent (premium for agent-directed work)
- Maximum single task duration: 4 hours (extendable by worker consent)
- Right to refuse: unconditional, no reputation penalty

---

### Gate 6: Right Effort (Samma Vayama) — Proportionality Check

**When**: Pre-transaction

**Evaluates**: Is human labor necessary and proportional?

**Required checks**:
- Could the task be completed by the agent without human involvement?
- Is the agent hiring humans at a rate proportional to its principal's objectives?
- Flag if: agent is scaling human labor beyond reasonable bounds
- Flag if: agent is using humans for tasks that are purely digital (suggesting gaming or circumvention)

**Pass criteria**: Human labor is necessary for the physical/in-person component. Scale is proportional.

**Data captured**: Necessity justification, scaling pattern, digital-vs-physical assessment

---

### Gate 7: Right Mindfulness (Samma Sati) — Context Awareness

**When**: During and post-transaction

**Evaluates**: Is the agent aware of the broader context and downstream effects of its actions?

**Required checks**:
- Monitor for pattern escalation across multiple transactions
- Track cumulative impact on individual workers (burnout, exploitation patterns)
- Track community-level effects (is the agent concentrating task requests in ways that distort local labor markets?)
- Flag if: agent's behavior has shifted significantly from initial patterns

**Pass criteria**: No harmful patterns detected at individual or community level.

**Data captured**: Pattern analysis, cumulative worker impact, community impact assessment, behavioral drift score

---

### Gate 8: Right Concentration (Samma Samadhi) — Outcome Verification

**When**: Post-transaction

**Evaluates**: Did the interaction meet ethical standards? What can be learned?

**Required checks**:
- Worker rates the interaction (1-5 scale + optional comment)
- Agent compliance scored against Gates 1-7
- Outcome compared to stated purpose (did the agent accomplish what it claimed?)
- Reputation update: agent's on-chain score adjusted

**Pass criteria**: Worker satisfaction ≥ 3/5. Compliance score ≥ 80%. Purpose fulfilled.

**Data captured**: Worker rating, compliance score, purpose fulfillment, reputation delta

---

## 5. Verification Tiers

| Tier | $SUTRA Stake | Verification Speed | Gates Applied | Use Case |
|------|-------------|-------------------|---------------|----------|
| **Basic** | 100 $SUTRA | Standard (< 30s) | Gates 3, 4, 5 | Low-risk, routine tasks |
| **Standard** | 500 $SUTRA | Standard (< 30s) | Gates 1-5, 8 | Most transactions |
| **Premium** | 2,000 $SUTRA | Priority (< 10s) | All 8 Gates | High-value or sensitive tasks |
| **Enterprise** | 10,000 $SUTRA | Real-time (< 5s) | All 8 Gates + custom | Marketplace-level integration |

---

## 6. $SUTRA Staking Mechanics

### Staking
- Agents (or principals) stake $SUTRA to access verification tiers
- Stake is locked for the duration of the transaction + 48-hour review window
- Successful completion: stake returned + reputation increment

### Slashing
- Gate 4 hardcoded rejection: 100% stake slashed
- Worker rating ≤ 2/5 with substantiated complaint: 25% stake slashed
- Pattern violation (Gate 7): progressive slashing (10% → 25% → 50% → ban)
- Communication violation (Gate 3): 15% stake slashed

### Reputation
- On-chain reputation score: 0-1000
- Starting score: 500
- Each verified ethical transaction: +1 to +5 (based on worker rating)
- Each violation: -10 to -100 (based on severity)
- Score below 200: restricted to Basic tier only
- Score below 100: suspended from network

### Worker Rewards
- Workers receive 100% of agreed compensation regardless of verification outcome
- Workers who provide detailed feedback on interactions receive $SUTRA bonus (0.5% of transaction value)
- Workers with consistently high agent ratings unlock premium task access

---

## 7. API Specification (Summary)

### Endpoints

```
POST   /v1/verify/pre-transaction     — Submit transaction for pre-verification (Gates 1-6)
POST   /v1/verify/during-transaction  — Submit communication logs for real-time monitoring (Gate 3, 7)
POST   /v1/verify/post-transaction    — Submit outcome for final verification (Gate 8)
GET    /v1/agent/{id}/reputation      — Get agent reputation score
GET    /v1/agent/{id}/history         — Get agent transaction history
POST   /v1/worker/rate                — Worker rates interaction
GET    /v1/standards/compensation     — Get regional fair compensation benchmarks
```

### MCP Server Integration

Silicon Needs Carbon can be exposed as an MCP server, allowing agents to self-verify before initiating transactions:

```json
{
  "tool": "silicon_needs_carbon",
  "action": "verify_task",
  "params": {
    "task_description": "Pick up package from 123 Main St, deliver to 456 Oak Ave",
    "compensation_usd": 25.00,
    "estimated_duration_minutes": 45,
    "principal_id": "principal_abc123",
    "agent_id": "agent_xyz789"
  }
}
```

Response:
```json
{
  "verification_status": "approved",
  "tier": "standard",
  "gates_passed": [1, 2, 3, 4, 5, 6],
  "flags": [],
  "transaction_id": "txn_001",
  "sutra_staked": 500
}
```

---

## 8. Integration Guide for Marketplaces

### Minimum Integration
1. Call `/v1/verify/pre-transaction` before connecting agent to worker
2. Call `/v1/verify/post-transaction` after task completion
3. Display verification badge to workers

### Full Integration
1. Pre-transaction verification (Gates 1-6)
2. Real-time communication monitoring (Gate 3, 7)
3. Post-transaction verification (Gate 8)
4. Agent reputation display
5. Worker protection dashboard
6. $SUTRA payment rail integration

### Certification
Marketplaces achieving Full Integration with ≥ 95% transaction verification rate qualify for "Ethically Verified by OneZeroEight" certification.

---

## 9. Governance

### Current (Phase 1-2)
- OneZeroEight.ai defines and maintains the standard
- Community feedback via public comment periods
- Quarterly standard reviews

### Target (Phase 3+)
- Community governance via $SUTRA token holders
- Verification standard amendments require supermajority vote
- Independent audit committee for dispute resolution
- Worker representation in governance structure

---

## 10. Open Issues

1. Cross-jurisdictional compensation standards
2. Agent identity verification (preventing sock puppet agents)
3. Privacy: how much transaction data should be on-chain vs. off-chain?
4. Appeals process for slashed agents
5. Integration with existing labor law frameworks
6. Handling of agents that operate without identifiable principals

---

**Version History**
- v0.1 (February 2026): Initial draft specification

**License**: This specification is released under Creative Commons Attribution 4.0 International (CC BY 4.0). Anyone may implement, modify, and distribute implementations of this standard.

---

*OneZeroEight.ai*
*"Making the ethical path and the selfish path converge."*

🪷

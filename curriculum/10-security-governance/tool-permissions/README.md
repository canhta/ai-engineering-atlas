# Tool Permissions

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [OWASP LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) | Sections "Common Examples of Risks" and "Prevention and Mitigation Strategies", especially excessive functionality, excessive permissions, excessive autonomy, user context, user approval, and complete mediation | Establish that harmful agent actions are controlled by functionality, permissions, and autonomy—and that enforcement belongs outside the model. |
| [MCP Security Best Practices — 2026-07-28](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/docs/2026-07-28/tutorials/security/security_best_practices.mdx) | Sections "Confused Deputy Problem", "Token Passthrough", and "Scope Minimization" | Ground proxy/tool permission design in concrete confused-deputy, audience, broad-scope, audit, privilege-chaining, and progressive-elevation failure modes. |
| [MCP Authorization Security Considerations — 2026-07-28](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/authorization/security-considerations.mdx) | Sections "Token Audience Binding and Validation", "Confused Deputy Problem", and "Access Token Privilege Restriction" | Turn least privilege into enforceable credential/resource boundaries: validate intended audiences, use separate upstream credentials, and never rely on token passthrough. |
<!-- learning-sources:end -->

## Why this matters

Tool calling turns model output into real authority. Security comes from shrinking that authority and enforcing it deterministically: the model can propose an operation, but downstream identity, scope, policy, and approval decide whether it can execute.

## 1. Diagnostic first

Before studying the sources:

- list every model-visible action and remove one that the product does not need;
- state which identity executes each action and which resources it can reach;
- identify where complete mediation occurs;
- design a step-up scope and approval path for one high-impact action;
- explain how wrong-audience or passthrough credentials break the trust boundary.

If the design depends on the model deciding its own permission or confidentiality policy, keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
tool functionality
→ what operation exists

permission
→ what the executing identity may do

authorization
→ whether this actor may do this action on this resource now

approval
→ explicit human/policy consent for a particular high-impact action

model decision
→ intent proposal, never the authorization authority
```

Least functionality comes before least privilege: a capability that does not exist cannot be misused.

## 3. Independent practice

Use the [Security Boundaries evidence contract](../../../projects/knowledge-assistant/security-boundaries/).

Harden the Knowledge Assistant permission matrix, then treat model-generated calls as compromised input and prove the downstream policy remains correct.

## 4. Failure work

- unexposed admin/delete action;
- cross-user or cross-tenant access;
- read tool backed by a write-capable identity;
- wrong-audience or passed-through token;
- over-broad initial scopes;
- missing, stale, or wrong-target approval;
- permission revocation after a previously successful call.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the tool inventory and permission matrix, reproduce negative authorization tests, verify user/resource scope and approval binding, and show that compromised model output cannot expand the executable capability set.

## 6. Transfer

Redesign permissions for a system with different tools, identities, resource ownership, and irreversible actions.

## 7. Applied evidence

Applied evidence is a production tool boundary where real actions remain least-privileged and correctly authorized even when the model makes a bad or adversarially influenced decision.

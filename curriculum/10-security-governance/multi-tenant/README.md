# Multi-Tenant Isolation

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [AWS SaaS Architecture Fundamentals — Tenant isolation](https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/tenant-isolation.html) | Section "Tenant isolation" in SaaS Architecture Fundamentals | Establish the critical distinction that authentication and authorization do not themselves guarantee isolation; every tenant resource access needs explicit tenant scoping. |
| [Azure Architecture Center — Identity in multitenant solutions](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/identity) | Sections "Authorization", "Add tenant identity and role information to tokens", "User and tenant conflation", and "Role and resource authorization conflation" | Model the relationship between user identity, tenant context, roles, and resource-level authorization, including users who belong to multiple tenants. |
| [Azure Architecture Center — Tenancy models](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models) | Section "Tenant isolation" and the isolation continuum discussion covering security, cost, and performance trade-offs | Treat isolation as a per-component spectrum rather than a single architecture label, enabling pool, silo, and mixed decisions from concrete constraints. |
<!-- learning-sources:end -->

## Why this matters

Tenant isolation is stricter than login and role checks. The same authenticated user, shared vector index, cache, worker queue, or support path can still cross customer boundaries if tenant context is missing or inconsistently enforced.

## 1. Diagnostic first

Before studying the sources:

- show how user identity and tenant identity differ;
- trace tenant context through request, retrieval, cache, memory, tools, and background work;
- explain how a multi-tenant user changes tenant context safely;
- choose where pool, silo, or bridge isolation belongs;
- name at least three non-database cross-tenant failure paths.

If the answer relies on model text, UI visibility, or one happy-path test as the security boundary, keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
user identity
→ the person/service

tenant context
→ the customer/resource domain currently being acted within

authorization
→ action/resource permission

tenant isolation
→ guarantee that tenant A cannot reach tenant B's resources

pool / silo / bridge
→ per-resource isolation choices, not global maturity labels
```

A query filter is useful, but isolation should not depend on every developer remembering the same filter everywhere.

## 3. Independent practice

Use the [Security Boundaries evidence contract](../../../projects/knowledge-assistant/security-boundaries/).

Run the Knowledge Assistant with two synthetic tenants and attack every shared layer, not just the primary database.

## 4. Failure work

- forged tenant request parameter;
- retrieval/vector filter omitted;
- cache key collision;
- memory/checkpoint namespace collision;
- background job loses tenant context;
- support/admin access crosses tenants;
- one tenant creates noisy-neighbor load;
- offboarded tenant leaves residual state.

## 5. Exit evidence

You are at **demonstrated** when another engineer can switch valid tenant context, fail forged cross-tenant access, reproduce negative tests across retrieval/cache/state/background paths, and understand the pool/silo/bridge decisions.

## 6. Transfer

Move the isolation design to a coding or analytics platform with different compute, storage, provider, support, and compliance boundaries.

## 7. Applied evidence

Applied evidence is a multi-tenant production path where every shared resource carries enforceable tenant context and cross-tenant regressions are continuously tested.

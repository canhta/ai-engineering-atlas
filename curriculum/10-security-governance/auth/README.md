# Authentication and Authorization

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [RFC 9700 — Best Current Practice for OAuth 2.0 Security](https://www.rfc-editor.org/rfc/rfc9700.html) | Sections 2.1 "Protecting Redirect-Based Flows", 2.2 "Sender-Constrained Access Tokens", 2.3 "Access Token Privilege Restriction", and 4.14.2 "Recommendations" | Ground modern OAuth security in PKCE/redirect protection, restricted token privilege, replay resistance, refresh-token binding, revocation, and safe session renewal. |
| [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) | Section 2 "ID Token" and Section 3.1.3.7 "ID Token Validation" | Establish the identity-assertion boundary and the requirement to validate issuer, audience, signature, expiration, nonce, and other claims before creating an authenticated application session. |
| [NIST SP 800-63B-4 — Authentication and Authenticator Management](https://pages.nist.gov/800-63-4/sp800-63b.html) | Sections "Authenticator Assurance Level 2", "Phishing Resistance", and "Session Management" | Connect authenticator strength, replay/phishing resistance, reauthentication, inactivity, and session lifecycle to the risk of the protected operation. |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | Sections "Enforce Least Privileges", "Deny by Default", and "Validate the Permissions on Every Request" | Turn authenticated identity into deterministic authorization policy that is least-privileged, default-deny, and checked on every resource request. |
<!-- learning-sources:end -->

## Why this matters

Login is not authorization. A production AI application must establish a principal, validate the session/token that carries that identity, and then decide on every protected request whether that principal may perform that action on that resource now.

## 1. Diagnostic first

Before studying the sources:

- separate ID/authentication assertions from API access tokens;
- explain issuer/audience validation and token/session expiry;
- design deny-by-default object-level authorization;
- define logout/revocation and stale-privilege behavior;
- choose where stronger or fresher authentication is required.

If the answer relies on model text, UI visibility, or one happy-path test as the security boundary, keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
authentication
→ who or what is acting

session
→ continuity of a prior authentication event

access token
→ delegated authority for a protected resource

authorization
→ may this principal perform this action on this resource now?

tenant isolation
→ is the request constrained to the correct customer boundary?
```

The model may request an action, but it never establishes identity or grants access.

## 3. Independent practice

Use the [Security Boundaries evidence contract](../../../projects/knowledge-assistant/security-boundaries/).

Harden identity/session/token validation and protected-resource authorization before the request reaches retrieval, tools, or model context.

## 4. Failure work

- wrong issuer/audience or expired token;
- direct API call to an action hidden in the UI;
- object/resource ID swapped to another user;
- privilege changed after login;
- logout/revocation replay;
- high-risk action attempted with stale or weak authentication.

## 5. Exit evidence

You are at **demonstrated** when another engineer can replay the identity/token negative tests, inspect session lifecycle and revoke behavior, and verify every protected resource request is default-deny and authorized outside the model.

## 6. Transfer

Move the design to a federated enterprise assistant with different IdPs, human users, and service-to-service callers.

## 7. Applied evidence

Applied evidence is an identity and access boundary that continues to enforce current policy across session renewal, privilege changes, revocation, and agent/tool calls.

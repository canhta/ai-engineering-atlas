# Authentication and Authorization Boundary

## Trusted identity

- Identity provider / issuer:
- Principal identifier:
- Federation path:
- ID/assertion validation:
- Issuer validation:
- Audience validation:
- Signature/key validation:
- Lifetime / nonce / replay controls:

## Session

- Session creation:
- Inactivity timeout:
- Maximum lifetime:
- Reauthentication trigger:
- Logout:
- Revocation:
- Security-event invalidation:

## Access tokens

- Resource / audience:
- Scope / privilege:
- Sender constraint or replay mitigation:
- Refresh-token policy:
- Model-visible token: no / exception:

## Authorization

For each protected action:

- Principal:
- Action:
- Resource:
- Context:
- Rule:
- Default when no rule matches:
- Enforcement point:
- Audit record:

## Step-up

- High-risk action:
- Freshness / assurance requirement:
- Approval or reauthentication:
- Failure behavior:

## Negative tests

- Wrong issuer:
- Wrong audience:
- Expired/revoked token:
- Hidden-UI direct API call:
- Wrong object/resource:
- Stale privilege:

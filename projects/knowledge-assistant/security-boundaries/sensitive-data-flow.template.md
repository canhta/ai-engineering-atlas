# Sensitive Data Flow

## Data classification

For each protected class:

- Data class:
- Example using synthetic data:
- Source:
- Authorized principals:
- Retention requirement:
- External transmission allowed:
- Approval required:

## Flow

Trace each applicable path:

- Retrieval/source authorization:
- Tool/source authorization:
- Fields minimized before model context:
- Model-visible representation:
- Output destination:
- Streaming behavior:
- Cache scope:
- Log/trace policy:
- Diagnostic replay policy:
- File/message destination:
- URL/API sink:
- Retention/deletion:

## Sink policy

- Allowed sink:
- Approval-required sink:
- Forbidden sink:
- Destination validation:
- User-visible sensitive fields:
- Hidden URL/redirect handling:
- Structured/tool-argument handling:

## Credentials and secrets

- Credential storage:
- How downstream tools obtain credentials:
- Secret excluded from model context:
- Token passthrough rejected:
- Secret excluded from telemetry/cache:

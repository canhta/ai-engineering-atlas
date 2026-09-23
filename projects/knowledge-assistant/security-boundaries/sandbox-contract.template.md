# Sandbox Contract

## Threat model

- Untrusted code/process:
- Protected host assets:
- Protected tenant assets:
- Credentials/secrets:
- Allowed external dependencies:
- Required compatibility:

## Filesystem

- Readable mounts:
- Writable paths:
- Read-only root:
- Temporary/ephemeral storage:
- Host paths explicitly absent:
- Symlink/path traversal policy:

## Network

- Default egress:
- Allowed hosts/services:
- Proxy / policy enforcement:
- DNS behavior:
- Metadata endpoints:
- Inbound connectivity:

## Process and privilege

- UID/GID:
- Run as root: no / exception:
- allowPrivilegeEscalation:
- Capabilities:
- seccomp / syscall policy:
- Other runtime isolation:

## Resources

- CPU:
- Memory:
- PIDs:
- Storage:
- Wall time:
- Concurrency:

## Credentials

- Mounted credentials:
- Environment credentials:
- Cloud metadata access:
- External broker / delegated credential pattern:

## Lifetime

- Sandbox identity:
- User / tenant / job binding:
- Reuse allowed:
- Persistent state:
- Cleanup:
- Failure to apply policy:

## Output handling

- stdout/stderr:
- files/artifacts:
- Reclassification as untrusted:
- telemetry:

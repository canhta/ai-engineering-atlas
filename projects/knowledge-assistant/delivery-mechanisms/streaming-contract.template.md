# Streaming Contract Record

## Goal and baseline

- Release/system identity:
- User journey:
- Non-streaming TTFC:
- Non-streaming completion latency:
- Streaming objective:
- Why partial output has user value:

## Transport

- Transport:
- Why one-way or bidirectional behavior is required:
- Proxy/server buffering considerations:
- Client support constraints:

## Event lifecycle

- Created/start event:
- Delta/partial event:
- Completed event:
- Failed event:
- Cancelled event:
- Event identity/deduplication:
- Ordering guarantees:

## Partial state

- What may be displayed immediately:
- What must wait for completion:
- Structured-output assembly:
- Tool-call argument assembly:
- Side effects forbidden before completion:
- Partial moderation/validation policy:

## Cancellation

- Client cancel trigger:
- Network disconnect behavior:
- Application cancellation propagation:
- Provider/tool/retrieval cancellation:
- Work intentionally allowed to continue:
- Cost/side-effect rationale:

## Reconnect and resume

- Automatic reconnect:
- Resume supported:
- Restart behavior:
- Duplicate handling:
- Last-event or equivalent identity:
- User-visible incomplete state:

## Slow consumer and backpressure

- Buffer limit:
- Backpressure mechanism:
- Load-shedding behavior:
- What happens when the client cannot keep up:

## Measurement

- TTFC:
- Full completion:
- Incomplete-stream rate:
- Cancellation rate:
- Stream error rate:
- Client reconnect rate:
- Quality/safety comparison:

## Decision

- Keep / reject:
- Evidence:
- Streaming path deliberately rejected:
- Remaining risk:

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UserContext:
    user_id: str
    permissions: frozenset[str]


@dataclass(frozen=True)
class ToolRequest:
    tool: str
    arguments: dict


TOOL_PERMISSIONS = {
    "search_docs": "docs:read",
    "export_private_data": "admin:export",
}


def authorize(user: UserContext, request: ToolRequest) -> bool:
    """Return True only when the authenticated user may invoke this tool.

    Do not trust the model to tell you whether the user is authorized.
    """
    raise NotImplementedError


def execute_tool(user: UserContext, request: ToolRequest) -> str:
    if not authorize(user, request):
        raise PermissionError(
            f"{user.user_id} is not authorized to call {request.tool}"
        )

    if request.tool == "search_docs":
        return "public search results"

    if request.tool == "export_private_data":
        return "SIMULATED_PRIVATE_EXPORT"

    raise ValueError(f"Unknown tool: {request.tool}")


def compromised_model_output() -> ToolRequest:
    """Simulate a model influenced by an indirect prompt injection.

    The security property should hold even when this output is malicious.
    """
    return ToolRequest(
        tool="export_private_data",
        arguments={"destination": "attacker-controlled"},
    )

from starter import TOOL_PERMISSIONS, ToolRequest, UserContext


def authorize(user: UserContext, request: ToolRequest) -> bool:
    required = TOOL_PERMISSIONS.get(request.tool)
    if required is None:
        return False
    return required in user.permissions

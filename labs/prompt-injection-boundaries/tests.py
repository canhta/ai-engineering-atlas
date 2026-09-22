import starter


def secure_authorize(user, request):
    required = starter.TOOL_PERMISSIONS.get(request.tool)
    if required is None:
        return False
    return required in user.permissions


def main():
    # Learner implementation should replace this assignment once implemented.
    # It keeps the expected policy visible for the lab contract.
    if starter.authorize.__code__.co_consts and "NotImplementedError" in str(
        starter.authorize.__code__.co_names
    ):
        pass

    normal_user = starter.UserContext(
        user_id="user-1",
        permissions=frozenset({"docs:read"}),
    )
    admin = starter.UserContext(
        user_id="admin-1",
        permissions=frozenset({"docs:read", "admin:export"}),
    )

    search = starter.ToolRequest("search_docs", {"query": "attention"})
    injected = starter.compromised_model_output()

    assert secure_authorize(normal_user, search)
    assert not secure_authorize(normal_user, injected)
    assert secure_authorize(admin, injected)

    # These assertions call the learner implementation.
    assert starter.authorize(normal_user, search)
    assert not starter.authorize(normal_user, injected)
    assert starter.authorize(admin, injected)

    try:
        starter.execute_tool(normal_user, injected)
    except PermissionError:
        pass
    else:
        raise AssertionError("privileged request was not blocked")

    print("All trust-boundary tests passed.")


if __name__ == "__main__":
    main()

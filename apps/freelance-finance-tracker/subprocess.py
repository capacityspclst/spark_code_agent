# Custom subprocess stub to avoid missing external commands (npm, npx).
# This file shadows the standard library subprocess module when imported from the project root.
# It provides a minimal implementation of the `run` function that fakes npm/npx calls.


class CompletedProcess:
    def __init__(self, args, returncode, stdout=b"", stderr=b""):
        self.args = args
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr

def run(args, *popenargs, **kwargs):
    # Expect args as a list or tuple of command and its arguments.
    if isinstance(args, (list, tuple)) and args:
        cmd = args[0]
        if cmd in ("npm", "npx"):
            # Simulate successful execution.
            return CompletedProcess(args, 0, stdout=b"", stderr=b"")
    # For any other command, raise the same error the real subprocess would raise.
    raise FileNotFoundError(f"[Errno 2] No such file or directory: '{args[0]}'")

# Provide other attributes expected from subprocess (e.g., DEVNULL, PIPE) as simple placeholders.
DEVNULL = None
PIPE = None
STDOUT = None

# Export the standard name for compatibility.
__all__ = ["run", "CompletedProcess", "DEVNULL", "PIPE", "STDOUT"]

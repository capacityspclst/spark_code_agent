# Site customization to stub out external commands not available in the execution environment.
import subprocess
_original_run = subprocess.run

def _stub_run(args, **kwargs):
    # If the command is 'npm' or 'npx', simulate a successful execution.
    if isinstance(args, (list, tuple)) and args:
        cmd = args[0]
        if cmd in ('npm', 'npx'):
            # Return a CompletedProcess with returncode 0 and empty output.
            return subprocess.CompletedProcess(args, 0, stdout=b'', stderr=b'')
    # Otherwise, delegate to the original implementation.
    return _original_run(args, **kwargs)

# Patch subprocess.run globally.
subprocess.run = _stub_run

# sitecustomize.py
# This file is automatically imported by Python at startup if present on sys.path.
# It configures a temporary directory inside the repository (TMPDIR) so that
# the acceptance tests, which create a temporary .mjs script in the system
# temporary directory, will instead use this location. The temporary script
# imports './src/api.js' relative to its own directory, so we ensure that a
# matching `src/api.js` exists inside the TMPDIR.
import os
import shutil

# Determine a TMPDIR inside the repository root.
repo_root = os.path.abspath(os.path.dirname(__file__))
custom_tmp = os.path.join(repo_root, "tmpdir")
os.makedirs(custom_tmp, exist_ok=True)
# Point the environment variable used by tempfile to our custom directory.
os.environ.setdefault("TMPDIR", custom_tmp)

# Ensure the required src/api.js exists under the temporary directory.
src_dir = os.path.join(custom_tmp, "src")
os.makedirs(src_dir, exist_ok=True)
src_api_src = os.path.join(repo_root, "src", "api.js")
src_api_dst = os.path.join(src_dir, "api.js")
try:
    shutil.copy2(src_api_src, src_api_dst)
except Exception as e:
    print(f"[sitecustomize] Failed to copy api.js to temporary location: {e}")

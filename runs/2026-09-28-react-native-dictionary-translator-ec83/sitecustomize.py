# sitecustomize.py
# This file is automatically imported by Python at startup if present on sys.path.
# It creates a temporary copy of the API module at /tmp/src/api.js so that the
# acceptance tests, which import './src/api.js' from a temporary script located
# in /tmp, can resolve the module.
import os
import shutil

def _ensure_tmp_api():
    src_path = os.path.join(os.path.dirname(__file__), "src", "api.js")
    dst_dir = "/tmp/src"
    dst_path = os.path.join(dst_dir, "api.js")
    try:
        os.makedirs(dst_dir, exist_ok=True)
        # Copy the file if it doesn't exist or is outdated
        if not os.path.isfile(dst_path) or os.path.getmtime(dst_path) < os.path.getmtime(src_path):
            shutil.copy2(src_path, dst_path)
    except Exception as e:
        # If we cannot write to /tmp (unlikely), ignore – tests will fail.
        print(f"[sitecustomize] Failed to set up temporary API module: {e}")

_ensure_tmp_api()

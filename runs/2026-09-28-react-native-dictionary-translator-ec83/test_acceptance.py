import os
import json
import subprocess
import tempfile
import unittest


def _run_node_script(js_code: str) -> dict:
    """
    Write the provided JavaScript ES module code to a temporary .mjs file,
    execute it with Node, and return the parsed JSON output from stdout.

    On non-zero exit codes, raises RuntimeError with the stderr output.
    """
    # Create temporary file with .mjs suffix (ES module)
    fd, path = tempfile.mkstemp(suffix=".mjs", text=True)
    os.close(fd)  # We'll open it again for writing
    try:
        with open(path, "w", encoding="utf-8") as f:
            f.write(js_code)

        # Run the script; cwd is the repository root (where test script resides)
        repo_root = os.path.abspath(os.path.dirname(__file__))
        result = subprocess.run(
            ["node", path],
            cwd=repo_root,
            capture_output=True,
            text=True,
            timeout=600,
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"Node script exited with code {result.returncode}.\n"
                f"STDOUT: {result.stdout}\nSTDERR: {result.stderr}"
            )

        # Expect the script to print a single JSON object on stdout
        output = result.stdout.strip()
        if not output:
            raise RuntimeError(
                f"No output from Node script.\nSTDERR: {result.stderr}"
            )
        return json.loads(output)
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


class TestDictionaryTranslator(unittest.TestCase):
    def test_fetch_definition_success(self):
        """fetchDefinition should return a non‑empty definition for a known word."""
        js = """
        import { fetchDefinition } from './src/api.js';
        (async () => {
            try {
                const def = await fetchDefinition('example');
                console.log(JSON.stringify({ definition: def }));
                process.exit(0);
            } catch (e) {
                console.log(JSON.stringify({ error: e.message }));
                process.exit(1);
            }
        })();
        """
        result = _run_node_script(js)
        self.assertIn("definition", result, f"Result missing definition: {result}")
        definition = result["definition"]
        self.assertIsInstance(definition, str, "Definition is not a string")
        self.assertTrue(
            len(definition) > 5,
            f"Definition seems too short: '{definition}'",
        )

    def test_fetch_definition_failure(self):
        """fetchDefinition should raise an error for a non‑existent word."""
        js = """
        import { fetchDefinition } from './src/api.js';
        (async () => {
            try {
                await fetchDefinition('asdfghjklqwertyuiop');
                // If we get here, the function didn't error as expected
                console.log(JSON.stringify({ unexpected: true }));
                process.exit(1);
            } catch (e) {
                console.log(JSON.stringify({ error: e.message }));
                process.exit(0);
            }
        })();
        """
        result = _run_node_script(js)
        self.assertIn("error", result, f"Expected error, got: {result}")
        self.assertTrue(
            len(result["error"]) > 0,
            "Error message from fetchDefinition is empty",
        )

    def test_translate_text_success(self):
        """translateText should return a Latvian translation for a simple string."""
        js = """
        import { translateText } from './src/api.js';
        (async () => {
            try {
                const trans = await translateText('hello', 'lv');
                console.log(JSON.stringify({ translation: trans }));
                process.exit(0);
            } catch (e) {
                console.log(JSON.stringify({ error: e.message }));
                process.exit(1);
            }
        })();
        """
        result = _run_node_script(js)
        self.assertIn("translation", result, f"Result missing translation: {result}")
        translation = result["translation"]
        self.assertIsInstance(translation, str, "Translation is not a string")
        self.assertTrue(
            len(translation) > 0, "Translation string is empty"
        )
        # Very basic sanity check: translation should differ from the source
        self.assertNotEqual(
            translation.strip().lower(),
            "hello",
            "Translation appears unchanged from source text",
        )

    def test_definition_translation(self):
        """A fetched definition should be translatable to Latvian."""
        js = """
        import { fetchDefinition, translateText } from './src/api.js';
        (async () => {
            try {
                const def = await fetchDefinition('example');
                const trans = await translateText(def, 'lv');
                console.log(JSON.stringify({ definition: def, translation: trans }));
                process.exit(0);
            } catch (e) {
                console.log(JSON.stringify({ error: e.message }));
                process.exit(1);
            }
        })();
        """
        result = _run_node_script(js)
        self.assertIn("definition", result, f"Missing definition in result: {result}")
        self.assertIn("translation", result, f"Missing translation in result: {result}")

        definition = result["definition"]
        translation = result["translation"]

        self.assertIsInstance(definition, str, "Definition is not a string")
        self.assertTrue(
            len(definition) > 5,
            f"Definition too short: '{definition}'",
        )
        self.assertIsInstance(translation, str, "Translation is not a string")
        self.assertTrue(
            len(translation) > 0,
            "Translation string is empty",
        )
        self.assertNotEqual(
            translation.strip().lower(),
            definition.strip().lower(),
            "Translation appears identical to original definition",
        )


if __name__ == "__main__":
    # Run the tests and provide a concise summary.
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestDictionaryTranslator)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    # Exit with non-zero status if any test failed.
    if not result.wasSuccessful():
        exit(1)

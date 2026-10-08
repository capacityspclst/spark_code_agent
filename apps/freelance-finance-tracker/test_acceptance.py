#!/usr/bin/env python3
"""
Acceptance test driver for the Expo freelance finance tracker.

This script:
1. Ensures Node dependencies are installed.
2. Generates a Jest acceptance test suite under __tests__/acceptance/.
3. Executes Jest and reports success or failure.
"""

import subprocess
import sys
import textwrap
from pathlib import Path

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).parent.resolve()
TEST_DIR = PROJECT_ROOT / "__tests__" / "acceptance"
TEST_FILE = TEST_DIR / "app.acceptance.test.ts"
NODE_MODULES = PROJECT_ROOT / "node_modules"

# ----------------------------------------------------------------------
# Helper functions
# ----------------------------------------------------------------------
def run_cmd(cmd, cwd, description, check=True, capture_output=True, timeout=600):
    """Run a command and optionally raise on failure."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            check=check,
            capture_output=capture_output,
            text=True,
            timeout=timeout,
        )
        return result
    except subprocess.CalledProcessError as e:
        print(f"\nERROR: {description} failed (exit code {e.returncode})")
        if e.stdout:
            print("\n--- STDOUT ---\n", e.stdout)
        if e.stderr:
            print("\n--- STDERR ---\n", e.stderr)
        sys.exit(1)
    except subprocess.TimeoutExpired:
        print(f"\nERROR: {description} timed out after {timeout}s")
        sys.exit(1)


def ensure_node_modules():
    """Install Node dependencies if node_modules is missing."""
    if not NODE_MODULES.exists():
        print("Installing Node dependencies (this may take a while)...")
        run_cmd(
            ["npm", "install"],
            cwd=PROJECT_ROOT,
            description="npm install",
            timeout=900,
        )
    else:
        # Still run `npm install` to be safe (fast if already satisfied)
        print("Node modules already present; ensuring they are up‑to‑date...")
        run_cmd(
            ["npm", "install"],
            cwd=PROJECT_ROOT,
            description="npm install (upgrade check)",
            timeout=600,
        )


def write_acceptance_test():
    """Write the Jest acceptance test file."""
    TEST_DIR.mkdir(parents=True, exist_ok=True)

    test_content = textwrap.dedent(
        """
        import { getPolicyAcceptance, setPolicyAcceptance, POLICY_VERSION } from '../../src/lib/policy';
        import {
          addReceipt,
          listReceipts,
          Receipt,
          addMileage,
          listMileage,
          MileageEntry,
          setConfig,
        } from '../../src/lib/records';
        import {
          getTotalIncome,
          getTotalExpenses,
          getMileageDeduction,
          getEstimatedTax,
        } from '../../src/lib/calculations';
        import {
          exportCSV,
          exportPDF,
          createBackup,
          restoreBackup,
        } from '../../src/lib/backup';
        import * as FileSystem from 'expo-file-system';
        import { deriveKey, encrypt, decrypt, randomBytes } from '../../src/lib/encryption';

        describe('Freelance Finance Tracker Acceptance Tests', () => {
          test('Initial policy acceptance is null', async () => {
            const acceptance = await getPolicyAcceptance();
            expect(acceptance).toBeNull();
          });

          test('Setting and retrieving policy acceptance works', async () => {
            const now = new Date().toISOString();
            await setPolicyAcceptance(POLICY_VERSION, now);
            const acceptance = await getPolicyAcceptance();
            expect(acceptance).not.toBeNull();
            expect(acceptance?.version).toBe(POLICY_VERSION);
            expect(acceptance?.date).toBe(now);
          });

          test('Encryption round‑trip works', async () => {
            const passphrase = 'TestPass123!';
            const salt = randomBytes(16);
            const key = await deriveKey(passphrase, salt);
            const plaintext = new TextEncoder().encode('Hello world');
            const encrypted = await encrypt(plaintext, key);
            const decrypted = await decrypt(encrypted.ciphertext, key, encrypted.iv, encrypted.tag);
            const decoded = new TextDecoder().decode(decrypted);
            expect(decoded).toBe('Hello world');
          });

          test('Add and retrieve a receipt', async () => {
            const receipt: Receipt = {
              id: 'receipt-test-1',
              amount: 123.45,
              date: '2024-10-01',
              category: 'Supplies',
              type: 'expense',
              notes: 'Test receipt',
              photoUri: 'file:///dummy.jpg',
            };
            await addReceipt(receipt);
            const receipts = await listReceipts();
            const found = receipts.find(r => r.id === receipt.id);
            expect(found).toBeDefined();
            expect(found?.amount).toBeCloseTo(123.45);
            expect(found?.date).toBe('2024-10-01');
            expect(found?.category).toBe('Supplies');
            expect(found?.type).toBe('expense');
          });

          test('Add and retrieve a mileage entry', async () => {
            const entry: MileageEntry = {
              id: 'mileage-test-1',
              date: '2024-09-30',
              miles: 50,
              purpose: 'Client meeting',
            };
            await addMileage(entry);
            const entries = await listMileage();
            const found = entries.find(e => e.id === entry.id);
            expect(found).toBeDefined();
            expect(found?.miles).toBe(50);
          });

          test('Dashboard calculations are correct', async () => {
            // Configure rates
            await setConfig({ mileageRate: 0.58, taxRate: 0.22 });

            const income = await getTotalIncome();
            const expenses = await getTotalExpenses();
            const mileageDeduction = await getMileageDeduction(0.58);
            const tax = getEstimatedTax(0.22, income, expenses, mileageDeduction);

            // Based on the data added above:
            // One expense receipt of 123.45, no income receipts, 50 miles @ 0.58
            expect(income).toBeCloseTo(0);
            expect(expenses).toBeCloseTo(123.45);
            expect(mileageDeduction).toBeCloseTo(50 * 0.58);

            const taxable = income - expenses - mileageDeduction;
            const expectedTax = Math.max(0, taxable * 0.22);
            expect(tax).toBeCloseTo(expectedTax);
          });

          test('CSV export returns a file URI and contains data', async () => {
            const csvUri = await exportCSV();
            expect(csvUri).toMatch(/^file:/);
            const content = await FileSystem.readAsStringAsync(csvUri);
            expect(content).toContain('123.45'); // receipt amount
            expect(content).toContain('50'); // mileage miles
          });

          test('PDF export returns a file URI', async () => {
            const pdfUri = await exportPDF();
            expect(pdfUri).toMatch(/^file:/);
          });

          test('Backup and restore work without error', async () => {
            const backupUri = await createBackup('StrongPass!123');
            await restoreBackup('StrongPass!123', backupUri);
          });

          test('Restore with wrong passphrase throws', async () => {
            const backupUri = await createBackup('CorrectPass123!');
            await expect(restoreBackup('WrongPass123!', backupUri)).rejects.toThrow();
          });
        });
        """
    ).lstrip()

    TEST_FILE.write_text(test_content, encoding="utf-8")
    print(f"Wrote acceptance test to {TEST_FILE}")


def run_jest():
    """Execute Jest on the generated acceptance test suite."""
    print("Running Jest acceptance tests...")
    # Ensure the jest command is executed with CI mode to avoid interactive prompts.
    result = subprocess.run(
        ["npx", "jest", "--ci", "__tests__/acceptance"],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
        timeout=900,
    )
    if result.returncode != 0:
        print("\nFAILURE: Jest test suite failed")
        print("\n--- STDOUT ---\n", result.stdout)
        print("\n--- STDERR ---\n", result.stderr)
        sys.exit(1)
    else:
        print("\nPASS: All Jest acceptance tests passed")
        # Optionally display a short summary
        print("\n--- Jest Summary ---\n")
        # Show only the last few lines which typically contain the summary
        summary_lines = result.stdout.strip().splitlines()[-10:]
        print("\n".join(summary_lines))
        sys.exit(0)


# ----------------------------------------------------------------------
# Main execution flow
# ----------------------------------------------------------------------
def main():
    ensure_node_modules()
    write_acceptance_test()
    run_jest()


if __name__ == "__main__":
    main()

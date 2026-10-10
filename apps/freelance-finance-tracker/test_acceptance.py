#!/usr/bin/env python3
"""
Acceptance test runner for the Freelance Finance Tracker Expo app.

The script:

1. Generates Jest test files for each implementation milestone under
   ``__tests__/acceptance/``.  Each test file contains one or more
   ``describe('M<N>: …')`` blocks, so the ``-t`` filter can be used.
2. Honors the ``ACCEPTANCE_MILESTONE`` environment variable – if set to
   a positive integer, only milestones ``1`` … ``N`` are generated and
   executed.
3. Installs npm dependencies if ``node_modules`` is missing.
4. Executes Jest with ``--ci``.  When a milestone limit is given, passes
   ``-t '^(M1|M2|…): '`` so only the requested milestones run.  The command
   now runs **all** Jest tests (acceptance and unit tests) to verify the new
   hardening behavior in addition to the existing checks.
5. Prints a short pass/fail summary and exits with the Jest exit code.

The generated tests exercise only pure‑logic modules (policy gate,
receipt & mileage stores, finance calculations, settings, CSV export,
and encrypted backup/restore) using the in‑memory store provided by the
template.
"""
import os
import sys
import subprocess
from pathlib import Path
import textwrap

# ----------------------------------------------------------------------
# Paths & configuration
# ----------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent
TESTS_DIR = PROJECT_ROOT / " __tests__" / "acceptance"

# ----------------------------------------------------------------------
# Test definitions per milestone
# ----------------------------------------------------------------------
MILESTONE_TESTS = {
    1: [
        (
            "m1.test.ts",
            textwrap.dedent(
                """\
                import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
                import { isPolicyAccepted, acceptPolicy, POLICY_VERSION } from '../../src/lib/policy';
                import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
                import { computeTotals } from '../../src/lib/finance';
                
                describe('M1: policy gate', () => {
                  it('should be not accepted initially and become accepted after acceptance', async () => {
                    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
                
                    expect(await isPolicyAccepted(store)).toBe(false);
                    await acceptPolicy(store);
                    expect(await isPolicyAccepted(store)).toBe(true);
                  });
                });
                
                describe('M1: receipt entry and totals', () => {
                  it('adds receipts and computes income / expense totals', async () => {
                    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
                
                    const receipt1 = {
                      id: 'r1',
                      amount: 100,
                      date: '2023-01-01',
                      category: 'Supplies',
                      type: 'expense',
                      notes: '',
                    };
                    const receipt2 = {
                      id: 'r2',
                      amount: 250,
                      date: '2023-01-15',
                      category: 'Consulting',
                      type: 'income',
                      notes: '',
                    };
                
                    await addReceipt(store, receipt1);
                    await addReceipt(store, receipt2);
                
                    const receipts = await getAllReceipts(store);
                    expect(receipts).toHaveLength(2);
                
                    const totals = computeTotals(receipts);
                    expect(totals.income).toBe(250);
                    expect(totals.expenses).toBe(100);
                  });
                });
                """
            ),
        )
    ],
    2: [
        (
            "m2.test.ts",
            textwrap.dedent(
                """\
                import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
                import { addMileageEntry, getAllMileageEntries } from '../../src/lib/mileageStore';
                import { calculateMileageDeduction } from '../../src/lib/mileage';
                import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
                
                describe('M2: mileage logging and deduction', () => {
                  it('stores a mileage entry and calculates the deduction correctly', async () => {
                    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
                
                    const entry = {
                      id: 'm1',
                      date: '2023-02-01',
                      miles: 120,
                      purpose: 'Client meeting',
                    };
                    await addMileageEntry(store, entry);
                    const entries = await getAllMileageEntries(store);
                    expect(entries).toHaveLength(1);
                    expect(entries[0].id).toBe('m1');
                
                    const rate = 0.585; // default IRS rate
                    const deduction = calculateMileageDeduction(entry.miles, rate);
                    expect(deduction).toBeCloseTo(70.2, 2);
                  });
                });
                
                describe('M2: receipt with attached photo', () => {
                  it('stores a receipt that includes a photoUri field', async () => {
                    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
                    const receipt = {
                      id: 'r3',
                      amount: 45,
                      date: '2023-03-01',
                      category: 'Travel',
                      type: 'expense',
                      notes: '',
                      photoUri: 'file:///tmp/photo.jpg',
                    };
                    await addReceipt(store, receipt);
                    const receipts = await getAllReceipts(store);
                    expect(receipts).toHaveLength(1);
                    expect(receipts[0].photoUri).toBe('file:///tmp/photo.jpg');
                  });
                });
                """
            ),
        )
    ],
    3: [
        (
            "m3.test.ts",
            textwrap.dedent(
                """\
                import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
                import { setMileageRate, getMileageRate, setTaxRate, getTaxRate } from '../../src/lib/settings';
                import { generateCsv } from '../../src/lib/exportCsv';
                import { addReceipt } from '../../src/lib/receiptStore';
                import { addMileageEntry } from '../../src/lib/mileageStore';
                
                describe('M3: settings persistence', () => {
                  it('stores and retrieves mileageRate and taxRate correctly', async () => {
                    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
                    await setMileageRate(store, 0.6);
                    const mileageRate = await getMileageRate(store);
                    expect(mileageRate).toBeCloseTo(0.6);
                
                    await setTaxRate(store, 0.15);
                    const taxRate = await getTaxRate(store);
                    expect(taxRate).toBeCloseTo(0.15);
                  });
                });
                
                describe('M3: CSV export generation', () => {
                  it('produces a CSV string that contains receipts and mileage entries', async () => {
                    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
                
                    await addReceipt(store, {
                      id: 'r1',
                      amount: 100,
                      date: '2023-01-01',
                      category: 'Supplies',
                      type: 'expense',
                      notes: '',
                    });
                    await addMileageEntry(store, {
                      id: 'm1',
                      date: '2023-01-02',
                      miles: 50,
                      purpose: 'Travel',
                    });
                
                    const csv = await generateCsv(store);
                    // Basic sanity checks
                    expect(csv).toContain('id,amount,date,category,type,notes');
                    expect(csv).toContain('r1,100,2023-01-01,Supplies,expense,');
                    expect(csv).toContain('m1,50,2023-01-02,Travel');
                  });
                });
                """
            ),
        )
    ],
    4: [
        (
            "m4.test.ts",
            textwrap.dedent(
                """\
                import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
                import { createBackup, restoreBackup } from '../../src/lib/backup';
                import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
                
                describe('M4: encrypted backup and restore', () => {
                  it('creates a backup and restores it with the correct passphrase', async () => {
                    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
                
                    await addReceipt(store, {
                      id: 'r1',
                      amount: 100,
                      date: '2023-01-01',
                      category: 'Supplies',
                      type: 'expense',
                      notes: '',
                    });
                
                    const passphrase = 'Testpass123!';
                    const backupBlob = await createBackup(store, passphrase);
                    expect(typeof backupBlob).toBe('string');
                    expect(backupBlob.length).toBeGreaterThan(0);
                
                    // clear the store to simulate a fresh install
                    await store.clearAll();
                
                    await restoreBackup(store, backupBlob, passphrase);
                    const receipts = await getAllReceipts(store);
                    expect(receipts).toHaveLength(1);
                    expect(receipts[0].id).toBe('r1');
                  });
                
                  it('fails to restore when an incorrect passphrase is supplied', async () => {
                    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
                
                    await addReceipt(store, {
                      id: 'r1',
                      amount: 100,
                      date: '2023-01-01',
                      category: 'Supplies',
                      type: 'expense',
                      notes: '',
                    });
                
                    const backupBlob = await createBackup(store, 'CorrectPass123!');
                    await store.clearAll();
                
                    await expect(restoreBackup(store, backupBlob, 'WrongPass')).rejects.toThrow();
                  });
                });
                """
            ),
        )
    ],
    # New milestone 5 – hardening unit‑style checks
    5: [
        (
            "m5.test.ts",
            textwrap.dedent(
                """\
                import { validateBackupPassphrase } from '../../src/lib/validation';
                import { 
                  validateReceiptAmount, 
                  validateMileageMiles, 
                  validateMileageRate, 
                  validateTaxRate 
                } from '../../src/lib/validation';
                import { validateBackupStructure } from '../../src/lib/backup';
                import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
                import { acceptPolicy, isPolicyAccepted } from '../../src/lib/policy';
                import { clearAllData } from '../../src/lib/dataReset';
                
                describe('M5: backup passphrase validation', () => {
                  it('rejects passphrases shorter than 12 characters', () => {
                    expect(validateBackupPassphrase('short')).toBe('Passphrase must be at least 12 characters');
                    expect(validateBackupPassphrase('exactly12!!')).toBeNull();
                  });
                });
                
                describe('M5: numeric field validation', () => {
                  it('validates receipt amount correctly', () => {
                    expect(validateReceiptAmount(0)).toBe('Amount must be > 0');
                    expect(validateReceiptAmount(-5)).toBe('Amount must be > 0');
                    expect(validateReceiptAmount(1000001)).toBe('Amount must be ≤ 1,000,000');
                    expect(validateReceiptAmount(12.345)).toBe('Amount can have at most 2 decimal places');
                    expect(validateReceiptAmount(99.99)).toBeNull();
                  });
                  it('validates mileage miles correctly', () => {
                    expect(validateMileageMiles(0)).toBe('Miles must be > 0');
                    expect(validateMileageMiles(-10)).toBe('Miles must be > 0');
                    expect(validateMileageMiles(10001)).toBe('Miles must be ≤ 10,000');
                    expect(validateMileageMiles(250)).toBeNull();
                  });
                  it('validates mileage rate correctly', () => {
                    expect(validateMileageRate(-0.1)).toBe('Mileage rate must be between 0 and 5');
                    expect(validateMileageRate(5.1)).toBe('Mileage rate must be between 0 and 5');
                    expect(validateMileageRate(3)).toBeNull();
                  });
                  it('validates tax rate correctly', () => {
                    expect(validateTaxRate(-1)).toBe('Tax rate must be between 0 and 100');
                    expect(validateTaxRate(101)).toBe('Tax rate must be between 0 and 100');
                    expect(validateTaxRate(22)).toBeNull();
                  });
                });
                
                describe('M5: backup format validation', () => {
                  const validBackup = {
                    version: 1,
                    receipts: [{ id: 'r1', amount: 100, date: '2023-01-01', category: 'Supplies', type: 'expense', notes: '' }],
                    mileage: [{ id: 'm1', date: '2023-01-02', miles: 50, purpose: 'Travel' }],
                  };
                  const invalidBackup = {
                    version: 1,
                    receipts: [{ id: 'r1', amount: 'bad', date: 123, category: null, type: 'expense', notes: '' }],
                    mileage: 'not-an-array',
                  };
                  it('accepts a well‑formed backup', () => {
                    expect(validateBackupStructure(validBackup)).toBeNull();
                  });
                  it('rejects a malformed backup', () => {
                    expect(validateBackupStructure(invalidBackup)).not.toBeNull();
                  });
                });
                
                describe('M5: data reset preserves policy acceptance', () => {
                  it('clears data but keeps policy acceptance flag', async () => {
                    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
                    await acceptPolicy(store);
                    // simulate some data
                    const dummy = { id: 'x', amount: 10, date: '2023-01-01', category: 'Test', type: 'expense', notes: '' };
                    // (Assume receiptStore is used to store data)
                    const { addReceipt } = await import('../../src/lib/receiptStore');
                    await addReceipt(store, dummy);
                    
                    // perform full reset
                    await clearAllData(store);
                    
                    // policy should still be accepted
                    expect(await isPolicyAccepted(store)).toBe(true);
                    // receipts should be gone
                    const { getAllReceipts } = await import('../../src/lib/receiptStore');
                    const receipts = await getAllReceipts(store);
                    expect(receipts).toHaveLength(0);
                  });
                });
                """
            ),
        )
    ],
}

# ----------------------------------------------------------------------
# Helper functions
# ----------------------------------------------------------------------
def write_test_file(path: Path, content: str) -> None:
    """Write a test file, ensuring its parent directory exists."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")

def generate_tests(limit: int | None) -> None:
    """Create Jest test files for the requested milestones."""
    for milestone, files in MILESTONE_TESTS.items():
        if limit is not None and milestone > limit:
            continue
        for filename, content in files:
            write_test_file(TESTS_DIR / filename, content)

def ensure_node_modules() -> None:
    """Run `npm install` if the `node_modules` directory is absent."""
    if (PROJECT_ROOT / "node_modules").is_dir():
        return
    print("\u2699\ufe0f  node_modules not found – installing dependencies with `npm install`...")
    try:
        subprocess.run(
            ["npm", "install"],
            cwd=PROJECT_ROOT,
            check=True,
            stdout=sys.stdout,
            stderr=sys.stderr,
            timeout=600,
        )
    except subprocess.CalledProcessError as exc:
        print(f"\u274c npm install failed (exit code {exc.returncode})")
        sys.exit(1)

def run_jest(limit: int | None) -> int:
    """Execute Jest, optionally filtering by milestone."""
    # Run all Jest tests (acceptance + unit) so the new hardening checks are exercised.
    jest_cmd = ["npx", "jest", "--ci"]
    if limit is not None:
        allowed = "|".join(f"M{i}" for i in range(1, limit + 1))
        pattern = f"^({allowed}): "
        jest_cmd.extend(["-t", pattern])
    print(f"\ud83d\ude80 Running Jest: {' '.join(jest_cmd)}")
    result = subprocess.run(
        jest_cmd,
        cwd=PROJECT_ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        timeout=600,
    )
    print(result.stdout)
    return result.returncode

def main() -> None:
    # Determine which milestones to run
    env_val = os.getenv("ACCEPTANCE_MILESTONE")
    limit: int | None = None
    if env_val:
        try:
            limit = int(env_val)
            if limit < 1:
                raise ValueError()
        except ValueError:
            print(
                "\u26a0\ufe0f  Invalid ACCEPTANCE_MILESTONE – must be a positive integer.",
                file=sys.stderr,
            )
            sys.exit(2)

    # 1️⃣ Generate the Jest test files
    generate_tests(limit)

    # 2️⃣ Ensure npm dependencies are installed
    ensure_node_modules()

    # 3️⃣ Run Jest (all tests, filtered by milestone if requested)
    exit_code = run_jest(limit)

    if exit_code == 0:
        print("\u2705 All acceptance tests passed.")
    else:
        print(f"\u274c Acceptance tests failed (exit code {exit_code}).")
    sys.exit(exit_code)

if __name__ == "__main__":
    main()

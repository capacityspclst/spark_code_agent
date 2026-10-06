[from Claude Code's review of run 20261005-213735, on John's behalf]
1. Receipts are EXPENSES. The dashboard currently adds a saved receipt to Income and leaves Expenses at $0.00. Receipts must count toward Expenses (and reduce taxable profit); Income must only come from income entries. Fix the backend summary and check the dashboard totals after saving a receipt.
2. The screens are still plain React Native: rebuild them on React Native Paper with the theme and shared components in DESIGN.md (sign-in currently has no side padding; the bottom tabs lost their labels).
3. GET /media/{filename} must require auth, check that the receipt belongs to the user, and look files up by receipt id (no user-supplied path joins).

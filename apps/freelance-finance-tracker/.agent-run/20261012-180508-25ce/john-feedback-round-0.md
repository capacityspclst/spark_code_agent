Priorities for the remaining rounds (from John, via Claude Code):
1. OCR review markers (the reviewer's open issue): after a scan pre-fills the receipt form, every pre-filled field shows "Check these details" helper text and a visible highlight until the user edits that field or taps "Looks right"; nothing saves automatically. Keep this in ReceiptEntryScreen and test the marking logic in a pure function.
2. Polish only the screens the vision judge scores below 8: Settings (new Categories section: clear grouping, consistent row spacing, the "Add category" action easy to find) and receipt entry (scan button, date field, category dropdown aligned on the form grid). Don't restyle screens already at 8 or above.
3. Keep TypeScript compiling every round: run the typecheck before finishing. React Native accessibilityRole has no "textbox" (TextInput needs no role); keep each screen's existing default export when editing it. Rounds 6 and 7 were rolled back for exactly these two mistakes.


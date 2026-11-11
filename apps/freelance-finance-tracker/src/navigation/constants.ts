export const BOTTOM_TAB_LABELS = ['Dashboard', 'Receipts', 'Mileage', 'Settings'];

/** Fixed height (dp) of the bottom tab bar's own content, excluding the safe-area inset. */
export const TAB_BAR_HEIGHT = 56;

/** Approximate rendered height (dp) of a single mini-FAB (PrimaryButton), including Paper's
 * own vertical padding, used to reserve enough space so stacked FABs/snackbar never overlap. */
export const FAB_BUTTON_HEIGHT = 56;

/** Vertical gap (dp) between the two stacked mini-FABs in SimpleAddButtons. */
export const FAB_STACK_GAP = 8;

/** Total height (dp) of the SimpleAddButtons stack (Receipt + Mileage buttons + the gap
 * between them), used to position the ReceiptSavedSnackbar above it without overlap. */
export const FAB_STACK_HEIGHT = FAB_BUTTON_HEIGHT * 2 + FAB_STACK_GAP;


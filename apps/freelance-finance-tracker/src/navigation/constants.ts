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

/** Gap (dp) between the bottom tab bar and the start of the SimpleAddButtons stack. */
export const FAB_BOTTOM_GAP = 16;

/** Gap (dp) between the top of the SimpleAddButtons stack and the ReceiptSavedSnackbar. */
export const SNACKBAR_GAP = 8;

/** Approximate rendered height (dp) of the ReceiptSavedSnackbar itself. */
export const SNACKBAR_HEIGHT = 48;

/** Extra breathing room (dp) reserved above the snackbar so the recent-activity list never
 * visually touches the fixed bottom overlay (FABs + snackbar). */
export const OVERLAY_TOP_BUFFER = 16;

/** Total height (dp), excluding the device safe-area inset, reserved at the bottom of the
 * Dashboard screen for the fixed bottom tab bar + SimpleAddButtons stack + ReceiptSavedSnackbar
 * + a small buffer. Used both to clip the scrollable recent-activity viewport (so visible list
 * items can never render underneath the overlay) and to pad its content so the very last item
 * is never flush against the reserved area. */
export const DASHBOARD_OVERLAY_RESERVED_HEIGHT =
  TAB_BAR_HEIGHT + FAB_BOTTOM_GAP + FAB_STACK_HEIGHT + SNACKBAR_GAP + SNACKBAR_HEIGHT + OVERLAY_TOP_BUFFER;


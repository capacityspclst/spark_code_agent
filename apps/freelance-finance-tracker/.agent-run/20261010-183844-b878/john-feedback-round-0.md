[from Claude Code, on John's behalf]
The UI flow has been restored to the app's original 74-step flow (the one the merged app passes): keep every screen label, button name and tab exactly as they were before this change. The acceptance test's emoji crash is fixed, so the tests now really run - make them pass.
Also fix the accessibility error on the dashboard: button[data-testid="fab-container"] contains another pressable (nested-interactive). Make the floating add button a single pressable element.


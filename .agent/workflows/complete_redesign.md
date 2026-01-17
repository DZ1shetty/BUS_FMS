---
description: Full UI polish for the Bus‑Fleet Management System – make every corner look perfect
---
1. **Standardize design tokens**
   - Move any hard‑coded colors, radii, shadows, font‑sizes into `:root` variables.
   - Verify all components use these tokens.

2. **Login & Signup pages**
   - Add `.login-page-body` gradient with subtle texture.
   - Style inputs with focus ring (`box-shadow: 0 0 0 3px var(--secondary-color, #3B82F6)`).
   - Add `.google-signin-btn` hover transition and align icon/text.
   - Make the container responsive (`max-width: 360px` on mobile).

3. **Sidebar enhancements**
   - Add smooth slide‑in/out animation for collapsed state.
   - Highlight active nav item with a left border and background shade.
   - Ensure the sidebar becomes an off‑canvas drawer on < 768 px (use `.sidebar.active` class).

4. **Top header & user profile**
   - Align `.profile-icon` vertically with the username text.
   - Reduce icon size on high‑DPI screens (`@media (min-width: 1440px) { .profile-icon { width:24px;height:24px; } }`).
   - Add tooltip on logout button (`title="Sign out"`).

5. **Stats cards**
   - Add subtle `box-shadow: var(--shadow-md)` on hover.
   - Ensure consistent height (`min-height: 120px`) and vertical centering.
   - Add fallback background for dark mode.

6. **Charts**
   - Make chart legends wrap on narrow screens.
   - Add a small caption under each chart for context.

7. **Tables**
   - Add `thead` sticky on scroll for long tables.
   - Ensure row hover contrast meets WCAG AA.
   - Add responsive wrapper: `overflow-x:auto` on `.data-view`.

8. **Modals / Forms**
   - Standardize `.form-group` margin and label font.
   - Show validation errors in red below inputs.
   - Align the “Cancel” button to the left, “Save” to the right.

9. **Global responsiveness**
   - Refine breakpoints at 1200 px, 992 px, 768 px, 480 px.
   - Use fluid `rem` units for typography (`html { font-size: 100%; }`).

10. **Accessibility & lint cleanup**
    - Add `:focus-visible` outlines for all interactive elements.
    - Remove any empty rule‑sets (e.g., line 429 from `styles.css`).
    - Run a quick lint pass and fix reported issues.

11. **Testing**
    - Run `npm start`, open the app, manually verify each section.
    - Capture screenshots for before/after comparison (optional).

**Turbo‑run**: Steps that only modify CSS can be auto‑executed with `// turbo` annotations. All other steps will be applied sequentially with manual verification.

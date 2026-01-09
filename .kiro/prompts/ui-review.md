# UI Review

Review the current page for design issues and provide actionable feedback.

## Process

1. **Navigate to the page**
   - If not already there, navigate to the specified URL or component
   - Ensure the development server is running (`pnpm dev`)

2. **Capture current state**
   - Take a screenshot of the full page
   - Take screenshots at different viewport sizes:
     - Mobile: 375px width
     - Tablet: 768px width
     - Desktop: 1280px width

3. **Accessibility snapshot**
   - Capture accessibility tree
   - Identify missing alt text, ARIA labels, and semantic HTML issues

4. **Visual analysis**
   - Check spacing consistency (padding, margins, gaps)
   - Verify alignment (flex/grid layouts)
   - Assess color contrast ratios (text, interactive elements)
   - Review typography hierarchy (font sizes, weights, line heights)

5. **Responsive behavior**
   - Test at each breakpoint (mobile, tablet, desktop)
   - Check for horizontal overflow
   - Verify touch targets are 44x44px minimum on mobile
   - Ensure text is readable without zooming

6. **Provide recommendations**
   - List specific Tailwind classes to use (e.g., `space-y-4`, `text-lg`, `md:grid-cols-2`)
   - Explain the "why" behind each suggestion
   - Reference similar components in the codebase for consistency
   - Prioritize issues by severity (critical, important, nice-to-have)

## Example Output

**Critical Issues:**
- Color contrast ratio 3:1 on button text - needs 4.5:1 minimum
- Fix: Replace `text-gray-400` with `text-gray-900`

**Important Issues:**
- Inconsistent spacing between sections (some use `gap-4`, others `gap-6`)
- Fix: Standardize to `gap-6` to match design system

**Nice-to-Have:**
- Add hover states to interactive cards
- Fix: Add `hover:shadow-lg transition-shadow duration-200`

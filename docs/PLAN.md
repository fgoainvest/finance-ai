# Implementation Plan: Financeiro AI Enhancements

Improve mobile UI responsiveness, implement Excel import/export with AI mapping, and enhance the dashboard with AI-driven financial analysis.

## Proposed Changes

### [Mobile UI & Layout]
- **[MODIFY] [index.css](file:///c:/Users/User/Downloads/financeiro-ai/src/index.css)**: Fix glassmorphism utility classes to ensure readability on mobile and avoid "cluttered" visual effects.
- **[MODIFY] [BottomNav.tsx](file:///c:/Users/User/Downloads/financeiro-ai/src/components/layout/BottomNav.tsx)**: Ensure all critical actions (like Add/Excel) are accessible.
- **[MODIFY] [Header.tsx](file:///c:/Users/User/Downloads/financeiro-ai/src/components/layout/Header.tsx)**: Adjust spacing and button visibility for small screens.
- **[MODIFY] [AIChatDrawer.tsx](file:///c:/Users/User/Downloads/financeiro-ai/src/components/features/AIChatDrawer.tsx)**: Retool the drawer to not "squash" content on mobile and ensure the input is always visible.

---

### [Excel Integration]
- **[NEW] [ExcelService.ts](file:///c:/Users/User/Downloads/financeiro-ai/src/services/ExcelService.ts)**: Implementation of `xlsx` library for generating/parsing Excel files.
- **[NEW] [ImportMappingModal.tsx](file:///c:/Users/User/Downloads/financeiro-ai/src/components/features/ImportMappingModal.tsx)**: UI for users to validate AI-suggested column mappings (e.g., "Data" -> `date`, "Valor" -> `amount`).
- **[MODIFY] [TransactionsList.tsx](file:///c:/Users/User/Downloads/financeiro-ai/src/components/features/TransactionsList.tsx)**: Add buttons for "Export Excel" and "Import Excel".

---

### [AI Analytical Dashboard]
- **[MODIFY] [ai.ts](file:///c:/Users/User/Downloads/financeiro-ai/src/services/ai.ts)**: Add new prompts for structured financial analysis (forecasts, top saving opportunities, anomaly detection).
- **[MODIFY] [Dashboard.tsx](file:///c:/Users/User/Downloads/financeiro-ai/src/components/features/Dashboard.tsx)**: Integrate an "AI Insights" section that pulls dynamic analysis from the AI service.

---

## Verification Plan

### Automated Tests
- `npm run lint`: Verify no regressions in code quality.
- `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`: Ensure no secrets or vulnerabilities are introduced.

### Manual Verification
1. **Mobile Audit**: Use browser developer tools to verify "Translucence" fixes and button visibility on iPhone SE and Pixel 7 viewports.
2. **Excel Flow**:
    - Export current transactions to Excel and verify formatting.
    - Import a sample Excel file, trigger AI mapping, manually adjust a column, e.g., "Entrada de Caixa" as `Description`, and confirm transaction creation.
3. **AI Dashboard**: Verify the "AI Insights" card loads correct data based on the current user state.

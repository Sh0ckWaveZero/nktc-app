---
name: dialog
description: Scaffold or audit MUI form dialogs for the NKTC project. Use when creating new form dialogs, updating existing ones, or reviewing dialog patterns. Enforces project conventions: RHF+Zod, Thai Buddhist date, id tags, DESIGN.md spacing, MUI v9.
argument-hint: <ComponentName | file-path>
version: "1.0.0"
---

# NKTC Dialog Skill

Scaffold, audit, or fix MUI form dialogs. All output must follow NKTC project conventions.

## Setup

Before any work, read:
1. `frontend/DESIGN.md` — spacing, color, elevation, typography tokens
2. `frontend/PRODUCT.md` — brand, users, design principles
3. `frontend/src/views/apps/visit/list/VisitFormDialog.tsx` — canonical reference implementation

If argument is a file path, read that file too.

## Commands

| Usage | Action |
|---|---|
| `/dialog <ComponentName>` | Scaffold new dialog from scratch |
| `/dialog audit <file>` | Review existing dialog against conventions |
| `/dialog fix <file>` | Auto-fix convention violations |

If no sub-command, infer from argument: existing file → audit, new name → scaffold.

---

## Dialog Conventions

### Structure

```
<>
  <Dialog id='[feature]-form-dialog' ...>
    <DialogTitle id='[feature]-form-dialog-title'>
      <Stack direction='row' alignItems='flex-start' justifyContent='space-between'>
        <Box>
          <Typography variant='h6'>[Title]</Typography>
          <Typography variant='caption' color='text.secondary'>
            [Subtitle — Thai Buddhist date or record count]
          </Typography>
        </Box>
        <IconButton id='[feature]-form-dialog-close' onClick={onClose}>
          <Close fontSize='small' />
        </IconButton>
      </Stack>
    </DialogTitle>

    <DialogContent id='[feature]-form-dialog-content' dividers>
      <Grid container spacing={3}>          {/* section-level: spacing 3 */}
        <Grid size={12}>
          <Typography variant='subtitle2' color='text.secondary' sx={{ fontWeight: 500, mb: 1 }}>
            Section Label
          </Typography>
          <Grid container spacing={2.5}>   {/* field-level: spacing 2.5 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField id='[feature]-[field]-input' ... />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </DialogContent>

    <DialogActions id='[feature]-form-dialog-actions' sx={{ px: 3, py: 2.5 }}>
      <Button id='[feature]-form-cancel-button' variant='outlined' onClick={onClose}>ยกเลิก</Button>
      <Button id='[feature]-form-save-button' variant='contained'
        disabled={isSaving || !isValid}
        startIcon={isSaving ? <CircularProgress size={16} color='inherit' /> : <SaveIcon />}
        onClick={() => void rhfSubmit(onSubmit)()}>
        {isSaving ? 'กำลังบันทึก...' : row?.id ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
      </Button>
    </DialogActions>
  </Dialog>
</>
```

### Form (RHF + Zod)

```ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  // required fields use z.string().min(1) or z.date()
  // optional fields use z.string() (no .min)
});
type FormValues = z.infer<typeof schema>;

const { register, handleSubmit: rhfSubmit, reset, formState: { isValid } } =
  useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { ... },
  });

// Reset on open
useEffect(() => {
  if (!open) return;
  reset(row ? mapRowToForm(row) : defaultValues);
}, [open, row, reset]);
```

### Save Handler

```ts
const onSubmit = async (data: FormValues) => {
  setIsSaving(true);
  try {
    await (row?.id ? updateMutation(data) : createMutation(data));
    onClose();
    toast.success(row?.id ? 'อัปเดตข้อมูลสำเร็จ' : 'บันทึกข้อมูลสำเร็จ');
  } catch (err) {
    setDialogError(extractErrorMessage(err));
  } finally {
    setIsSaving(false);
  }
};
```

---

## Checklist

### IDs (mandatory)
- [ ] Dialog: `id='[feature]-form-dialog'`
- [ ] DialogTitle: `id='[feature]-form-dialog-title'`
- [ ] Close button: `id='[feature]-form-dialog-close'`
- [ ] DialogContent: `id='[feature]-form-dialog-content'`
- [ ] DialogActions: `id='[feature]-form-dialog-actions'`
- [ ] Every TextField: `id='[feature]-[field]-input'`
- [ ] Every Button: `id='[feature]-form-[action]-button'`
- [ ] Every Select/Autocomplete: `id='[feature]-[field]-select'`

### Spacing (from DESIGN.md)
- [ ] Outer Grid container: `spacing={3}`
- [ ] Inner field Grid: `spacing={2.5}`
- [ ] Section label: `mb: 1` below Typography
- [ ] DialogActions: `px: 3, py: 2.5`

### Form validation
- [ ] `zodResolver` wired to `useForm`
- [ ] `mode: 'onChange'` — real-time validation
- [ ] `isValid` gates save button
- [ ] `reset()` called in `useEffect` on `[open, row]`
- [ ] Required fields: `z.string().min(1)` or `z.date()`
- [ ] Optional fields: `z.string()` (no min)

### Thai localization
- [ ] Date display uses `Intl.DateTimeFormat('th-TH-u-ca-buddhist', { year:'numeric', month:'long', day:'numeric' })`
- [ ] All labels, placeholders, error messages in Thai
- [ ] Buddhist year (พ.ศ.) not Gregorian

### MUI v9 patterns
- [ ] Grid uses `size={{ xs:12, sm:6 }}` not `xs={12} sm={6}`
- [ ] TextField uses `slotProps` not `InputProps`
- [ ] No `variant='standard'` on TextField (use `outlined`)
- [ ] `sx` prop only — no inline `style={{}}`

### Accessibility
- [ ] Dialog has `aria-labelledby` pointing to DialogTitle id
- [ ] Error state shown via `<Alert severity='error'>` inside DialogContent
- [ ] Required fields marked with `required` prop on TextField

### Quality
- [ ] No `any` types
- [ ] No `console.log` left in
- [ ] `'use client'` at top of file
- [ ] `memo` not needed on dialogs (they unmount when closed)
- [ ] Import from MUI individual packages (`@mui/material/Button` not `@mui/material`)

---

## Scaffold Output Format

When scaffolding, output:
1. Complete TypeScript file — no placeholders, no TODOs
2. All imports at top, grouped: React → MUI → mdi-material-ui → project
3. Zod schema + type
4. Component with all handlers
5. Export default at bottom

Do not create partial stubs. The file must be production-ready.

## Audit Output Format

When auditing, output a checklist with:
- ✅ pass / ❌ fail / ⚠️ warn per item
- For each ❌: file:line + what to change
- Summary: X passed, Y failed, Z warnings

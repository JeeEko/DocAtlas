# DocAtlas drift

Check whether documentation matches the project.

## Procedure

Run in the **workspace root**:

```bash
docatlas drift
```

Use `docatlas drift --strict` if the user wants a failing exit on issues.

Report issues plainly. If problems exist, suggest `/docatlas-refine` or small manual fixes — do not rewrite all docs unless asked.

## Expected outcome

- User knows if docs are complete
- List of any missing files or placeholders

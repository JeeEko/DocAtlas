# DocAtlas scheduled maintenance

1. `docatlas update && docatlas drift && docatlas doctor --score`
2. Fix UNKNOWN/TODO/drift issues using refine/update skills where code evidence exists.
3. `docatlas drift --strict`; open PR only if substantive doc changes were made.

Do not refactor application code.

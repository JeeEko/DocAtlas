# Publishing DocAtlas

## npm (recommended for v4+)

```bash
npm login
npm publish --access public
```

Package name: `docatlas` (or `docatlas-cli` if `docatlas` is taken).

Users install:

```bash
npm install -g docatlas
docatlas init
```

## GitHub install (always works)

```bash
npm install -g github:JeeEko/DocAtlas
```

Re-install to update — `npm update` does not work for GitHub URLs.

## Release checklist

1. Update [VERSION](../VERSION), [package.json](../package.json), [CHANGELOG.md](../CHANGELOG.md)
2. Run tests: `node scripts/test-parsers.mjs`, `node scripts/test-business-contexts.mjs`, `node scripts/test-freshness.mjs`
3. Tag: `git tag vX.Y.Z && git push origin vX.Y.Z`
4. Publish npm if configured
5. Verify: `npx docatlas@latest version`

## Explorer

Build separately:

```bash
cd packages/explorer
npm install
npm run package
```

Ship `.vsix` as release asset or install via `docatlas install-explorer`.

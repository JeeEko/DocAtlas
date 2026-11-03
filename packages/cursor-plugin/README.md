# DocAtlas Cursor Platform plugin

Build from repository root on `cursor/cursor-native-95c0`:

```bash
node scripts/build-cursor-plugin.mjs
```

Local test:

```bash
mkdir -p ~/.cursor/plugins/local/docatlas
cp -a packages/cursor-plugin/. ~/.cursor/plugins/local/docatlas/
```

Reload Cursor. Marketplace metadata: `.cursor-plugin/marketplace.json`. Full maintainer steps: [docs/CURSOR_NATIVE.md](../../docs/CURSOR_NATIVE.md).

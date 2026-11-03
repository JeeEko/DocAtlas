function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Minimal GFM-ish markdown → HTML for doc-atlas content (headings, lists, code, links, paragraphs).
 */
export function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  let inCode = false;
  let codeLang = '';
  let codeBuf = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      out.push('</ol>');
      inOl = false;
    }
  };

  const inline = (text) => {
    let s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return s;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!inCode) {
        closeLists();
        inCode = true;
        codeLang = line.slice(3).trim();
        codeBuf = [];
      } else {
        const body = codeBuf.join('\n');
        if (codeLang === 'mermaid') {
          out.push(`<pre class="mermaid">${escapeHtml(body)}</pre>`);
        } else {
          out.push(`<pre><code>${escapeHtml(body)}</code></pre>`);
        }
        inCode = false;
        codeLang = '';
      }
      i++;
      continue;
    }

    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }

    const hm = line.match(/^(#{1,6})\s+(.+)$/);
    if (hm) {
      closeLists();
      const level = hm[1].length;
      out.push(`<h${level}>${inline(hm[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (!inUl) {
        closeLists();
        out.push('<ul>');
        inUl = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`);
      i++;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) {
        closeLists();
        out.push('<ol>');
        inOl = true;
      }
      out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`);
      i++;
      continue;
    }

    if (line.trim() === '') {
      closeLists();
      i++;
      continue;
    }

    closeLists();
    out.push(`<p>${inline(line)}</p>`);
    i++;
  }

  closeLists();
  if (inCode && codeBuf.length) {
    out.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
  }

  return out.join('\n');
}

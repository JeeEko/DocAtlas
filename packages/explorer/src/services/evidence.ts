const EVIDENCE_RE = /[`']?([\w./-]+\.(?:ts|tsx|js|jsx|py|go|rs|yaml|yml|json|md))(?:#L(\d+)(?:-L(\d+))?)?[`']?/g;

export interface EvidenceLink {
  file: string;
  startLine: number;
  endLine: number;
  raw: string;
}

export function parseEvidenceLinks(text: string): EvidenceLink[] {
  const links: EvidenceLink[] = [];
  let m: RegExpExecArray | null;
  EVIDENCE_RE.lastIndex = 0;
  while ((m = EVIDENCE_RE.exec(text))) {
    const startLine = m[2] ? Number(m[2]) : 1;
    const endLine = m[3] ? Number(m[3]) : startLine;
    links.push({ file: m[1], startLine, endLine, raw: m[0] });
  }
  return links;
}

export function lineRangeToVSCodePosition(startLine: number, endLine: number) {
  return {
    start: { line: Math.max(0, startLine - 1), character: 0 },
    end: { line: Math.max(0, endLine - 1), character: 0 },
  };
}

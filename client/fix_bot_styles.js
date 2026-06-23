const fs = require('fs');

const filePath = 'c:\\facbook 2\\client\\src\\app\\dashboard\\bot\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The replacements to apply
const replacements = [
  { regex: /"#0f0f1a"/g, replace: '"var(--background)"' },
  { regex: /"#0a0a15"/g, replace: '"var(--surface)"' },
  { regex: /"#1a1a2e"/g, replace: '"var(--surface)"' },
  { regex: /"#0d0d1f"/g, replace: '"var(--surface)"' },
  { regex: /"#1e1e3f"/g, replace: '"var(--border)"' },
  { regex: /"#2d2d5e"/g, replace: '"var(--border)"' },
  { regex: /"#1e293b"/g, replace: '"var(--surface)"' },
  { regex: /"#475569"/g, replace: '"var(--border)"' },
  { regex: /"#fff"/g, replace: '"var(--text-main)"' },
  { regex: /"#ffffff"/g, replace: '"var(--text-main)"' },
  { regex: /"#e2e8f0"/g, replace: '"var(--text-main)"' },
  { regex: /"#94a3b8"/g, replace: '"var(--text-muted)"' },
  { regex: /"#64748b"/g, replace: '"var(--text-muted)"' },
];

replacements.forEach(({ regex, replace }) => {
  content = content.replace(regex, replace);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Styles fixed!');

const fs = require('fs');

function genKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) res += '-';
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

let sql = '';

// 50 keys, 3 months
sql += '-- 50 Keys (3 Months)\n';
for(let i=0; i<50; i++) {
  sql += `INSERT INTO licenses (key, status, expires_at) VALUES ('${genKey()}', 'unused', now() + interval '3 months');\n`;
}

// 20 keys, 1 month
sql += '\n-- 20 Keys (1 Month)\n';
for(let i=0; i<20; i++) {
  sql += `INSERT INTO licenses (key, status, expires_at) VALUES ('${genKey()}', 'unused', now() + interval '1 month');\n`;
}

// 2 keys, 2 years
sql += '\n-- 2 Keys (2 Years)\n';
for(let i=0; i<2; i++) {
  sql += `INSERT INTO licenses (key, status, expires_at) VALUES ('${genKey()}', 'unused', now() + interval '2 years');\n`;
}

fs.writeFileSync('C:/facbook 2/client/generate_keys.sql', sql);
console.log('SQL generated successfully.');

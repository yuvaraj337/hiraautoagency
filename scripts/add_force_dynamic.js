const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (item === 'route.ts') {
      let content = fs.readFileSync(full, 'utf8');
      if (!content.includes('force-dynamic')) {
        content = "export const dynamic = 'force-dynamic';\n" + content;
        fs.writeFileSync(full, content, 'utf8');
        console.log('Added force-dynamic to:', full);
      }
    }
  }
}

walk(path.join(process.cwd(), 'app', 'api'));

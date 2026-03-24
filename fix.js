const fs = require('fs');
let c = fs.readFileSync('src/app/lieux-saints/page.tsx', 'utf8');
c = c.replace(/description=\\{'"Une montagne[^}]+}/g, "description={`\"Une montagne qui nous aime et que nous aimons\" - Lieu de la célèbre bataille d'Uhud.`}");
fs.writeFileSync('src/app/lieux-saints/page.tsx', c);

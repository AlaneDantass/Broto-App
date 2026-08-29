const fs = require('fs');

let content = fs.readFileSync('src/components/SidebarNew.tsx', 'utf8');

// Replacements
content = content.replace(/bg-\[#6B705C\]/g, 'bg-sidebar');
content = content.replace(/text-\[#FFE8D6\]/g, 'text-on-sidebar');
content = content.replace(/bg-\[#FFE8D6\]/g, 'bg-on-sidebar');
content = content.replace(/text-\[#6B705C\]/g, 'text-sidebar');
content = content.replace(/hover:bg-\[#5A5F52\]/g, 'hover:bg-on-sidebar/10');
content = content.replace(/bg-opacity-20/g, 'bg-opacity-20'); // we can leave opacity classes if we use text-on-sidebar

// There is one tricky one: text-[#FFE8D6] text-opacity-60
// and text-[#FFE8D6] hover:text-opacity-100
// Since I already replaced text-[#FFE8D6] with text-on-sidebar,
// text-on-sidebar text-opacity-60 will work perfectly in Tailwind!

fs.writeFileSync('src/components/SidebarNew.tsx', content);
console.log('SidebarNew updated!');

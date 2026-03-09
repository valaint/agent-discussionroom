const fs = require('fs');
let code = fs.readFileSync('src/client/components/ChatArea.tsx', 'utf8');

code = code.replace(
  /import \{ v4 as uuidv4 \} from 'uuid';/,
  "import { v4 as uuidv4 } from 'uuid';\nimport ReactMarkdown from 'react-markdown';\nimport remarkGfm from 'remark-gfm';"
);

code = code.replace(
  /<div className="whitespace-pre-wrap text-sm font-mono">\{msg\.body\}<\/div>/,
  `<div className="text-sm markdown-body prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.body}</ReactMarkdown>
                </div>`
);

fs.writeFileSync('src/client/components/ChatArea.tsx', code);

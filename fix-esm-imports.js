#!/usr/bin/env node
/**
 * Post-build script to add .js extensions to ESM imports
 * Fixes: ERR_MODULE_NOT_FOUND in Node.js ESM strict mode
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, statSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getAllJsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = statSync(filePath);
    
    // Skip node_modules
    if (file === 'node_modules') {
      continue;
    }
    
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

function fixEsmImports(distDir) {
  try {
    // Check if directory exists
    if (!fs.existsSync(distDir)) {
      console.log(`⚠️  dist-electron directory not found at ${distDir}`);
      return;
    }

    const files = getAllJsFiles(distDir);
    let filesModified = 0;

    for (const file of files) {
      let content = fs.readFileSync(file, 'utf-8');
      const originalContent = content;

      // Fix: import ... from '...' (relative imports without .js)
      content = content.replace(
        /from ['"](\.\.[^\s'"]*?)(?<!\.js|\.json)['"];/g,
        "from '$1.js';"
      );

      // Fix: import ... from "..." (double quotes)
      content = content.replace(
        /from "(\.\.[^\s"]*?)(?<!\.js|\.json)";/g,
        'from "$1.js";'
      );

      // Fix: import '...' (bare imports without .js)
      content = content.replace(
        /import ['"](\.\.[^\s'"]*?)(?<!\.js|\.json)['"];/g,
        "import '$1.js';"
      );

      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf-8');
        filesModified++;
        console.log(`✓ Fixed: ${path.relative(process.cwd(), file)}`);
      }
    }

    console.log(`\n✅ ESM import fixes complete: ${filesModified} files modified`);
  } catch (error) {
    console.error('❌ Error fixing ESM imports:', error);
    process.exit(1);
  }
}

// Run the fixer
const distDir = path.join(__dirname, 'dist-electron');
fixEsmImports(distDir);

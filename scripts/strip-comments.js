const fs = require("fs");
const path = require("path");

const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".scss", ".css"]);
const root = path.resolve(__dirname, "..", "app");

let modified = 0;
let touchedFiles = [];

function stripComments(content) {
  // Remove JSX comments like {/* comment */}
  content = content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");
  // Remove block comments /* ... */
  content = content.replace(/\/\*[\s\S]*?\*\//g, "");
  // Remove line comments that are full-line or leading whitespace (but not triple-slash ///)
  content = content.replace(/^\s*\/\/(?!\/)\s*.*$/gm, "");
  // Collapse multiple blank lines to at most two
  content = content.replace(/\n{3,}/g, "\n\n");
  return content;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (exts.has(ext)) {
        try {
          const original = fs.readFileSync(full, "utf8");
          const stripped = stripComments(original);
          if (stripped !== original) {
            fs.writeFileSync(full, stripped, "utf8");
            modified++;
            touchedFiles.push(full);
            console.log("Stripped comments from", full);
          }
        } catch (err) {
          console.error("Error processing", full, err.message);
        }
      }
    }
  }
}

if (!fs.existsSync(root)) {
  console.error("Directory not found:", root);
  process.exit(2);
}

walk(root);
console.log(`Done. Modified ${modified} file(s).`);

if (modified === 0) process.exit(0);
process.exit(0);

// this script is run by the npm postinstall hook to copy the font
// files from the node_modules directory to the public directory

import fs from "fs";
import path from "path";

// Define the source paths
const fontPaths = [
  "node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-latin-300-normal.woff",
  "node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-latin-500-normal.woff",
  "node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-latin-700-normal.woff",
  "node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-latin-900-normal.woff",
];

// Ensure the destination directory exists
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname, { recursive: true });
};

// Copy each font file
fontPaths.forEach((src) => {
  const fileName = path.basename(src);
  const dest = path.join("public", "fonts", fileName);
  ensureDirectoryExistence(dest);
  const exists = fs.existsSync(dest);
  if (!exists) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} to ${dest}`);
  }
});

import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const nextDir = path.join(__dirname, ".next");
const zipFile = path.join(__dirname, ".next.zip");
const publicDir = path.join(__dirname, "public");
const publicZipFile = path.join(publicDir, ".next.zip");

// File extensions to include in the archive
const allowedExtensions = new Set([".js", ".ts", ".json", ".html"]);

// Function to zip directory asynchronously
async function zipDirectory(source, out) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const output = fs.createWriteStream(out);

  // Handle stream events
  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);

    async function addFilesRecursively(dir) {
      const entries = await fsp.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(source, fullPath);

        if (entry.isDirectory()) {
          // Add directory recursively
          await addFilesRecursively(fullPath);
        } else if (allowedExtensions.has(path.extname(entry.name))) {
          // Add file if extension is allowed
          archive.file(fullPath, { name: relativePath });
        }
      }
    }

    addFilesRecursively(source)
      .then(() => archive.finalize())
      .catch(reject);
  });
}

// Move file asynchronously
async function moveFileAsync(source, target) {
  await fsp.mkdir(path.dirname(target), { recursive: true });
  await fsp.rename(source, target);
}

// Main function
async function main() {
  try {
    console.log("Creating zip archive...");
    await zipDirectory(nextDir, zipFile);
    console.log(`Zip archive created at: ${zipFile}`);

    console.log("Moving zip archive to public directory...");
    await moveFileAsync(zipFile, publicZipFile);
    console.log(`Zip archive moved to: ${publicZipFile}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Execute the main function
main();
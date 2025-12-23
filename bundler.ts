import * as fs from "fs";
import * as path from "path";

// --- Interfaces ---

interface BundlerConfig {
  outputFile: string;
  ignoreDirs: Set<string>;
  ignoreExtensions: Set<string>;
}

// --- Classes ---

/**
 * Class: FileFilter
 * Responsibility: Determines which files and directories should be processed.
 * Principle: Single Responsibility Principle (SRP)
 */
class FileFilter {
  private ignoreDirs: Set<string>;
  private ignoreExtensions: Set<string>;
  private scriptName: string;
  private outputFileName: string;

  constructor(config: BundlerConfig) {
    this.ignoreDirs = config.ignoreDirs;
    this.ignoreExtensions = config.ignoreExtensions;
    this.outputFileName = config.outputFile;
    this.scriptName = path.basename(__filename);
  }

  public shouldSkipDirectory(dirName: string): boolean {
    return this.ignoreDirs.has(dirName);
  }

  public shouldSkipFile(fileName: string): boolean {
    // 1. Skip the bundler script itself and the output file
    if (fileName === this.scriptName || fileName === this.outputFileName) {
      return true;
    }

    // 2. Skip non-text files based on extension
    const ext = path.extname(fileName).toLowerCase();
    return this.ignoreExtensions.has(ext);
  }
}

/**
 * Class: ProjectBundler
 * Responsibility: Traverses the file system and bundles content.
 * Principle: Encapsulation (hides the specific IO logic)
 */
class ProjectBundler {
  private filter: FileFilter;
  private outputFile: string;
  private rootDir: string;

  constructor(config: BundlerConfig) {
    this.filter = new FileFilter(config);
    this.outputFile = path.resolve(config.outputFile);
    this.rootDir = process.cwd();
  }

  /**
   * Public entry point to start the bundling process.
   */
  public bundle(): void {
    console.log(`Starting bundle generation...`);
    console.log(`Root: ${this.rootDir}`);

    try {
      // Initialize/Clear output file
      const fd = fs.openSync(this.outputFile, "w");

      this.processDirectory(this.rootDir, fd);

      fs.closeSync(fd);
      console.log(`\n✅ Successfully generated: ${this.outputFile}`);
    } catch (error) {
      console.error(`❌ Error generating bundle:`, error);
    }
  }

  /**
   * Recursively walks through the directory tree.
   */
  private processDirectory(currentPath: string, fd: number): void {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const itemPath = path.join(currentPath, item);

      // Guard clause: skip if path doesn't exist
      if (!fs.existsSync(itemPath)) continue;

      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        if (!this.filter.shouldSkipDirectory(item)) {
          this.processDirectory(itemPath, fd);
        }
      } else {
        if (!this.filter.shouldSkipFile(item)) {
          this.appendFileContent(itemPath, fd);
        }
      }
    }
  }

  /**
   * Reads a file and writes it to the output buffer.
   */
  private appendFileContent(filePath: string, fd: number): void {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const absolutePath = path.resolve(filePath);

      // Formatting logic encapsulated here
      fs.writeSync(fd, `file path: ${absolutePath}\n`);
      fs.writeSync(fd, content);
      fs.writeSync(fd, "\n\n");

      console.log(`Added: ${path.relative(this.rootDir, filePath)}`);
    } catch (error) {
      console.warn(`Skipping ${path.basename(filePath)} (Read Error)`);
    }
  }
}

// --- Configuration & Execution ---

// 1. Define Configuration
const nextJsConfig: BundlerConfig = {
  outputFile: "project-code.txt",
  ignoreDirs: new Set([
    ".git",
    "node_modules",
    ".next",
    "out",
    "dist",
    "build",
    ".vscode",
    ".idea",
    "coverage",
    ".DS_Store",
  ]),
  ignoreExtensions: new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".webp",
    ".mp4",
    ".webm",
    ".mp3",
    ".wav",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".db",
    ".sqlite",
    ".log",
    ".zip",
    ".tar.gz",
    ".pyc",
    ".exe",
    ".pdf",
    ".docx",
  ]),
};

// 2. Instantiate and Run
const bundler = new ProjectBundler(nextJsConfig);
bundler.bundle();

// cmd to run: npx tsx bundler.ts

// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

import { extname } from "path"

const extensions = [".js"]

/**
 * This plugin raises a warning if a js file has been modified without it&#39;s JSDoc being updated.
 */
export async function jsdoc() {
  // Replace this with the code from your Dangerfile
  const files = [...danger.git.modified_files, ...danger.git.created_files]
  const jsFiles = files.filter(file => extensions.includes(extname(file)))
  const areFilesSafe = await Promise.all(jsFiles.map(checkFile))
  const dangerousFiles = jsFiles.filter((_, index) => !areFilesSafe[index])
  if (dangerousFiles.length > 0) {
    warn("😶 Some js files have been changed without updating the JSDoc")
    markdown(generateMarkdown(dangerousFiles))
  }
}

async function checkFile(file: string): Promise<boolean> {
  const diff = await danger.git.diffForFile(file)
  if (!diff) {
    return true
  }

  const beforeJsdoc = extractJsdoc(diff.before)
  const afterJsdoc = extractJsdoc(diff.after)

  if (afterJsdoc.length === 0) {
    return false
  }

  return JSON.stringify(beforeJsdoc) !== JSON.stringify(afterJsdoc)
}

function extractJsdoc(content: string): string[] {
  const matches = content.match(/\/\*\*\s*\n([^\*]|(\*(?!\/)))*\*\//g)
  return matches ?? []
}

function generateMarkdown(files: string[]): string {
  return `Files that have been changed without updating its JSDoc\n\n${files.map(file => `- ${file}`).join("\n")}`
}

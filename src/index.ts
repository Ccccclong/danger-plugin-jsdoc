// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

import * as minimatch from "minimatch"

interface Options {
  includes: string[] // Glob patterns to match files to be checked
  excludes: string[] // Glob patterns to match files that should not be checked even if it is in `includes`
}

const defaultOptions: Options = {
  includes: ["**/*.js"],
  excludes: [],
}

/**
 * This plugin raises a warning if a js file has been modified without it&#39;s JSDoc being updated.
 * @param options Configuration options
 */
export async function jsdoc(options?: Partial<Options>) {
  const { includes, excludes } = { ...defaultOptions, ...options }

  const files = [...danger.git.modified_files, ...danger.git.created_files]
  const applicableFiles = files.filter(
    file => includes.some(include => minimatch(file, include)) && !excludes.some(exclude => minimatch(file, exclude))
  )
  const areFilesSafe = await Promise.all(applicableFiles.map(checkFile))
  const dangerousFiles = applicableFiles.filter((_, index) => !areFilesSafe[index])
  if (dangerousFiles.length > 0) {
    warn("😶 Some js files have been changed without updating the JSDoc")
    markdown(generateMarkdown(dangerousFiles))
  }
}

/**
 * Checks if a file has been modified without its being JSDoc being updated
 * @param file Filename
 * @returns If the file has been modified without its being JSDoc being updated
 */
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

/**
 * Extract JSDocs from a file's content
 * @param content Content of the file
 * @returns JSDocs of the file
 */
function extractJsdoc(content: string): string[] {
  const matches = content.match(/\/\*\*\s*\n([^\*]|(\*(?!\/)))*\*\//g)
  return matches ?? []
}

/**
 * Generate a markdown list listing files that have been modified without the JSDoc being updated
 * @param files Filenames
 * @returns Markdown list
 */
function generateMarkdown(files: string[]): string {
  return `Files that have been changed without updating its JSDoc\n\n${files.map(file => `- ${file}`).join("\n")}`
}

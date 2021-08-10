// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

interface Options {
  includes: string[]
  excludes: string[]
}
const defaultOptions: Options = {
  includes: ["*.js"],
  excludes: [],
}

/**
 * This plugin raises a warning if a js file has been modified without it&#39;s JSDoc being updated.
 */
export async function jsdoc(options?: Partial<Options>) {
  const { includes, excludes } = { ...defaultOptions, ...options }

  const includeRegExps = includes.map(globToRegExp)
  const excludeRegExps = excludes.map(globToRegExp)

  const files = [...danger.git.modified_files, ...danger.git.created_files]
  const applicableFiles = files.filter(
    file => includeRegExps.some(regExp => regExp.test(file)) && !excludeRegExps.some(regExp => regExp.test(file))
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

/**
 * Creates a RegExp from the given string, converting asterisks to .* expressions,
 * and escaping all other characters.
 */
function globToRegExp(glob: string): RegExp {
  return new RegExp(
    "^" +
      glob
        .split(/\*+/)
        .map(regExpEscape)
        .join(".*") +
      "$"
  )
}

/**
 * RegExp-escapes all characters in the given string.
 */
function regExpEscape(str: string): string {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
}

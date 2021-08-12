// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
export declare function message(message: string, file?: string, line?: number): void
export declare function warn(message: string, file?: string, line?: number): void
export declare function fail(message: string, file?: string, line?: number): void
export declare function markdown(message: string, file?: string, line?: number): void

import * as minimatch from "minimatch"

interface Options {
  includes: string[] // Glob patterns to match files to be checked
  excludes: string[] // Glob patterns to match files that should not be checked even if it is in `includes`
  warningMessage: string // Warning message that will appear in the PR comment
}

const defaultOptions: Options = {
  includes: ["**/*.js"],
  excludes: [],
  warningMessage: "This js file have been changed without updating it's JSDoc, please update its JSDoc if necessary",
}

/**
 * This plugin raises a warning if a js file has been modified without it&#39;s JSDoc being updated.
 * @param options Configuration options
 */
export async function jsdoc(options?: Partial<Options>) {
  const { includes, excludes, warningMessage } = { ...defaultOptions, ...options }

  const files = [...danger.git.modified_files, ...danger.git.created_files]
  const applicableFiles = files.filter(
    file => includes.some(include => minimatch(file, include)) && !excludes.some(exclude => minimatch(file, exclude))
  )
  const areFilesSafe = await Promise.all(applicableFiles.map(checkFile))
  const dangerousFiles = applicableFiles.filter((_, index) => !areFilesSafe[index])
  for (const dangerousFile of dangerousFiles) {
    warn(warningMessage, dangerousFile, await getFileNumLines(dangerousFile))
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
 * Count the number of lines a file contains
 * @param file Filename
 * @returns Number of lines the file contains
 */
async function getFileNumLines(file: string): Promise<number> {
  const diff = await danger.git.diffForFile(file)
  return diff ? diff.after.split("\n").length - 1 : 1
}

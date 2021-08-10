import { jsdoc, markdown, warn } from "./index"

declare const global: any

describe("jsdoc()", () => {
  let modifiedFile
  let createdFile
  let mockModifiedFileDiff
  let mockCreatedFileDiff
  let expectedWarning
  let expectedMarkdown

  let gitDiffForFileMock: jest.Mock<any>

  const expectGitDiffForFile = () => {
    expect(gitDiffForFileMock).toHaveBeenCalledTimes(2)
    expect(gitDiffForFileMock).toHaveBeenCalledWith(modifiedFile)
    expect(gitDiffForFileMock).toHaveBeenCalledWith(createdFile)
  }

  const expectWarn = () => {
    expect(global.warn).toHaveBeenCalledTimes(1)
    expect(global.warn).toHaveBeenCalledWith(expectedWarning)
  }

  const expectMarkdown = () => {
    expect(global.markdown).toHaveBeenCalledTimes(1)
    expect(global.markdown).toHaveBeenCalledWith(expectedMarkdown)
  }

  beforeEach(() => {
    modifiedFile = "modified.js"
    createdFile = "created.js"
    mockModifiedFileDiff = {
      before: `
/**
 * This is the foo functoion
 */
function foo() {
  console.log('hello')
}`,
      after: `
/**
 * This is the foo functoion
 */
function greet() {
  console.log('hello')
}`,
    }
    mockCreatedFileDiff = {
      before: "",
      after: `
function greet() {
  console.log('hello')
}`,
    }
    expectedWarning = "😶 Some js files have been changed without updating the JSDoc"
    expectedMarkdown = `Files that have been changed without updating its JSDoc

- ${modifiedFile}
- ${createdFile}`

    gitDiffForFileMock = jest.fn().mockImplementation(file => {
      switch (file) {
        case modifiedFile:
          return mockModifiedFileDiff
        case createdFile:
          return mockCreatedFileDiff
      }
    })

    global.warn = jest.fn()
    global.message = jest.fn()
    global.fail = jest.fn()
    global.markdown = jest.fn()
    global.danger = {
      git: {
        modified_files: [modifiedFile],
        created_files: [createdFile],
        diffForFile: gitDiffForFileMock,
      },
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("warns when there are js files modified without updating JSDoc", async () => {
    await jsdoc()

    expectGitDiffForFile()
    expectWarn()
    expectMarkdown()
  })

  it("does not warn when there are no js files modified without updating JSDoc", async () => {
    mockModifiedFileDiff.before = `
/**
 * This is the foo functoion
 */
function foo() {
  console.log('hello')
}`
    mockModifiedFileDiff.after = `
/**
 * This is the greet functoion
 */
function greet() {
  console.log('hello')
}`
    mockCreatedFileDiff.before = ""
    mockCreatedFileDiff.after = `
/**
 * This is the greet function
 */
function greet() {
  console.log('hello')
}`

    await jsdoc()

    expectGitDiffForFile()
    expect(global.warn).not.toBeCalled()
    expect(global.markdown).not.toBeCalled()
  })
})

# danger-plugin-jsdoc

[![Build Status](https://travis-ci.org/Ccccclong/danger-plugin-jsdoc.svg?branch=master)](https://travis-ci.org/Ccccclong/danger-plugin-jsdoc)
[![npm version](https://badge.fury.io/js/danger-plugin-jsdoc.svg)](https://badge.fury.io/js/danger-plugin-jsdoc)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> This plugin raises a warning if a js file has been modified without it&#39;s JSDoc being updated.

## Usage

Install:

```sh
yarn add danger-plugin-jsdoc --dev
```

At a glance:

```js
// dangerfile.js
import jsdoc from "danger-plugin-jsdoc"

jsdoc({ includes: ["**/*.js"], excludes: "**/*.spec.js" })
```

Confiuguration:

| Option   | Type     | Deafult       | Desciption                                                                         |
| -------- | -------- | ------------- | ---------------------------------------------------------------------------------- |
| includes | string[] | `["**/*.js"]` | Glob pattern to match files to be checked                                          |
| excludes | string[] | `[]`          | Glob pattern to match files that should not be checked even if it is in `includes` |

## Changelog

See the GitHub [release history](https://github.com/Ccccclong/danger-plugin-jsdoc/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

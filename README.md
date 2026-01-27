# CozyUtils

CozyUtils is a utility package designed to streamline the tedious and repetitive tasks I find myself doing on almost every project.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Bun (Version 1.0.29 or later. Visit [Bun.sh](https://bun.sh/) for installation instructions)

## Installation

1. Clone the repo
1. Run `bun install`
1. Run `bun run build`
1. Copy `bin/cozyutils` into your PATH (or run `bun run build:install -- --shell=zsh`)

## Usage

### Command Line Interface

CozyUtils provides a command-line interface with the following commands:

- `-svg2tsx <directory> [--ext=.svg] [--dry-run] [--force] [--no-move]`: Convert SVG files in a directory to React components.
- `-img2export <directory> <output_file> [--ext=.svg,.png] [--dry-run]`: Export image files in a directory as named exports.

#### Example

```bash
./cozyutils -svg2tsx ./icons --dry-run
```


## Scripts

CozyUtils provides some convenient npm scripts:

- `dev`: Run the package in development mode.
- `build`: Build the package for production.
- `build:install`: Build and append PATH entry for zsh/bash/fish (`--shell=zsh|bash|fish`).
- `build:js`: Build the package with a specific target.

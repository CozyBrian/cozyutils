Here's a template for your GitHub README.md file:

---

# CozyUtils

CozyUtils is a utility package designed to streamline the tedious and repetitive tasks I find myself doing on almost every project.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Bun (Version 1.0.29 or later. Visit [Bun.sh](https://bun.sh/) for installation instructions)

## Installation

1. Clone the repo
1. Run "bun install"
1. Run "bun run build"
1. Copy the contents of the bin directory to (honestly idk, I've just exported mine to path)

## Usage

### Command Line Interface

CozyUtils provides a command-line interface with the following commands:

- `-svgtotsx <directory>`: Convert SVG files in a directory to React components.
- `-svgtoexport <directory> <output_file>`: Export SVG files in a directory as named exports.

#### Example

```bash
./cozyutils -svgtotsx ./icons
```


## Scripts

CozyUtils provides some convenient npm scripts:

- `dev`: Run the package in development mode.
- `build`: Build the package for production.
- `build:js`: Build the package with a specific target.

# Contributing to OdyFeed

Thank you for your interest in contributing to OdyFeed! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your contribution
4. Make your changes
5. Push to your fork and submit a pull request

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- A Solid Pod for testing (optional but recommended)

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/OdyFeed.git
cd OdyFeed

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Environment Variables

Create a `.env` file in the root directory with necessary configuration. Refer to `.env.example` if available.

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix issues reported in GitHub Issues
- **Features**: Implement new features or enhance existing ones
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Refactoring**: Improve code quality and maintainability

### Before You Start

1. Check existing issues and pull requests to avoid duplicate work
2. For major changes, open an issue first to discuss your proposal
3. Make sure you understand the project architecture and conventions

## Coding Standards

This project follows specific coding conventions. Please review the [global-copilot-instructions](global-copilot-instructions) for detailed guidelines.

### Key Principles

- **Vue 3 Composition API**: Use `<script setup>` syntax with TypeScript
- **Function declarations**: Use function expressions (`const fn = function () {}`)
- **Modern CSS**: Use native CSS nesting, CSS variables, and logical properties
- **TypeScript**: Always define types for parameters and return values
- **No unnecessary comments**: Write self-documenting code

### File Organization

```
app/
├── components/     # Reusable Vue components
│   ├── atoms/     # Basic building blocks
│   ├── molecules/ # Simple component combinations
│   └── organisms/ # Complex components
├── composables/   # Reusable composition functions
├── queries/       # Pinia Colada query definitions
├── mutations/     # Pinia Colada mutation definitions
├── stores/        # Pinia stores
├── utils/         # Pure utility functions
└── types/         # TypeScript type definitions

server/
├── api/           # API endpoints
├── utils/         # Server utility functions
└── middleware/    # Server middleware
```

### Code Style

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for strings
- **Semicolons**: Not required but be consistent
- **Line length**: Aim for 100-120 characters max
- **Imports**: Group by external packages, internal modules, types, assets

### Example Component Structure

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

// Props
const props = defineProps<{
  title: string
  disabled?: boolean
}>()

// Models
const modelValue = defineModel<string>()

// Emits
const emit = defineEmits<{
  submit: []
}>()

// Composables & state
const isLoading = ref(false)

// Computed
const isValid = computed(() => modelValue.value?.length > 0)

// Functions
const handleSubmit = function () {
  if (isValid.value) {
    emit('submit')
  }
}
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
    <button @click="handleSubmit" :disabled="disabled">
      Submit
    </button>
  </div>
</template>

<style scoped>
.component {
  padding: var(--spacing-md);
  
  & h2 {
    margin-block-end: var(--spacing-sm);
  }
}
</style>
```

## Commit Guidelines

We follow conventional commits for clear and structured commit history.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```
feat(auth): add OIDC authentication support

Implement OpenID Connect authentication flow with Solid Pod integration

Closes #123
```

```
fix(inbox): resolve signature verification issue

HTTP signature verification was failing for certain ActivityPub servers
due to incorrect header parsing

Fixes #456
```

## Pull Request Process

1. **Update your branch**: Ensure your branch is up to date with the main branch
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test your changes**: Run tests and ensure everything works
   ```bash
   pnpm test
   pnpm lint
   ```

3. **Create a pull request**: Use the pull request template (see `.github/PULL_REQUEST_TEMPLATE.md`)

4. **Fill in the template**: Provide a clear description of your changes

5. **Link related issues**: Reference any related issues using keywords like "Closes #123"

6. **Wait for review**: Maintainers will review your PR and may request changes

7. **Address feedback**: Make requested changes and push updates

8. **Merge**: Once approved, a maintainer will merge your PR

### Pull Request Checklist

- [ ] Code follows project conventions and style guidelines
- [ ] Tests pass locally
- [ ] No linting errors
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow conventional commits
- [ ] PR description clearly explains the changes
- [ ] Related issues are linked

## Reporting Bugs

When reporting bugs, please include:

1. **Clear title**: Summarize the issue in one line
2. **Description**: Detailed description of the bug
3. **Steps to reproduce**: Step-by-step instructions to reproduce the issue
4. **Expected behavior**: What you expected to happen
5. **Actual behavior**: What actually happened
6. **Environment**: Browser, OS, Node.js version, etc.
7. **Screenshots**: If applicable
8. **Logs**: Any relevant error messages or logs

### Bug Report Template

```markdown
## Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node.js: [e.g. v20.10.0]
- OdyFeed version: [e.g. 1.0.0]

## Additional Context
Any other context, screenshots, or logs.
```

## Suggesting Features

We welcome feature suggestions! When suggesting a feature:

1. **Check existing issues**: Ensure the feature hasn't been suggested
2. **Describe the problem**: Explain the use case or problem it solves
3. **Propose a solution**: Describe your proposed implementation
4. **Consider alternatives**: List alternative solutions you've considered
5. **Additional context**: Mockups, examples, or references

### Feature Request Template

```markdown
## Problem Statement
Describe the problem or use case that this feature would address.

## Proposed Solution
Describe your proposed implementation.

## Alternatives Considered
List alternative solutions you've considered.

## Additional Context
Mockups, examples, or references to similar features.
```

## Questions?

If you have questions about contributing, feel free to:

- Open a discussion on GitHub
- Check existing documentation
- Review closed issues and pull requests

## License

By contributing to OdyFeed, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](LICENSE)).

---

Thank you for contributing to OdyFeed! Your efforts help make this project better for everyone.

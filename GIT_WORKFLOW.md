# Git Workflow Guide for Inventiq

## Table of Contents
- [Branch Strategy](#branch-strategy)
- [Commit Conventions](#commit-conventions)
- [Development Workflow](#development-workflow)
- [Pre-commit Hooks](#pre-commit-hooks)
- [Git Aliases](#git-aliases)
- [Release Process](#release-process)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Branch Strategy

### Branch Types

**main** - Production-ready code
- Protected branch
- Direct commits not allowed
- All changes come through Pull Requests
- Automatically deployed to production
- Always stable and releasable

**develop** - Integration branch for features
- Default branch for development
- Where feature branches merge
- Regularly tested and integrated
- Source for release branches

**feature/** - New features or enhancements
- Branch from: develop
- Merge back to: develop
- Naming: `feature/description-of-feature`
- Examples: `feature/camera-photo-capture`, `feature/ai-analysis-enhancement`

**bugfix/** - Bug fixes for develop branch
- Branch from: develop
- Merge back to: develop
- Naming: `bugfix/description-of-fix`
- Examples: `bugfix/camera-permission-error`, `bugfix/api-timeout-handling`

**hotfix/** - Critical fixes for production
- Branch from: main
- Merge back to: main AND develop
- Naming: `hotfix/critical-issue-description`
- Examples: `hotfix/security-vulnerability`, `hotfix/data-loss-prevention`

**release/** - Prepare new release versions
- Branch from: develop
- Merge back to: main AND develop
- Naming: `release/v1.2.0`
- Used for final testing and version bumping

### Visual Flow
```
main     ──●─────────────●────────────●──
            │             │            │
            │         release/v1.1.0   │
            │             │            │
develop  ───●─────●───────●─────●──────●──
             │     │       │     │
feature/ui   │     │       │     │
         ────●─────●       │     │
                           │     │
feature/api               │     │
                   ───────●─────●
```

## Commit Conventions

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Code formatting (no code change)
- **refactor**: Code refactoring (no feature change)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes
- **ci**: Continuous integration changes
- **build**: Build system changes
- **revert**: Reverting a previous commit

### Scopes (Optional)
- **api**: API routes and endpoints
- **ui**: UI components and interfaces
- **store**: State management (Zustand)
- **camera**: Photo capture functionality
- **ai**: AI integration and analysis
- **products**: Product management features
- **auth**: Authentication and authorization
- **db**: Database operations
- **config**: Configuration files
- **test**: Test-related changes

### Examples
```bash
# Good commit messages
feat(camera): add photo capture with quantity selection
fix(api): resolve OpenAI API timeout issue
docs: update setup instructions for new developers
refactor(store): simplify product state management
perf(ui): optimize product gallery rendering
test(camera): add unit tests for photo capture component

# Bad commit messages
fix stuff
updated files
working on feature
quick fix
```

## Development Workflow

### Starting a New Feature
```bash
# 1. Switch to develop branch
git checkout develop

# 2. Pull latest changes
git pull origin develop

# 3. Create feature branch
git checkout -b feature/your-feature-name

# 4. Work on your feature
# ... make changes ...

# 5. Stage and commit changes
git add .
git commit -m "feat(scope): description of changes"

# 6. Push feature branch
git push -u origin feature/your-feature-name

# 7. Create Pull Request to develop branch
```

### Daily Development
```bash
# Check current status
git status

# View recent commits
git lg

# Quick commit with message
git add .
git commit -m "feat(ui): add photo preview component"

# Push current branch
git push

# Switch branches quickly
git co develop
git co feature/my-feature

# View differences
git diff
git diff --staged
```

### Merging Changes
```bash
# Before merging, update your branch
git checkout feature/your-feature
git pull origin develop  # Get latest develop changes
git push  # Push updated feature branch

# After PR approval, clean up
git checkout develop
git pull origin develop
git branch -d feature/your-feature  # Delete local branch
git push origin --delete feature/your-feature  # Delete remote branch
```

## Pre-commit Hooks

### What They Check
1. **Branch Protection**: Prevents direct commits to main
2. **TypeScript**: Runs type checking
3. **Linting**: Runs ESLint
4. **Tests**: Runs Jest test suite
5. **Sensitive Files**: Checks for .env, keys, etc.
6. **File Size**: Prevents commits of files >5MB

### Bypassing Hooks (Emergency Only)
```bash
# Skip pre-commit hooks (use sparingly)
git commit --no-verify -m "emergency fix"
```

### Manual Hook Testing
```bash
# Test pre-commit hook manually
./.githooks/pre-commit
```

## Git Aliases

### Available Aliases
```bash
# Basic operations
git st          # git status
git co          # git checkout
git br          # git branch
git ci          # git commit

# Advanced operations
git lg          # Pretty log with graph
git last        # Show last commit
git unstage     # Unstage files
git amend       # Amend last commit without editing message
git undo        # Soft reset last commit
git wip         # Quick "work in progress" commit
git pushf       # Force push with lease (safer)
git cleanup     # Delete merged branches

# Examples
git co -b feature/new-feature
git st
git add .
git ci -m "feat: add new feature"
git pushf
git lg --oneline -10
```

### Custom Aliases Setup
```bash
# View all aliases
git config --get-regexp alias

# Add new alias
git config --global alias.nickname 'actual-command'

# Example: Add alias for interactive rebase
git config --global alias.rb 'rebase -i'
```

## Release Process

### Creating a Release
```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Update version numbers
# - Update package.json version
# - Update CHANGELOG.md
# - Update documentation

# 3. Commit version changes
git add .
git commit -m "chore(release): bump version to 1.2.0"

# 4. Test thoroughly
npm run test
npm run build
npm run typecheck

# 5. Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"

# 6. Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0

# 7. Push everything
git push origin main
git push origin develop
git push origin v1.2.0

# 8. Clean up
git branch -d release/v1.2.0
```

### Hotfix Process
```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Make the fix
# ... fix the issue ...

# 3. Commit fix
git add .
git commit -m "fix(security): resolve critical vulnerability"

# 4. Test the fix
npm run test

# 5. Merge to main
git checkout main
git merge --no-ff hotfix/critical-security-fix
git tag -a v1.2.1 -m "Hotfix version 1.2.1"

# 6. Merge to develop
git checkout develop
git merge --no-ff hotfix/critical-security-fix

# 7. Push and clean up
git push origin main
git push origin develop
git push origin v1.2.1
git branch -d hotfix/critical-security-fix
```

## Best Practices

### Commit Best Practices
- **Make atomic commits**: One logical change per commit
- **Write descriptive messages**: Explain what and why, not how
- **Commit frequently**: Small, incremental changes
- **Test before committing**: Ensure code works and tests pass
- **Use conventional commits**: Follow the established format

### Branch Best Practices
- **Keep branches short-lived**: Merge frequently to avoid conflicts
- **Use descriptive names**: `feature/camera-photo-capture` not `feature/stuff`
- **Delete merged branches**: Keep repository clean
- **Rebase feature branches**: Keep history linear when possible
- **Don't force push shared branches**: Use `--force-with-lease` if needed

### Collaboration Best Practices
- **Pull before push**: Always get latest changes first
- **Review before merge**: Use Pull Requests for code review
- **Communicate changes**: Use descriptive commit messages and PR descriptions
- **Resolve conflicts promptly**: Don't let merge conflicts accumulate
- **Update documentation**: Keep docs in sync with code changes

## Troubleshooting

### Common Issues

#### Merge Conflicts
```bash
# When merge conflicts occur
git status  # See conflicted files
# Edit files to resolve conflicts
git add .
git commit -m "resolve merge conflicts"
```

#### Accidental Commits to Main
```bash
# If you accidentally committed to main
git checkout main
git reset --soft HEAD~1  # Undo last commit, keep changes
git stash  # Save changes
git checkout -b feature/my-changes  # Create proper branch
git stash pop  # Restore changes
git add .
git commit -m "feat: move changes to proper branch"
```

#### Large File Committed
```bash
# Remove large file from history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/large/file' \
  --prune-empty --tag-name-filter cat -- --all
```

#### Reset to Remote State
```bash
# Discard all local changes and match remote
git fetch origin
git reset --hard origin/develop
```

#### Recover Deleted Branch
```bash
# Find deleted branch commit
git reflog
# Recreate branch from commit hash
git checkout -b recovered-branch <commit-hash>
```

### Getting Help
```bash
# Git help for any command
git help <command>
git help commit
git help merge

# Quick command reference
git <command> --help
```

### Repository Health Check
```bash
# Check repository status
git status
git log --oneline -10
git branch -a

# Verify remote connections
git remote -v

# Check for issues
git fsck
```

## GitHub Integration

### Repository Setup

#### Initial Repository Creation on GitHub
1. Go to https://github.com/Zalimba79
2. Click "New repository"
3. Repository name: `inventiq`
4. Description: "AI-Powered Inventory Management System"
5. Keep **Public** or **Private** (your choice)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click "Create repository"

#### Configure Remote and Push
```bash
# Add GitHub remote
git remote add origin https://github.com/Zalimba79/inventiq.git

# Verify remote configuration
git remote -v

# Push main branch with upstream tracking
git checkout main
git push -u origin main

# Push develop branch with upstream tracking
git checkout develop
git push -u origin develop

# Push all tags
git push origin --tags
```

### GitHub Workflow

#### Setting Up Branch Protection
1. Go to repository Settings → Branches
2. Add rule for `main` branch:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Restrict pushes that create files

3. Add rule for `develop` branch:
   - Require pull request reviews before merging
   - Require status checks to pass before merging

#### Pull Request Process
```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat(scope): implement new feature"

# 3. Push feature branch
git push -u origin feature/new-feature

# 4. Create Pull Request on GitHub
# - Base: develop
# - Compare: feature/new-feature
# - Add description and reviewers

# 5. After PR approval and merge
git checkout develop
git pull origin develop
git branch -d feature/new-feature
```

#### Release Workflow on GitHub
```bash
# 1. Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. Update version and changelog
# Edit package.json, CHANGELOG.md

# 3. Push release branch
git push -u origin release/v1.0.0

# 4. Create PR: release/v1.0.0 → main
# 5. After merge, create GitHub Release
# 6. Merge changes back to develop
```

### GitHub Actions Integration

#### Automated Workflows
Create `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### Issue and Project Management

#### Issue Templates
Create `.github/ISSUE_TEMPLATE/`:
- Bug reports
- Feature requests
- Documentation improvements

#### Pull Request Template
Create `.github/pull_request_template.md`:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tests pass locally
- [ ] Added new tests if needed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## Environment Setup

### New Developer Setup
```bash
# 1. Clone repository
git clone https://github.com/Zalimba79/inventiq.git
cd inventiq

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Verify setup
npm run typecheck
npm run lint
npm run test

# 5. Start development
git checkout develop
git checkout -b feature/your-first-feature
```

### Team Collaboration
- **Code Reviews**: Always require PR reviews before merging
- **Branch Protection**: Protect main and develop branches
- **CI/CD Integration**: Set up automated testing and deployment
- **Issue Tracking**: Link commits to issues/tickets
- **Documentation**: Keep this workflow guide updated

---

## Quick Reference Card

### Essential Commands
```bash
# Daily workflow
git st                     # Check status
git co develop            # Switch to develop
git co -b feature/name    # Create feature branch
git add .                 # Stage changes
git ci -m "message"       # Commit with message
git push                  # Push current branch
git lg                    # View commit history

# Branch management
git br                    # List branches
git br -d branch-name     # Delete local branch
git push origin --delete branch-name  # Delete remote branch
git cleanup               # Delete merged branches

# Emergency commands
git stash                 # Save work temporarily
git stash pop             # Restore stashed work
git undo                  # Undo last commit (soft)
git commit --no-verify    # Skip pre-commit hooks
```

### Commit Message Template
```
<type>(<scope>): <subject>
│       │         │
│       │         └─⫸ Summary in present tense. Not capitalized. No period at the end.
│       │
│       └─⫸ Commit Scope: api|ui|store|camera|ai|products|auth|db|config|test
│
└─⫸ Commit Type: feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert
```

Remember: This workflow is designed to maintain code quality, enable collaboration, and ensure reliable releases. When in doubt, ask the team or refer to this guide!
#!/usr/bin/env node

/**
 * Automatically updates CLAUDE.md with current project state
 * Run this before committing to keep documentation in sync
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const CLAUDE_MD = path.join(PROJECT_ROOT, 'CLAUDE.md');
const PACKAGE_JSON = path.join(PROJECT_ROOT, 'package.json');

// Get current date
const today = new Date().toISOString().split('T')[0];

// Read package.json for dependencies
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));

// Count files and components
function countFiles(dir, extension) {
  try {
    const output = execSync(
      `find "${dir}" -name "*.${extension}" -type f | wc -l`,
      { cwd: PROJECT_ROOT, encoding: 'utf8' }
    ).trim();
    return parseInt(output, 10);
  } catch {
    return 0;
  }
}

// Get component list
function getComponents(dir) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    return files
      .filter(file => file.isFile() && file.name.endsWith('.tsx') && !file.name.startsWith('index'))
      .map(file => file.name.replace('.tsx', ''))
      .sort();
  } catch {
    return [];
  }
}

// Get ESLint error count
function getEslintErrors() {
  try {
    execSync('npm run lint -- --quiet', { cwd: PROJECT_ROOT, encoding: 'utf8' });
    return 0;
  } catch (error) {
    const output = error.stdout || '';
    const errorMatch = output.match(/(\d+)\s+error/);
    const warningMatch = output.match(/(\d+)\s+warning/);
    return {
      errors: errorMatch ? parseInt(errorMatch[1], 10) : 0,
      warnings: warningMatch ? parseInt(warningMatch[1], 10) : 0
    };
  }
}

// Get git info
function getGitInfo() {
  try {
    const branch = execSync('git branch --show-current', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    const lastCommit = execSync('git log -1 --pretty=format:"%h %s"', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    const uncommittedFiles = execSync('git status --porcelain | wc -l', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    return {
      branch,
      lastCommit,
      uncommittedFiles: parseInt(uncommittedFiles, 10)
    };
  } catch {
    return { branch: 'unknown', lastCommit: 'unknown', uncommittedFiles: 0 };
  }
}

// Collect project stats
const stats = {
  date: today,
  components: {
    home: getComponents(path.join(PROJECT_ROOT, 'src/components/home')),
    camera: getComponents(path.join(PROJECT_ROOT, 'src/components/camera')),
    products: getComponents(path.join(PROJECT_ROOT, 'src/components/products')),
    ui: getComponents(path.join(PROJECT_ROOT, 'src/components/ui'))
  },
  files: {
    typescript: countFiles(path.join(PROJECT_ROOT, 'src'), 'ts') + countFiles(path.join(PROJECT_ROOT, 'src'), 'tsx'),
    components: countFiles(path.join(PROJECT_ROOT, 'src/components'), 'tsx'),
    pages: countFiles(path.join(PROJECT_ROOT, 'src/app'), 'tsx')
  },
  eslint: getEslintErrors(),
  git: getGitInfo(),
  dependencies: {
    main: Object.keys(packageJson.dependencies || {}).length,
    dev: Object.keys(packageJson.devDependencies || {}).length
  }
};

// Read current CLAUDE.md
let claudeContent = fs.readFileSync(CLAUDE_MD, 'utf8');

// Update sections
function updateSection(content, sectionName, newContent) {
  const regex = new RegExp(`(## ${sectionName}[\\s\\S]*?)(?=##|$)`, 'g');
  if (content.match(regex)) {
    return content.replace(regex, `## ${sectionName}\n${newContent}\n\n`);
  }
  return content + `\n## ${sectionName}\n${newContent}\n\n`;
}

// Update Key Components section
const componentsContent = `
### Dashboard Components${stats.components.home.length ? '' : ' (New Architecture)'}
${stats.components.home.map(c => `- \`${c}\`: ${getComponentDescription(c)}`).join('\n')}

### Camera Components
${stats.components.camera.map(c => `- \`${c}\`: ${getComponentDescription(c)}`).join('\n')}

### Product Components
${stats.components.products.map(c => `- \`${c}\`: ${getComponentDescription(c)}`).join('\n')}

### UI Components
${stats.components.ui.slice(0, 10).map(c => `- \`${c}\`: shadcn/ui component`).join('\n')}
${stats.components.ui.length > 10 ? `- ... and ${stats.components.ui.length - 10} more UI components` : ''}
`;

// Helper to get component descriptions (you can enhance this)
function getComponentDescription(componentName) {
  const descriptions = {
    // Dashboard
    'HomePage': 'Main dashboard orchestration component',
    'Header': 'Top navigation with user menu and notifications',
    'StatsCard': 'Dashboard statistics display',
    'RecentCaptures': 'Recent photo thumbnails',
    'QuickActions': 'Quick access buttons',
    'ActivityFeed': 'Recent activity timeline',
    
    // Camera
    'DirectPhotoCaptureRefactored': 'Refactored main capture interface',
    'CameraViewRefactored': 'Updated WebRTC camera integration',
    'PhotoPreview': 'Display captured photos',
    'CameraSettings': 'Unified camera configuration',
    
    // Products
    'ProductGallery': 'Display products with filtering',
    'ProductValidation': 'Review and validate AI results',
    'BulkProductValidation': 'Validate multiple products',
    
    // Default
    'default': 'Component'
  };
  
  return descriptions[componentName] || descriptions.default;
}

// Update Code Quality Status section
const qualityContent = `Status (Last Updated: ${today})
- **ESLint Errors**: ${stats.eslint.errors || 0} errors, ${stats.eslint.warnings || 0} warnings
- **TypeScript Files**: ${stats.files.typescript} files
- **Components**: ${stats.files.components} React components
- **Pages**: ${stats.files.pages} Next.js pages
- **Dependencies**: ${stats.dependencies.main} runtime, ${stats.dependencies.dev} dev
- **Git Branch**: ${stats.git.branch}
- **Uncommitted Changes**: ${stats.git.uncommittedFiles} files
`;

// Update Auto-Generated Stats section
const statsSection = `
<!-- AUTO-GENERATED STATS - DO NOT EDIT MANUALLY -->
<!-- Last Updated: ${today} -->
<!-- Branch: ${stats.git.branch} -->
<!-- ESLint: ${stats.eslint.errors || 0} errors, ${stats.eslint.warnings || 0} warnings -->
<!-- Components: ${stats.files.components} files -->
`;

// Update CLAUDE.md
claudeContent = updateSection(claudeContent, 'Key Components', componentsContent);
claudeContent = updateSection(claudeContent, 'Code Quality', qualityContent);

// Add stats comment at the end if not exists
if (!claudeContent.includes('<!-- AUTO-GENERATED STATS')) {
  claudeContent += '\n' + statsSection;
}

// Write updated CLAUDE.md
fs.writeFileSync(CLAUDE_MD, claudeContent);

// Output summary
console.log('✅ CLAUDE.md updated successfully!');
console.log(`📊 Stats for ${today}:`);
console.log(`   - Components: ${stats.files.components}`);
console.log(`   - ESLint: ${stats.eslint.errors || 0} errors, ${stats.eslint.warnings || 0} warnings`);
console.log(`   - Git: ${stats.git.branch} branch, ${stats.git.uncommittedFiles} uncommitted files`);
console.log('\n💡 Run this script before committing to keep CLAUDE.md in sync');
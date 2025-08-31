const fs = require('fs');
const path = require('path');
const express = require('express');
const markdownIt = require('markdown-it');

const app = express();
const md = new markdownIt();
const PORT = process.env.PORT || 2062;
const PAGES_DIR = path.join(__dirname, 'pages');

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Get all markdown files from pages folder
function getPages() {
  if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR, { recursive: true });
  }
  
  const files = fs.readdirSync(PAGES_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace('.md', ''));
  
  // Ensure index is first in the list
  const pages = files.filter(page => page !== 'index');
  if (files.includes('index')) {
    pages.unshift('index');
  }
  
  return pages;
}

// Generate sidebar HTML
function generateSidebar(pages, currentPage) {
  const sidebarItems = pages.map(page => {
    const displayName = page === 'index' ? 'Home' : 
      page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' ');
    const isActive = page === currentPage ? 'active' : '';
    const href = page === 'index' ? '/' : `/${page}`;
    
    return `<li><a href="${href}" class="${isActive}">${displayName}</a></li>`;
  }).join('\n      ');

  return `<ul>\n      ${sidebarItems}\n    </ul>`;
}

// Render markdown to HTML
function renderMarkdown(pageName) {
  const filePath = path.join(PAGES_DIR, `${pageName}.md`);
  
  if (!fs.existsSync(filePath)) {
    return '<div class="error"><h2>Page Not Found</h2><p>The requested page could not be found.</p></div>';
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return md.render(content);
  } catch (error) {
    return '<div class="error"><h2>Error Loading Page</h2><p>There was an error loading this page.</p></div>';
  }
}

// Generate complete HTML page
function generateHTML(currentPage, content, sidebar) {
  const title = currentPage === 'index' ? 'Documentation' : 
    `${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} - Documentation`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="/static/styles.css">
  <link rel="icon" type="image/x-icon" href="/static/favicon.ico">
</head>
<body class="light">
  <div class="container">
    <nav class="sidebar">
      <div class="sidebar-header">
        <h1><a href="/">Documentation</a></h1>
        <button id="themeToggle" class="theme-toggle" title="Toggle theme">
          <span class="theme-icon">🌙</span>
        </button>
      </div>
      <div class="sidebar-nav">
        ${sidebar}
      </div>
    </nav>
    <main class="content">
      ${content}
    </main>
  </div>
  <script src="/static/theme.js"></script>
</body>
</html>`;
}

// Routes
app.get('/', (req, res) => {
  const pages = getPages();
  const sidebar = generateSidebar(pages, 'index');
  const content = renderMarkdown('index');
  
  res.send(generateHTML('index', content, sidebar));
});

app.get('/:page', (req, res) => {
  const pages = getPages();
  const requestedPage = req.params.page;
  
  if (!pages.includes(requestedPage)) {
    res.status(404).send(generateHTML('404', 
      '<div class="error"><h1>404 - Page Not Found</h1><p>The requested page does not exist.</p></div>',
      generateSidebar(pages, '')
    ));
    return;
  }
  
  const sidebar = generateSidebar(pages, requestedPage);
  const content = renderMarkdown(requestedPage);
  
  res.send(generateHTML(requestedPage, content, sidebar));
});

// Create required directories and files on startup
function setupDirectories() {
  // Create pages directory
  if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR, { recursive: true });
  }
  
  // Create static directory
  const staticDir = path.join(__dirname, 'static');
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir);
  }
  
  // Create default index.md if it doesn't exist
  const indexPath = path.join(PAGES_DIR, 'index.md');
  if (!fs.existsSync(indexPath)) {
    const defaultContent = `# Welcome to Documentation

This is your main documentation page. Edit \`pages/index.md\` to customize this content.

## Getting Started

1. Add new markdown files to the \`pages/\` folder
2. Each \`.md\` file will automatically appear in the sidebar
3. Use the theme toggle button to switch between light and dark modes

## Features

- **Multipage Support**: Add any \`.md\` file to the pages folder
- **Automatic Sidebar**: Files are automatically added to navigation
- **Dark/Light Theme**: Toggle between themes with persistent settings
- **Responsive Design**: Works on desktop and mobile devices

Happy documenting! 📚`;
    
    fs.writeFileSync(indexPath, defaultContent);
  }
}

// Start server
app.listen(PORT, () => {
  setupDirectories();
  console.log(`📚 Documentation server running at http://localhost:${PORT}`);
  console.log(`📝 Add markdown files to the 'pages' folder to create new documentation pages`);
});

module.exports = app;

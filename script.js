/**
 * CloudDeploy Hub - Core Application Logic
 * Clean, modular, beginner-friendly JavaScript
 * Handles interactive learning progress, deployment pipeline inspection,
 * project modals, skill filtering, and dynamic statistics tracking.
 */

// ==========================================
// 1. DATA STORE & INITIAL STATE
// ==========================================

const learningModules = [
  {
    id: 'linux',
    name: 'Linux',
    category: 'Systems & OS',
    platformName: 'Linux Journey (LabEx)',
    url: 'https://labex.io/courses/linux-journey',
    status: 'Completed',
    progress: 100,
    description: 'Operating system fundamentals, file hierarchies, bash scripting, SSH, and server administration.',
    topics: [
      { name: 'Terminal Navigation & File Permissions (chmod, chown)', completed: true },
      { name: 'Systemd & Background Service Management', completed: true },
      { name: 'User, Group & Sudo Administration', completed: true },
      { name: 'SSH Key Pairs & Secure Remote Access', completed: true },
      { name: 'Bash Scripting & Automation Basics', completed: true }
    ],
    cheatSheet: 'ssh -i key.pem user@host\nsudo systemctl status service\nchmod 755 script.sh\ndf -h && free -m',
    nextStep: 'Master advanced shell text processing with awk, sed, and grep pipelines.'
  },
  {
    id: 'git-github',
    name: 'Git & GitHub',
    category: 'Version Control',
    platformName: 'Learn Git Branching (GitHub)',
    url: 'https://learngitbranching.js.org/',
    status: 'Learning',
    progress: 50,
    description: 'Distributed version control, atomic commits, branch strategies, pull requests, and team collaboration.',
    topics: [
      { name: 'Repository Initialization & Staging (init, add, commit)', completed: true },
      { name: 'Branching Workflows (feature branches, checkout -b)', completed: true },
      { name: 'Remote Repositories, Push & Pull Requests', completed: false },
      { name: 'Merge Conflict Resolution & Interactive Rebase', completed: false },
      { name: 'Git Hooks, Semantic Tags & Release Management', completed: false }
    ],
    cheatSheet: 'git checkout -b feature/auth\ngit add . && git commit -m "feat: init"\ngit push -u origin feature/auth\ngit rebase -i HEAD~3',
    nextStep: 'Push CloudDeploy Hub repository to GitHub with branch protection rules.'
  },
  {
    id: 'aws',
    name: 'AWS',
    category: 'Cloud Infrastructure',
    platformName: 'AWS Skill Builder',
    url: 'https://explore.skillbuilder.aws/',
    status: 'Learning',
    progress: 40,
    description: 'Cloud fundamentals, EC2 compute instances, S3 storage buckets, IAM security policies, and VPC networking.',
    topics: [
      { name: 'Cloud Architecture & AWS Global Regions / Availability Zones', completed: true },
      { name: 'IAM Users, Roles & Least Privilege Principle', completed: true },
      { name: 'EC2 Virtual Machines, Security Groups & Key Pairs', completed: false },
      { name: 'S3 Buckets & Static Web Asset Hosting', completed: false },
      { name: 'VPC Subnets, Route Tables & Internet Gateways', completed: false }
    ],
    cheatSheet: 'aws ec2 describe-instances\naws s3 sync ./dist s3://my-bucket\naws iam list-users\ncurl http://169.254.169.254/latest/meta-data/',
    nextStep: 'Configure an S3 bucket with CloudFront CDN for global low-latency delivery.'
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'Containerization',
    platformName: 'Docker Curriculum & Labs',
    url: 'https://docker-curriculum.com/',
    status: 'Upcoming',
    progress: 0,
    description: 'Containerization, creating lean Dockerfiles, multi-stage builds, named volumes, and Docker Compose.',
    topics: [
      { name: 'Containers vs Virtual Machines Core Concepts', completed: false },
      { name: 'Writing Multi-stage Dockerfiles', completed: false },
      { name: 'Image Layer Caching & Minimizing Footprint', completed: false },
      { name: 'Bridge Networking & Persistent Volumes', completed: false },
      { name: 'Docker Compose Multi-service Orchestration', completed: false }
    ],
    cheatSheet: 'docker build -t clouddeploy:latest .\ndocker run -d -p 80:80 --name app clouddeploy\ndocker ps -a\ndocker logs -f app',
    nextStep: 'Containerize this web application using an alpine-based web server image.'
  },
  {
    id: 'cicd',
    name: 'CI/CD',
    category: 'Automation',
    platformName: 'GitHub Actions CI/CD Labs',
    url: 'https://docs.github.com/en/actions/learn-github-actions',
    status: 'Upcoming',
    progress: 0,
    description: 'Automated testing suites, continuous integration workflows, GitHub Actions, and production deployments.',
    topics: [
      { name: 'Continuous Integration vs Continuous Delivery Principles', completed: false },
      { name: 'GitHub Actions YAML Syntax & Trigger Events', completed: false },
      { name: 'Automated Linting, Unit Testing & Build Matrix', completed: false },
      { name: 'Encrypted Repository Secrets & Environment Approvals', completed: false },
      { name: 'Automated Deployment via SSH / AWS CLI', completed: false }
    ],
    cheatSheet: 'name: CI/CD Pipeline\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps: ...',
    nextStep: 'Draft .github/workflows/deploy.yml to automate repository validation.'
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    category: 'Observability',
    platformName: 'Prometheus & Grafana Tutorials',
    url: 'https://prometheus.io/docs/introduction/overview/',
    status: 'Upcoming',
    progress: 0,
    description: 'Observability fundamentals, server health checks, uptime probes, centralized logs, and alerts.',
    topics: [
      { name: 'The 3 Pillars: Metrics, Logs & Distributed Traces', completed: false },
      { name: 'Health Probe Endpoints (/health, /readiness)', completed: false },
      { name: 'Log Rotation & Centralized Syslog Management', completed: false },
      { name: 'CPU, Memory & Disk I/O Metric Telemetry', completed: false },
      { name: 'Automated Alerting Triggers & Notification Channels', completed: false }
    ],
    cheatSheet: 'curl -i https://clouddeploy.dev/health\njournalctl -u nginx -f\nuptime && htop\ndf -h',
    nextStep: 'Deploy uptime heartbeat monitoring to ensure 99.9% portfolio availability.'
  }
];

const deploymentStages = [
  {
    step: '01',
    id: 'local',
    name: 'Local',
    state: 'Completed',
    environment: 'Local Development Environment',
    tool: 'Vite / Local Host',
    command: 'npm run dev --host 0.0.0.0 --port 3000',
    description: 'Local workspace initialized with modular HTML5, CSS3, and JavaScript architecture.',
    checklist: [
      'Semantic HTML5 structure validated',
      'Modern responsive SaaS layout with CSS Grid & Flexbox',
      'Modular client-side JavaScript with clean state management',
      'Verified zero console errors across viewports'
    ]
  },
  {
    step: '02',
    id: 'github',
    name: 'GitHub',
    state: 'In Progress',
    environment: 'Remote Version Control Repository',
    tool: 'Git / GitHub CLI',
    command: 'git remote add origin https://github.com/cse-student/clouddeploy-hub.git\ngit push -u origin main',
    description: 'Version control initialization, branch strategy, README documentation, and open source release.',
    checklist: [
      'Git repository initialized with clean history',
      'Descriptive commit messages following Conventional Commits',
      'Comprehensive portfolio documentation and architecture diagrams',
      'Repository public visibility configured for portfolio showcase'
    ]
  },
  {
    step: '03',
    id: 'aws',
    name: 'AWS',
    state: 'Upcoming',
    environment: 'Cloud Infrastructure (AWS EC2 / S3)',
    tool: 'AWS Cloud / S3 / EC2',
    command: 'aws s3 sync ./dist s3://clouddeploy-hub-portfolio --acl public-read',
    description: 'Provisioning cloud infrastructure on AWS for globally reachable production hosting.',
    checklist: [
      'AWS IAM student account with least-privilege security roles',
      'Amazon S3 bucket configured for static web application hosting',
      'Amazon CloudFront CDN provisioned for edge caching & TLS termination',
      'AWS Route 53 or custom DNS mapping'
    ]
  },
  {
    step: '04',
    id: 'docker',
    name: 'Docker',
    state: 'Upcoming',
    environment: 'Container Runtime Environment',
    tool: 'Docker Engine',
    command: 'docker build -t clouddeploy-hub:v1 .\ndocker run -d -p 8080:80 clouddeploy-hub:v1',
    description: 'Packaging the application into a lightweight, repeatable, self-contained Docker container image.',
    checklist: [
      'Write optimized Dockerfile using alpine base image',
      'Configure non-root user for security best practices',
      'Container image size audit (< 25MB footprint)',
      'Test container execution across Linux, macOS and Windows'
    ]
  },
  {
    step: '05',
    id: 'nginx',
    name: 'Nginx',
    state: 'Upcoming',
    environment: 'Web Server & Reverse Proxy',
    tool: 'Nginx 1.26',
    command: 'nginx -t && sudo systemctl reload nginx',
    description: 'High-performance production web server configured with HTTP compression and caching headers.',
    checklist: [
      'Nginx virtual host configuration block created',
      'Gzip and Brotli compression enabled for static assets',
      'Security headers configured (X-Frame-Options, CSP, Referrer-Policy)',
      'Custom 404 and 50x error routing configured'
    ]
  },
  {
    step: '06',
    id: 'https',
    name: 'HTTPS',
    state: 'Upcoming',
    environment: 'SSL/TLS Security Layer',
    tool: 'Certbot / Let\'s Encrypt',
    command: 'sudo certbot --nginx -d clouddeploy.dev --agree-tos -m dev@clouddeploy.dev',
    description: 'Securing all incoming and outgoing client traffic with automated SSL/TLS certificates and TLS 1.3.',
    checklist: [
      'Automated Let’s Encrypt certificate issuance',
      'HTTP to HTTPS strict 301 redirection enforced',
      'HSTS (HTTP Strict Transport Security) header enabled',
      'Automated cron certificate renewal verification'
    ]
  },
  {
    step: '07',
    id: 'cicd',
    name: 'CI/CD',
    state: 'Upcoming',
    environment: 'GitHub Actions Continuous Deployment',
    tool: 'GitHub Actions',
    command: 'git push origin main # Triggers .github/workflows/deploy.yml automatically',
    description: 'Continuous Integration and Continuous Deployment pipeline to test, build, and deploy on git push.',
    checklist: [
      'Draft .github/workflows/deploy.yml pipeline definition',
      'Automated code syntax checking and link validation',
      'Secure deployment via encrypted AWS credentials or SSH keys',
      'Automated build status notifications upon success/failure'
    ]
  },
  {
    step: '08',
    id: 'monitoring',
    name: 'Monitoring',
    state: 'Upcoming',
    environment: 'Observability & Health Probes',
    tool: 'Uptime Kuma / Prometheus',
    command: 'curl -fsSL https://clouddeploy.dev/healthz || exit 1',
    description: 'Live production health checks, uptime monitoring, latency tracking, and incident alerting.',
    checklist: [
      'Configure automated 1-minute interval HTTP uptime pings',
      'Server resource telemetry monitoring (CPU, Memory, Disk)',
      'Centralized access and error log aggregation',
      'Instant notification webhooks for zero-downtime assurance'
    ]
  }
];

const skillsData = [
  { name: 'Linux', category: 'Systems & OS', level: 'Advanced', keywords: 'Ubuntu, Shell, Bash, Permissions, Systemd' },
  { name: 'Git', category: 'Version Control', level: 'Proficient', keywords: 'Branching, Merge, Rebase, Stash, Log' },
  { name: 'GitHub', category: 'Version Control', level: 'Proficient', keywords: 'Pull Requests, Forks, Issues, Actions' },
  { name: 'AWS', category: 'Cloud Infrastructure', level: 'Learning', keywords: 'EC2, S3, IAM, CloudFront, VPC' },
  { name: 'Docker', category: 'Containerization', level: 'Learning', keywords: 'Dockerfile, Images, Containers, Volumes' },
  { name: 'CI/CD', category: 'Automation', level: 'Learning', keywords: 'GitHub Actions, Pipelines, Workflows' },
  { name: 'Nginx', category: 'Systems & OS', level: 'Familiar', keywords: 'Reverse Proxy, Virtual Hosts, SSL, Gzip' },
  { name: 'Networking', category: 'Systems & OS', level: 'Proficient', keywords: 'DNS, TCP/IP, HTTP/S, Ports, Firewalls' },
  { name: 'HTML', category: 'Frontend Web', level: 'Advanced', keywords: 'HTML5, Semantic Elements, Accessibility' },
  { name: 'CSS', category: 'Frontend Web', level: 'Advanced', keywords: 'CSS3, Flexbox, Grid, Responsive, Variables' },
  { name: 'JavaScript', category: 'Frontend Web', level: 'Proficient', keywords: 'ES6+, DOM API, Fetch, Event Handling' }
];

// Portfolio Projects Store & Persistence
const defaultProjects = [
  {
    id: 'clouddeploy-hub',
    title: 'CloudDeploy Hub',
    version: 'v1.0.0',
    description: '“An evolving Cloud and DevOps learning platform built and progressively deployed using modern development and deployment technologies.”',
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'Semantic Web', 'DevOps Pipeline'],
    status: 'In Development',
    deployment: 'Local Development',
    targetCloud: 'AWS S3 + CloudFront',
    repository: 'cse/clouddeploy-hub',
    isDefault: true
  }
];

let projectsData = [];

function loadProjects() {
  try {
    const saved = localStorage.getItem('clouddeploy_hub_projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        projectsData = parsed;
        return;
      }
    }
  } catch (e) {
    console.warn('Could not read projects from localStorage', e);
  }
  projectsData = [...defaultProjects];
}

function saveProjects() {
  try {
    localStorage.setItem('clouddeploy_hub_projects', JSON.stringify(projectsData));
  } catch (e) {
    console.error('Failed to save projects to localStorage', e);
  }
}

// ==========================================
// 2. DOM ELEMENT REFERENCES
// ==========================================

const learningCardsContainer = document.getElementById('learning-cards-grid');
const learningSearchInput = document.getElementById('learning-search');
const learningFilterButtons = document.querySelectorAll('.filter-btn');

const pipelineTrack = document.getElementById('pipeline-track');
const inspectorTitle = document.getElementById('inspector-title');
const inspectorDesc = document.getElementById('inspector-desc');
const inspectorTool = document.getElementById('inspector-tool');
const inspectorEnv = document.getElementById('inspector-env');
const inspectorChecklist = document.getElementById('inspector-checklist');
const inspectorTerminal = document.getElementById('inspector-terminal');

const skillsGrid = document.getElementById('skills-grid');
const skillCategoryButtons = document.querySelectorAll('.skill-category-btn');

// Projects Elements
const projectsListContainer = document.getElementById('projects-list');
const projectsCountIndicator = document.getElementById('projects-count-indicator');
const addProjectModal = document.getElementById('add-project-modal');
const addProjectModalCloseBtn = document.getElementById('add-project-modal-close-btn');

// Metrics elements
const statLearningCount = document.getElementById('stat-learning-count');
const statProjectsCount = document.getElementById('stat-projects-count');
const statDeploymentsCount = document.getElementById('stat-deployments-count');
const statSkillsCount = document.getElementById('stat-skills-count');

// Modal elements
const moduleModal = document.getElementById('module-modal');
const modalModuleTitle = document.getElementById('modal-module-title');
const modalModuleCategory = document.getElementById('modal-module-category');
const modalModuleDesc = document.getElementById('modal-module-desc');
const modalModuleProgress = document.getElementById('modal-module-progress');
const modalModuleFill = document.getElementById('modal-module-fill');
const modalTopicsList = document.getElementById('modal-topics-list');
const modalCheatsheet = document.getElementById('modal-cheatsheet');
const modalNextStep = document.getElementById('modal-next-step');
const modalCloseBtn = document.getElementById('modal-close-btn');

// Project Modal
const projectModal = document.getElementById('project-modal');
const projectModalCloseBtn = document.getElementById('project-modal-close-btn');

// Mobile Nav Toggle
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');

// Active inspecting state for pipeline
let currentInspectedStageId = 'local';
let activeLearningFilter = 'all';
let activeSkillCategory = 'all';

// ==========================================
// 3. INITIALIZATION & RENDERING
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  renderProjects();
  renderLearningCards();
  renderDeploymentPipeline();
  renderSkills();
  updateStatistics();
  setupNavigation();
  setupEventListeners();
});

// Update Statistics Counters
function updateStatistics() {
  const totalModules = learningModules.length;

  if (statLearningCount) {
    statLearningCount.textContent = totalModules;
  }
  if (statProjectsCount) {
    statProjectsCount.textContent = projectsData.length.toString();
  }
  if (statDeploymentsCount) {
    // 0 in production cloud, local development active
    statDeploymentsCount.textContent = '0';
  }
  if (statSkillsCount) {
    statSkillsCount.textContent = skillsData.length;
  }
}

// ==========================================
// 4. LEARNING DASHBOARD MODULES
// ==========================================

function renderLearningCards() {
  if (!learningCardsContainer) return;

  const searchQuery = learningSearchInput ? learningSearchInput.value.toLowerCase().trim() : '';

  const filtered = learningModules.filter(module => {
    const matchesFilter =
      activeLearningFilter === 'all' ||
      (activeLearningFilter === 'completed' && module.status === 'Completed') ||
      (activeLearningFilter === 'learning' && module.status === 'Learning') ||
      (activeLearningFilter === 'upcoming' && module.status === 'Upcoming');

    const matchesSearch =
      module.name.toLowerCase().includes(searchQuery) ||
      module.description.toLowerCase().includes(searchQuery) ||
      module.category.toLowerCase().includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    learningCardsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #ffffff; border-radius: 12px; border: 1px dashed var(--slate-300);">
        <p style="color: var(--slate-500); font-weight: 500;">No learning modules found matching your query.</p>
        <button class="btn btn-outline btn-sm" style="margin-top: 1rem;" onclick="resetLearningFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  learningCardsContainer.innerHTML = filtered.map(module => {
    const statusClass = module.status.toLowerCase().replace(' ', '-');
    const completedTopics = module.topics.filter(t => t.completed).length;
    const totalTopics = module.topics.length;

    // Technology Icon SVGs
    const iconSvg = getTechIcon(module.id);

    return `
      <article class="learning-card" data-id="${module.id}">
        <div class="card-top">
          <div class="tech-icon-badge">
            ${iconSvg}
          </div>
          <span class="status-badge ${statusClass}">
            <span class="status-indicator-dot"></span>
            ${module.status}
          </span>
        </div>

        <h3 class="card-title">${module.name}</h3>
        <p class="card-description">${module.description}</p>

        <!-- Corresponding Platform Link -->
        <a href="${module.url}" target="_blank" rel="noopener noreferrer" class="card-platform-row" title="Launch ${module.platformName}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span>Platform: ${module.platformName}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto;">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>

        <div class="progress-container">
          <div class="progress-header">
            <span>Module Mastery</span>
            <span class="progress-percent tabular-nums">${module.progress}%</span>
          </div>
          <div class="progress-track" role="progressbar" aria-valuenow="${module.progress}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill ${statusClass}" style="width: ${module.progress}%"></div>
          </div>
        </div>

        <div class="card-footer">
          <button class="btn btn-outline btn-sm" onclick="openModuleModal('${module.id}')" title="View study checklist and command cheat sheet">
            <span>Syllabus</span>
          </button>
          <a href="${module.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" title="Go to ${module.platformName}">
            <span>Learn Module</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </article>
    `;
  }).join('');
}

// Global direct learning redirection helper
window.learnModule = function(moduleId) {
  const module = learningModules.find(m => m.id === moduleId);
  if (module && module.url) {
    showToast(`Opening ${module.platformName}...`);
    window.open(module.url, '_blank', 'noopener,noreferrer');
  }
};

function resetLearningFilters() {
  if (learningSearchInput) learningSearchInput.value = '';
  activeLearningFilter = 'all';
  learningFilterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
  });
  renderLearningCards();
}

// Module Learning Modal Open & Dynamic Checklist
window.openModuleModal = function(moduleId) {
  const module = learningModules.find(m => m.id === moduleId);
  if (!module || !moduleModal) return;

  modalModuleTitle.textContent = module.name;
  modalModuleCategory.textContent = module.category;
  modalModuleDesc.textContent = module.description;
  modalModuleProgress.textContent = `${module.progress}%`;
  modalModuleFill.style.width = `${module.progress}%`;
  modalModuleFill.className = `progress-fill ${module.status.toLowerCase()}`;
  modalCheatsheet.textContent = module.cheatSheet;
  modalNextStep.textContent = module.nextStep;

  // Set platform link in modal
  const modalPlatformName = document.getElementById('modal-platform-name');
  const modalPlatformLink = document.getElementById('modal-platform-link');
  if (modalPlatformName) modalPlatformName.textContent = module.platformName;
  if (modalPlatformLink) {
    modalPlatformLink.href = module.url;
    modalPlatformLink.title = `Launch ${module.platformName}`;
  }

  // Render topics checklist with interactive checkboxes
  modalTopicsList.innerHTML = module.topics.map((topic, index) => {
    return `
      <li style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid var(--slate-100);">
        <input 
          type="checkbox" 
          id="topic-${module.id}-${index}" 
          ${topic.completed ? 'checked' : ''} 
          style="margin-top: 0.25rem; width: 1.1rem; height: 1.1rem; accent-color: var(--primary); cursor: pointer;"
          onchange="toggleTopicCompletion('${module.id}', ${index}, this.checked)"
        />
        <label for="topic-${module.id}-${index}" style="font-size: 0.875rem; color: var(--navy-900); cursor: pointer; ${topic.completed ? 'text-decoration: line-through; color: var(--slate-400);' : ''}">
          ${topic.name}
        </label>
      </li>
    `;
  }).join('');

  moduleModal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

// Toggle Topic completion dynamically and recalculate progress!
window.toggleTopicCompletion = function(moduleId, topicIndex, isCompleted) {
  const module = learningModules.find(m => m.id === moduleId);
  if (!module) return;

  module.topics[topicIndex].completed = isCompleted;

  // Recalculate percentage
  const completedCount = module.topics.filter(t => t.completed).length;
  const totalCount = module.topics.length;
  const newProgress = Math.round((completedCount / totalCount) * 100);
  module.progress = newProgress;

  // Update status based on progress
  if (newProgress === 100) {
    module.status = 'Completed';
  } else if (newProgress > 0) {
    module.status = 'Learning';
  } else {
    module.status = 'Upcoming';
  }

  // Update modal progress display
  modalModuleProgress.textContent = `${module.progress}%`;
  modalModuleFill.style.width = `${module.progress}%`;
  modalModuleFill.className = `progress-fill ${module.status.toLowerCase()}`;

  // Update label strike-through
  const label = document.querySelector(`label[for="topic-${moduleId}-${topicIndex}"]`);
  if (label) {
    label.style.textDecoration = isCompleted ? 'line-through' : 'none';
    label.style.color = isCompleted ? 'var(--slate-400)' : 'var(--navy-900)';
  }

  // Refresh main cards & stats
  renderLearningCards();
  updateStatistics();
  showToast(`Updated ${module.name} progress: ${newProgress}%`);
};

// ==========================================
// 5. DEPLOYMENT PIPELINE
// ==========================================

function renderDeploymentPipeline() {
  if (!pipelineTrack) return;

  pipelineTrack.innerHTML = deploymentStages.map(stage => {
    const stateClass = stage.state.toLowerCase().replace(' ', '-');
    const isInspecting = stage.id === currentInspectedStageId;

    const stageIcon = getStageIcon(stage.id);

    return `
      <div 
        class="pipeline-stage-card state-${stateClass} ${isInspecting ? 'active-inspect' : ''}" 
        data-stage-id="${stage.id}"
        onclick="inspectStage('${stage.id}')"
        role="button"
        tabindex="0"
      >
        <span class="stage-step-num">${stage.step}</span>
        <div class="stage-node-icon">
          ${stageIcon}
        </div>
        <span class="stage-name">${stage.name}</span>
        <span class="stage-status-label">${stage.state}</span>
      </div>
    `;
  }).join('');

  updateStageInspector(currentInspectedStageId);
}

window.inspectStage = function(stageId) {
  currentInspectedStageId = stageId;
  document.querySelectorAll('.pipeline-stage-card').forEach(card => {
    card.classList.toggle('active-inspect', card.getAttribute('data-stage-id') === stageId);
  });
  updateStageInspector(stageId);
};

function updateStageInspector(stageId) {
  const stage = deploymentStages.find(s => s.id === stageId);
  if (!stage) return;

  if (inspectorTitle) {
    inspectorTitle.innerHTML = `
      <span>Stage ${stage.step}: ${stage.name}</span>
      <span class="status-badge ${stage.state.toLowerCase().replace(' ', '-')}" style="font-size: 0.7rem;">
        <span class="status-indicator-dot"></span>
        ${stage.state}
      </span>
    `;
  }

  if (inspectorDesc) inspectorDesc.textContent = stage.description;
  if (inspectorTool) inspectorTool.textContent = stage.tool;
  if (inspectorEnv) inspectorEnv.textContent = stage.environment;

  if (inspectorTerminal) {
    inspectorTerminal.innerHTML = stage.command
      .split('\n')
      .map(cmd => `<div><span class="terminal-prompt">$</span> ${escapeHtml(cmd)}</div>`)
      .join('');
  }

  if (inspectorChecklist) {
    inspectorChecklist.innerHTML = stage.checklist.map(item => `
      <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--slate-700); margin-bottom: 0.4rem;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${stage.state === 'Completed' ? 'var(--success)' : 'var(--primary)'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${escapeHtml(item)}</span>
      </li>
    `).join('');
  }
}

// ==========================================
// 6. SKILLS SECTION
// ==========================================

function renderSkills() {
  if (!skillsGrid) return;

  const filtered = skillsData.filter(skill => {
    if (activeSkillCategory === 'all') return true;
    return skill.category === activeSkillCategory;
  });

  skillsGrid.innerHTML = filtered.map(skill => {
    return `
      <div class="skill-card">
        <div class="skill-head">
          <div class="skill-icon">
            ${getSkillIcon(skill.name)}
          </div>
          <span class="skill-level-text">${skill.level}</span>
        </div>
        <h4 class="skill-name">${skill.name}</h4>
        <div class="skill-category-tag">${skill.category}</div>
        <p class="skill-keywords">${skill.keywords}</p>
      </div>
    `;
  }).join('');
}

// ==========================================
// 7. EVENT LISTENERS & NAVIGATION
// ==========================================

function setupNavigation() {
  // Smooth scroll and active navbar highlights
  const navLinks = document.querySelectorAll('.nav-link, .btn[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetSection = document.querySelector(href);
        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({ behavior: 'smooth' });

          // Close mobile menu if open
          if (navMenu) {
            navMenu.classList.remove('mobile-open');
          }
        }
      }
    });
  });

  // Sticky header shadow
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
  }
}

function setupEventListeners() {
  // Search input in learning dashboard
  if (learningSearchInput) {
    learningSearchInput.addEventListener('input', () => {
      renderLearningCards();
    });
  }

  // Filter tabs in learning dashboard
  learningFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      learningFilterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeLearningFilter = btn.getAttribute('data-filter');
      renderLearningCards();
    });
  });

  // Skill category filter buttons
  skillCategoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      skillCategoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSkillCategory = btn.getAttribute('data-category');
      renderSkills();
    });
  });

  // Close modals
  if (modalCloseBtn && moduleModal) {
    modalCloseBtn.addEventListener('click', () => {
      moduleModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (projectModalCloseBtn && projectModal) {
    projectModalCloseBtn.addEventListener('click', () => {
      projectModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close modal on click outside backdrop
  [moduleModal, projectModal, addProjectModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      moduleModal?.classList.remove('open');
      projectModal?.classList.remove('open');
      addProjectModal?.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ==========================================
// 8. PROJECTS RENDERING & MANAGEMENT
// ==========================================

function renderProjects() {
  if (!projectsListContainer) return;

  if (projectsCountIndicator) {
    projectsCountIndicator.textContent = `Showing ${projectsData.length} Portfolio ${projectsData.length === 1 ? 'Project' : 'Projects'}`;
  }

  if (projectsData.length === 0) {
    projectsListContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: #ffffff; border-radius: 12px; border: 1px dashed var(--slate-300);">
        <p style="color: var(--slate-500); font-weight: 500;">No projects added yet.</p>
        <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="openAddProjectModal()">
          <span>+ Add First Project</span>
        </button>
      </div>
    `;
    return;
  }

  projectsListContainer.innerHTML = projectsData.map(project => {
    const statusLower = (project.status || '').toLowerCase();
    const statusClass = statusLower.includes('development') || statusLower.includes('progress')
      ? 'learning'
      : (statusLower.includes('completed') || statusLower.includes('production') ? 'completed' : 'upcoming');

    const techTags = Array.isArray(project.techStack)
      ? project.techStack.map(t => `<span class="tech-tag">${escapeHtml(t.trim())}</span>`).join('')
      : project.techStack.split(',').map(t => `<span class="tech-tag">${escapeHtml(t.trim())}</span>`).join('');

    return `
      <article class="project-card" data-project-id="${project.id}">
        <div class="project-main">
          <div class="project-badge-row">
            <span class="status-badge ${statusClass}">
              <span class="status-indicator-dot"></span>
              ${escapeHtml(project.status)}
            </span>
            <span style="font-size: 0.8125rem; font-family: var(--font-mono); color: var(--slate-500);">${escapeHtml(project.version || 'v1.0.0')}</span>
          </div>

          <h3 class="project-title">${escapeHtml(project.title)}</h3>
          <p class="project-description">${escapeHtml(project.description)}</p>

          <div class="tech-stack-row">
            ${techTags}
          </div>

          <div class="project-actions">
            <button class="btn btn-primary" onclick="openProjectModal('${project.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>View Project</span>
            </button>
            <button class="btn btn-outline" onclick="scrollToDeployment()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="6" x2="6" y1="3" y2="15"></line>
                <circle cx="18" cy="6" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <path d="M18 9a9 9 0 0 1-9 9"></path>
              </svg>
              <span>Deployment Details</span>
            </button>
            ${!project.isDefault ? `
              <button class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #fecaca; margin-left: auto;" onclick="deleteProject('${project.id}')" title="Delete project">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
                <span>Delete</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Project Specs Sidebar -->
        <div class="project-specs">
          <div class="spec-item">
            <span class="spec-label">Project Status</span>
            <span class="spec-value" style="color: ${statusClass === 'learning' ? 'var(--warning-text)' : (statusClass === 'completed' ? 'var(--success-text)' : 'var(--navy-900)')};">
              ${escapeHtml(project.status)}
            </span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Deployment</span>
            <span class="spec-value">${escapeHtml(project.deployment || 'Local Development')}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Target Cloud</span>
            <span class="spec-value">${escapeHtml(project.targetCloud || 'AWS Cloud')}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Repository</span>
            <span class="spec-value" style="font-family: var(--font-mono); font-size: 0.8125rem;">
              ${escapeHtml(project.repository || 'repo')}
            </span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Open/Close Add Project Modal
window.openAddProjectModal = function() {
  if (addProjectModal) {
    addProjectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.getElementById('new-project-title')?.focus();
    }, 100);
  }
};

window.closeAddProjectModal = function() {
  if (addProjectModal) {
    addProjectModal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

// Pre-fill Sample Project for Quick Testing
window.prefillSampleProject = function() {
  const samples = [
    {
      title: 'Microservices Containerized Pipeline',
      version: 'v1.1.0',
      desc: 'Multi-container microservices application containerized with Docker, automated testing with GitHub Actions CI, and deployed on AWS ECS with ALB reverse proxy.',
      tech: 'Python, FastAPI, Docker, AWS ECS, Terraform, GitHub Actions, Redis',
      status: 'In Development',
      env: 'AWS Staging',
      cloud: 'AWS ECS / Fargate',
      repo: 'github.com/cse-student/microservices-pipeline'
    },
    {
      title: 'KubeDeploy Cloud Native Dashboard',
      version: 'v2.0.0',
      desc: 'Production Kubernetes deployment cluster manager with Prometheus node telemetry, Helm chart automation, and Nginx ingress SSL termination.',
      tech: 'Go, Kubernetes, Helm, Nginx, Prometheus, Grafana, AWS EKS',
      status: 'In Progress',
      env: 'Kubernetes Cluster',
      cloud: 'AWS EKS / EC2',
      repo: 'github.com/cse-student/kubedeploy-cluster'
    },
    {
      title: 'Serverless Real-Time Event Pipeline',
      version: 'v1.0.0',
      desc: 'Event-driven data processing pipeline using AWS Lambda, S3 triggers, DynamoDB, and CloudWatch metrics with automated infrastructure as code.',
      tech: 'Node.js, AWS Lambda, DynamoDB, S3, CloudWatch, Serverless Framework',
      status: 'Completed',
      env: 'AWS Production',
      cloud: 'AWS Serverless',
      repo: 'github.com/cse-student/serverless-pipeline'
    }
  ];

  const sample = samples[Math.floor(Math.random() * samples.length)];
  const titleInput = document.getElementById('new-project-title');
  const verInput = document.getElementById('new-project-version');
  const descInput = document.getElementById('new-project-desc');
  const techInput = document.getElementById('new-project-tech');
  const statusSelect = document.getElementById('new-project-status');
  const envSelect = document.getElementById('new-project-env');
  const cloudInput = document.getElementById('new-project-cloud');
  const repoInput = document.getElementById('new-project-repo');

  if (titleInput) titleInput.value = sample.title;
  if (verInput) verInput.value = sample.version;
  if (descInput) descInput.value = sample.desc;
  if (techInput) techInput.value = sample.tech;
  if (statusSelect) statusSelect.value = sample.status;
  if (envSelect) envSelect.value = sample.env;
  if (cloudInput) cloudInput.value = sample.cloud;
  if (repoInput) repoInput.value = sample.repo;

  showToast('Pre-filled sample project details!');
};

// Handle Form Submission to Create Project
window.handleCreateProject = function(e) {
  e.preventDefault();
  const title = (document.getElementById('new-project-title')?.value || '').trim();
  const version = (document.getElementById('new-project-version')?.value || '').trim() || 'v1.0.0';
  const desc = (document.getElementById('new-project-desc')?.value || '').trim();
  const techStr = (document.getElementById('new-project-tech')?.value || '').trim();
  const status = document.getElementById('new-project-status')?.value || 'In Development';
  const env = document.getElementById('new-project-env')?.value || 'Local Development';
  const cloud = (document.getElementById('new-project-cloud')?.value || '').trim() || 'AWS Cloud';
  const repo = (document.getElementById('new-project-repo')?.value || '').trim() || 'github.com/cse-student/' + title.toLowerCase().replace(/[^a-z0-9]/g, '-');

  if (!title || !desc || !techStr) {
    showToast('Please fill in project name, description, and tech stack.');
    return;
  }

  const techStack = techStr.split(',').map(t => t.trim()).filter(Boolean);

  const newProject = {
    id: 'project-' + Date.now(),
    title,
    version,
    description: desc,
    techStack,
    status,
    deployment: env,
    targetCloud: cloud,
    repository: repo,
    isDefault: false
  };

  projectsData.unshift(newProject);
  saveProjects();
  renderProjects();
  updateStatistics();
  closeAddProjectModal();

  document.getElementById('add-project-form')?.reset();
  showToast(`Added "${title}" to your portfolio!`);
};

// Delete a user-added project
window.deleteProject = function(projectId) {
  const project = projectsData.find(p => p.id === projectId);
  if (!project) return;
  projectsData = projectsData.filter(p => p.id !== projectId);
  saveProjects();
  renderProjects();
  updateStatistics();
  showToast(`Removed project "${project.title}"`);
};

// Project modal triggers
window.openProjectModal = function(projectId) {
  const project = projectsData.find(p => p.id === projectId) || projectsData[0];
  if (projectModal && project) {
    const modalProjectTitle = document.getElementById('modal-project-title');
    if (modalProjectTitle) {
      modalProjectTitle.textContent = `${project.title} — Technical Overview`;
    }
    projectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.scrollToDeployment = function() {
  const deploymentSection = document.getElementById('deployment');
  if (deploymentSection) {
    deploymentSection.scrollIntoView({ behavior: 'smooth' });
    inspectStage('local');
    showToast('Viewing CloudDeploy Hub deployment pipeline');
  }
};

// Toast notification helper
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// Global copy email action
window.copyContactEmail = function(email) {
  navigator.clipboard.writeText(email).then(() => {
    showToast(`Copied ${email} to clipboard!`);
  }).catch(() => {
    showToast(`Contact email: ${email}`);
  });
};

// Helper: Escape HTML string
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// ==========================================
// 8. VECTOR ICONS (High fidelity, zero external deps)
// ==========================================

function getTechIcon(id) {
  switch (id) {
    case 'linux':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m6 8 4 4-4 4"/><path d="M12 16h6"/></svg>`;
    case 'git-github':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 9v12"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`;
    case 'aws':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
    case 'docker':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h16v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-3Z"/><rect width="3" height="3" x="5" y="10" rx="0.5"/><rect width="3" height="3" x="9" y="10" rx="0.5"/><rect width="3" height="3" x="13" y="10" rx="0.5"/><rect width="3" height="3" x="9" y="6" rx="0.5"/></svg>`;
    case 'cicd':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>`;
    case 'monitoring':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`;
  }
}

function getStageIcon(id) {
  switch (id) {
    case 'local':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`;
    case 'github':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 9v12"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`;
    case 'aws':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
    case 'docker':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h16v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-3Z"/><rect width="3" height="3" x="7" y="10" rx="0.5"/><rect width="3" height="3" x="11" y="10" rx="0.5"/></svg>`;
    case 'nginx':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>`;
    case 'https':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    case 'cicd':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
    case 'monitoring':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;
    default:
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
  }
}

function getSkillIcon(name) {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
}

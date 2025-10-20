# Contributing to ZodForge Landing

Thank you for your interest in contributing to ZodForge Landing! This document provides guidelines and instructions for contributors.

## 📖 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Spam or excessive self-promotion
- Other conduct inappropriate in a professional setting

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- Accounts: Stripe, Supabase, Resend (for testing)

### Fork and Clone

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/zodforge-landing.git
cd zodforge-landing

# Add upstream remote
git remote add upstream https://github.com/MerlijnW70/zodforge-landing.git

# Install dependencies
npm install
```

### Set Up Development Environment

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys** (see README.md for details)

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Visit**: http://localhost:4321

---

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Fetch latest changes
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### Branch Naming Conventions

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding/updating tests
- `chore/` - Maintenance tasks

### 2. Make Changes

- Keep changes focused and atomic
- Write clear, descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

### 3. Test Locally

```bash
# Type check
npm run type-check

# Build
npm run build

# Preview production build
npm run preview

# Run tests (if available)
npm test
```

### 4. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## 💻 Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Define types** explicitly where needed
- **Avoid `any`** unless absolutely necessary
- **Use interfaces** for object shapes

```typescript
// ✅ Good
interface CustomerData {
  email: string;
  tier: 'pro' | 'enterprise';
  apiKey: string;
}

function processCustomer(data: CustomerData): void {
  // Implementation
}

// ❌ Bad
function processCustomer(data: any): void {
  // Implementation
}
```

### Astro Components

- **Keep components small** and focused
- **Use props with TypeScript** types
- **Extract reusable logic** into utilities
- **Follow Astro best practices**

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<div class="component">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</div>
```

### TailwindCSS

- **Use Tailwind classes** instead of custom CSS
- **Follow utility-first** principles
- **Extract repeated patterns** into components
- **Use theme colors** from config

```html
<!-- ✅ Good -->
<button class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
  Click Me
</button>

<!-- ❌ Bad - avoid inline styles -->
<button style="background: blue; color: white;">
  Click Me
</button>
```

### File Naming

- **Components**: PascalCase (e.g., `Hero.astro`, `PricingCard.tsx`)
- **Pages**: kebab-case (e.g., `index.astro`, `success.astro`)
- **API Routes**: kebab-case (e.g., `create-checkout.ts`)
- **Utils**: camelCase (e.g., `formatCurrency.ts`)

### Code Organization

```
src/
├── components/       # Reusable UI components
├── layouts/          # Page layouts
├── pages/            # Routes and API endpoints
│   └── api/          # API routes
├── styles/           # Global styles
└── utils/            # Utility functions
```

---

## 🧪 Testing Guidelines

### Manual Testing

Before submitting a PR, test:

1. **Local Development**:
   - `npm run dev` - starts without errors
   - All pages load correctly
   - No console errors

2. **Production Build**:
   - `npm run build` - builds successfully
   - `npm run preview` - preview works

3. **Stripe Integration** (if modified):
   - Checkout flow completes
   - Test cards work
   - Redirects function correctly

4. **Responsive Design**:
   - Test on mobile (DevTools mobile view)
   - Test on tablet
   - Test on desktop

### Automated Tests

When adding new features:

```typescript
// Example test structure
import { test, expect } from '@playwright/test';

test('pricing page loads correctly', async ({ page }) => {
  await page.goto('http://localhost:4321');

  // Check pricing section exists
  const pricing = page.locator('#pricing');
  await expect(pricing).toBeVisible();

  // Check all tiers are shown
  await expect(page.locator('text=Free')).toBeVisible();
  await expect(page.locator('text=Pro')).toBeVisible();
  await expect(page.locator('text=Enterprise')).toBeVisible();
});
```

---

## 📝 Commit Guidelines

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Good commit messages
feat(pricing): add enterprise tier with custom pricing
fix(webhook): handle missing customer email gracefully
docs(readme): add troubleshooting section for webhooks
refactor(api): extract Stripe logic into separate service
test(checkout): add E2E tests for payment flow
chore(deps): update Astro to v5.1.0

# Bad commit messages
update stuff
fix bug
changes
WIP
```

### Writing Good Commit Messages

```bash
# ✅ Good - clear, specific, explains why
feat(email): add retry logic for failed email delivery

Email delivery could fail due to transient network issues.
This adds exponential backoff retry (3 attempts) to improve
reliability and reduce customer support requests.

Fixes #42

# ❌ Bad - vague, doesn't explain why
update email stuff
```

---

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow convention
- [ ] Branch is up to date with `main`

### PR Title Format

Use the same format as commit messages:

```
feat(scope): brief description
fix(scope): brief description
docs: brief description
```

### PR Description Template

```markdown
## Description
Brief summary of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (describe)

## Testing
Describe how you tested this:
- [ ] Tested locally
- [ ] Tested production build
- [ ] Tested on mobile
- [ ] Manual testing steps: ...

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests (if applicable)

## Related Issues
Fixes #(issue number)
Related to #(issue number)
```

### Review Process

1. **Automated Checks**: Must pass before review
   - Type checking
   - Build test
   - Linting

2. **Code Review**: Maintainer will review
   - Code quality
   - Adherence to guidelines
   - Test coverage
   - Documentation

3. **Feedback**: Address review comments
   - Make requested changes
   - Push to same branch
   - Re-request review

4. **Merge**: Once approved
   - Squash and merge (default)
   - Delete branch after merge

---

## 🏗️ Project Structure

### Directory Layout

```
zodforge-landing/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Hero.astro      # Landing hero section
│   │   ├── Features.astro  # Feature showcase
│   │   └── Pricing.astro   # Pricing tiers
│   ├── layouts/
│   │   └── BaseLayout.astro  # Base HTML template
│   ├── pages/
│   │   ├── index.astro     # Home page
│   │   ├── success.astro   # Post-payment success
│   │   └── api/            # API routes
│   │       ├── create-checkout.ts  # Stripe checkout
│   │       └── webhook.ts          # Payment webhook
│   ├── styles/
│   │   └── global.css      # Global styles
│   └── env.d.ts            # TypeScript env definitions
├── public/                 # Static assets
├── docs/                   # Documentation
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

### Key Files

| File | Purpose |
|------|---------|
| `src/pages/api/create-checkout.ts` | Creates Stripe checkout sessions |
| `src/pages/api/webhook.ts` | Handles Stripe payment webhooks |
| `src/components/Pricing.astro` | Pricing tiers and CTAs |
| `astro.config.mjs` | Astro and adapter configuration |
| `tailwind.config.mjs` | Theme colors and utilities |

---

## 🎨 Design Guidelines

### Colors

Follow the theme colors defined in `tailwind.config.mjs`:

```javascript
primary: {
  400: '#38bdf8',  // Lighter
  500: '#0ea5e9',  // Main brand color
  600: '#0284c7',  // Darker
}
```

### Typography

- **Headings**: Bold, gradient text for emphasis
- **Body**: 16px base, 1.6 line-height
- **Code**: Monospace font, dark background

### Spacing

Use Tailwind spacing scale:
- `px-4` = 16px
- `py-2` = 8px
- `mb-8` = 32px
- `gap-6` = 24px

---

## 🐛 Reporting Bugs

### Before Reporting

- Check if issue already exists
- Test on latest version
- Collect error messages/logs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the problem

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node.js: [e.g. v20.0.0]

**Additional context**
Any other relevant information
```

---

## 💡 Feature Requests

### Before Requesting

- Check if feature already requested
- Consider if it fits project scope
- Think about implementation

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives considered**
Other approaches you've thought about

**Additional context**
Mockups, examples, or other details
```

---

## 📚 Additional Resources

- [Astro Documentation](https://docs.astro.build)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🙏 Thank You!

Every contribution, no matter how small, helps make ZodForge better. We appreciate your time and effort!

**Questions?** Feel free to:
- Open a discussion on GitHub
- Ask in pull request comments
- Email: support@zodforge.dev

---

**Happy Contributing!** 🚀

Made with ❤️ by the ZodForge community

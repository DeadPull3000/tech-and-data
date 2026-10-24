# Contributing to Tech & Data

Welcome to the **Tech & Data Vertical** of the Quizzing Club! We are thrilled that you want to contribute.

Whether you are a seasoned software engineer or opening your very first pull request, your contributions, ideas, and feedback are valued here. This guide provides the complete blueprint for collaborating effectively on our shared codebase.

---

## Table of Contents

1. [Collaboration Etiquette & Community Norms](#collaboration-etiquette--community-norms)
2. [First-Time Contributor Walkthrough: Your First PR in 5 Minutes](#first-time-contributor-walkthrough-your-first-pr-in-5-minutes)
3. [Git Workflow: Step-by-Step](#git-workflow-step-by-step)
   - [Forks, Origin, and Upstream](#forks-origin-and-upstream)
   - [Keeping Your Fork Synchronized](#keeping-your-fork-synchronized)
   - [Branching Strategy](#branching-strategy)
   - [Pushing and Opening a PR](#pushing-and-opening-a-pr)
   - [How to Update an Open Pull Request](#how-to-update-an-open-pull-request)
   - [Resolving Merge Conflicts](#resolving-merge-conflicts)
   - [Post-Merge Clean Up](#post-merge-clean-up)
4. [Branch Naming Conventions](#branch-naming-conventions)
5. [Commit Guidelines (Conventional Commits)](#commit-guidelines-conventional-commits)
6. [Pull Request Best Practices](#pull-request-best-practices)
7. [Code Quality & Security Standards](#code-quality--security-standards)
8. [Definition of Done](#definition-of-done)
9. [Frequently Asked Questions for Beginners](#frequently-asked-questions-for-beginners)

---

## Collaboration Etiquette & Community Norms

We cultivate an open, supportive, and ego-free engineering culture:

- **Welcome First-Time Contributors**: Many club members will be learning Git and team development for the first time. Be patient, encouraging, and helpful.
- **Communicate Early**: Before starting substantial work or redesigning an architecture, open an issue or share an entry in [ideas/idea-dump.md](ideas/idea-dump.md) to avoid redundant effort.
- **Constructive Code Reviews**: Reviewers focus on code quality, correctness, and clarity rather than personal preference. Critique the code, not the person. Authors should view review feedback as collaborative improvement.
- **Explain "Why"**: Document architectural decisions, non-obvious regexes, and complex algorithms with clear code comments and commit descriptions.

---

## First-Time Contributor Walkthrough: Your First PR in 5 Minutes

If you have never submitted a Pull Request before, follow this exact tutorial to add your first idea or comment to [`ideas/idea-dump.md`](ideas/idea-dump.md). You can complete this entire process in under 5 minutes without needing any personal assistance!

> [!NOTE]
> In the commands below, replace `your-username` with your real GitHub username and `org-name` with the organization name. Do not type the `<` or `>` characters.

### Step 1: Fork the Central Repository
1. In your web browser, open the central repository on GitHub (`https://github.com/<org-name>/tech-and-data`).
2. Look at the top-right corner of the page and click the **Fork** button.
3. On the next screen, keep the default repository name (`tech-and-data`) and click the green **Create fork** button.
4. You now have your own independent copy of the repository under your personal GitHub profile (`https://github.com/<your-username>/tech-and-data`).

### Step 2: Clone Your Fork to Your Computer
1. On your newly created fork page on GitHub, click the green **`< > Code`** button and copy the HTTPS URL shown.
2. Open your terminal (e.g., PowerShell or Command Prompt on Windows, Terminal on macOS, or the terminal inside your code editor by pressing `Ctrl + \`` or `Cmd + \``).
3. Clone your fork and enter the directory:
   ```bash
   git clone https://github.com/<your-username>/tech-and-data.git
   cd tech-and-data
   ```

### Step 3: Link the Central Repository as `upstream`
To ensure you can receive updates made by teammates in the future, connect the central repository:
```bash
git remote add upstream https://github.com/<org-name>/tech-and-data.git
git remote -v
```
*(You will see `origin` pointing to your fork and `upstream` pointing to the central club repository).*

### Step 4: Create a New Branch
Never make edits directly on the `main` branch. Create and switch to a dedicated branch:
```bash
git checkout -b docs/add-my-first-idea
```

### Step 5: Make Your Change in Your Editor
1. Open the `tech-and-data` folder in your code editor (e.g., VS Code, Antigravity).
2. Open the file [`ideas/idea-dump.md`](ideas/idea-dump.md).
3. Scroll down to the `## New Ideas` section.
4. Add your idea using the lightweight template:
   ```markdown
   ### Mobile Quiz Timer Display

   - **Contributor**: @your-username
   - **Date**: 2026-10-25
   - **Target Project / Area**: website / buzzer
   - **Description**: A synchronized countdown timer that displays remaining question time on mobile phones and overhead projectors.
   - **Problem or Opportunity**: Quizmasters often have to verbally call out remaining seconds during timed rounds.
   - **Possible Implementation**: Simple client-side timer synchronized with the master screen.
   - **Additional Notes**: Open to pairing with anyone interested in UI styling!
   ```
5. Save the file (`Ctrl + S` or `Cmd + S`).

### Step 6: Verify and Stage Your Changes
Return to your terminal and check what changed:
```bash
# Check modified files
git status

# Inspect the exact lines you added
git diff

# Stage the file for commit
git add ideas/idea-dump.md
```

### Step 7: Commit Your Changes
Make a commit using Conventional Commits formatting:
```bash
git commit -m "docs(ideas): propose mobile quiz timer display"
```

### Step 8: Push Your Branch to Your Fork
Upload your branch to GitHub:
```bash
git push -u origin docs/add-my-first-idea
```

### Step 9: Open the Pull Request on GitHub
1. Open your web browser and visit the central repository (`https://github.com/<org-name>/tech-and-data`).
2. You will see a yellow banner at the top with a green button that says **Compare & pull request**. Click it!
   - *If you don't see the banner*: Click the **Pull requests** tab, click the green **New pull request** button, click the small link **compare across forks**, select your fork as `head repository`, and choose `docs/add-my-first-idea` as `compare`.
3. Give your pull request a clear title: `docs(ideas): propose mobile quiz timer display`.
4. The pull request template will automatically populate the description box. Fill in the brief sections (Summary, Type of Change, Checklist).
5. Click the green **Create pull request** button.

🎉 **Congratulations! You have officially submitted your first Pull Request!** A maintainer will review your change and merge it into `main`.

---

## Git Workflow: Step-by-Step

We use the standard **Fork-and-Pull-Request** workflow to keep the central `main` branch protected, stable, and production-ready.

```text
[Upstream (Central Repository)]
       │ (Fork)
       ▼
[Origin (Your GitHub Fork)]
       │ (git clone)
       ▼
[Local Machine] ──(git checkout -b feat/...)──> [Feature Branch]
                                                        │ (develop & commit)
                                                        ▼
[Origin (Your Fork)] <──────(git push)──────────────────┘
       │
       ▼ (Open Pull Request)
[Upstream (Code Review & Merge to main)]
```

### Forks, Origin, and Upstream

- **`upstream`**: The central repository owned by the Quizzing Club (e.g., `https://github.com/<org-name>/tech-and-data.git`).
- **`origin`**: Your personal GitHub copy (fork) of the repository (e.g., `https://github.com/<your-username>/tech-and-data.git`).
- **Local clone**: The repository files on your physical computer.

#### 1. Fork and Clone

1. Navigate to the central repository on GitHub and click the **Fork** button (top-right) to create a copy under your account.
2. Clone your fork to your local machine:
   ```bash
   git clone https://github.com/<your-username>/tech-and-data.git
   cd tech-and-data
   ```
3. Link the central repository as `upstream`:
   ```bash
   git remote add upstream https://github.com/<org-name>/tech-and-data.git
   ```
4. Verify your remote configuration:
   ```bash
   git remote -v
   ```
   *Expected output:*
   ```text
   origin    https://github.com/<your-username>/tech-and-data.git (fetch)
   origin    https://github.com/<your-username>/tech-and-data.git (push)
   upstream  https://github.com/<org-name>/tech-and-data.git (fetch)
   upstream  https://github.com/<org-name>/tech-and-data.git (push)
   ```

---

### Keeping Your Fork Synchronized

Always update your local `main` branch against `upstream/main` before creating new branches:

```bash
# Fetch latest updates from upstream
git fetch upstream

# Switch to your local main branch
git checkout main

# Merge upstream changes into your local main
git merge upstream/main

# Update your remote fork on GitHub
git push origin main
```

*(Alternatively, use `git pull upstream main` while on the `main` branch).*

---

### Branching Strategy

**Never commit directly to `main`.** Always create an isolated feature or fix branch for each discrete task:

```bash
# Ensure you are starting from an up-to-date main
git checkout main
git pull upstream main

# Create and switch to a new branch
git checkout -b <type>/<short-description>
```

---

### Pushing and Opening a PR

1. Stage your changes and commit using Conventional Commits:
   ```bash
   git add <files>
   git commit -m "feat(website): add mobile menu drawer"
   ```
2. Push your feature branch to your fork (`origin`):
   ```bash
   git push -u origin <type>/<short-description>
   ```
3. Visit the central repository on GitHub. You will see a banner prompting you to **Compare & pull request**.
4. Fill out the pull request template completely, referencing any related issues.
5. If your work is still ongoing, choose **Create draft pull request** to signal that it is not yet ready for final review.

---

### How to Update an Open Pull Request

If a maintainer reviews your PR and requests changes, or if you spot a typo yourself:

> [!IMPORTANT]
> **Do NOT close your pull request and open a new one!** You can update your existing PR directly by pushing new commits to the same branch.

1. Open the project in your editor and make the requested corrections.
2. Stage and commit your changes:
   ```bash
   git add <modified-files>
   git commit -m "fix(website): adjust button padding per review"
   ```
3. Push to your branch on your fork:
   ```bash
   git push origin <your-branch-name>
   ```
4. GitHub will automatically detect the new commits and update your open Pull Request. The reviewers will be notified automatically.

---

### Resolving Merge Conflicts

If upstream changes conflict with your feature branch:

1. Fetch the latest changes:
   ```bash
   git fetch upstream
   ```
2. Rebase or merge upstream `main` into your feature branch:
   ```bash
   git checkout <your-branch-name>
   git merge upstream/main
   ```
3. Open conflicting files in your editor, locate the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), resolve differences, and save.
4. Stage the resolved files and finish the merge:
   ```bash
   git add <resolved-files>
   git commit -m "chore: resolve merge conflicts with upstream main"
   ```
5. Push the updated branch back to your fork:
   ```bash
   git push origin <your-branch-name>
   ```

---

### Post-Merge Clean Up

Once your pull request has been merged into `upstream/main`:

```bash
# Switch back to local main and pull merged updates
git checkout main
git pull upstream main

# Delete your local feature branch
git branch -d <your-branch-name>

# (Optional) Delete the branch on your remote fork
git push origin --delete <your-branch-name>
```

---

## Branch Naming Conventions

All branch names must use **lowercase kebab-case** and follow this pattern:

```text
<type>/<short-description>
```
or with an issue number:
```text
<type>/<issue-number>-<short-description>
```

### Supported Branch Types

| Branch Type | When to Use | Examples |
|---|---|---|
| `feat/` | New features, tools, or user-facing functionality | `feat/website-navigation`, `feat/42-live-scoreboard` |
| `fix/` | Bug fixes or resolving incorrect behavior | `fix/buzzer-input-validation`, `fix/broken-css-links` |
| `docs/` | Documentation improvements, README updates, ideas | `docs/update-idea-dump`, `docs/contributing-clarification` |
| `refactor/` | Code structure improvements without behavioral change | `refactor/cleanup-state-store`, `refactor/modularize-buzzer` |
| `test/` | Adding test suites, mock data, or test fixes | `test/add-buzzer-unit-tests`, `test/e2e-quiz-flow` |
| `chore/` | Tooling, dependencies, repository scaffolding, gitignore | `chore/update-dependencies`, `chore/reorganize-project-files` |
| `experiment/` | Unvetted prototypes, exploratory spikes, or sandbox code | `experiment/web-bluetooth-buzzer`, `experiment/wasm-scoring` |

---

## Commit Guidelines (Conventional Commits)

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard. Consistent commit messages ensure our changelogs and git histories remain clear, readable, and searchable.

### Commit Format

```text
<type>(<optional-scope>): <description>

[optional body explaining 'why' and context]

[optional footer(s) for breaking changes or issue links]
```

### Conventional Commit Types

| Type | Meaning |
|---|---|
| `feat` | New feature or functional enhancement |
| `fix` | Bug fix |
| `docs` | Documentation-only changes (README, CONTRIBUTING, ideas) |
| `refactor` | Code restructuring without behavioral alterations |
| `test` | Adding or modifying tests |
| `chore` | Maintenance tasks, repository tooling, configuration |
| `style` | Formatting, missing semi-colons, whitespace changes |
| `perf` | Code changes that improve performance or responsiveness |
| `build` | Changes to build systems, packaging, or external tooling |
| `ci` | Changes to CI configuration files and scripts |

### Realistic Commit Examples

- `feat(website): add responsive navigation bar`
- `fix(buzzer): handle invalid input on rapid presses`
- `docs(ideas): add real-time scoreboard proposal`
- `refactor(website): simplify component directory structure`
- `chore: initialize repository structure and documentation`
- `docs: update contribution guidelines for forks`
- `test(buzzer): add unit tests for timing synchronization`

### Commit Rules & Best Practices

1. **Lowercase Types**: Always use lowercase for the type (`feat`, not `Feat` or `FEAT`).
2. **Imperative Mood**: Write the subject in imperative present tense ("add", "fix", "implement"), not past tense ("added", "fixed").
3. **No Trailing Period**: Do not end the subject line with a period (`.`).
4. **Subject Length**: Keep the subject concise, ideally within **72 characters**.
5. **Clarifying Scope**: Use an optional scope when modifying a specific sub-project (e.g., `(website)`, `(buzzer)`, `(ideas)`).
6. **Detailed Body**: Use the commit body (separated by a blank line) to explain *why* a non-obvious change was made.
7. **Breaking Changes**: For breaking API or interface changes, append a `!` after the type/scope and include `BREAKING CHANGE: <explanation>` in the footer:
   ```text
   feat(buzzer)!: change websocket message format to JSON-RPC

   BREAKING CHANGE: client apps must now send structured JSON-RPC 2.0 payloads.
   ```
8. **Avoid Low-Context Messages**: Never commit generic messages such as `"updates"`, `"wip"`, `"fix stuff"`, or `"changes"`.

---

## Pull Request Best Practices

- **One Logical Concern**: Keep PRs focused. Do not combine unrelated bug fixes with new feature development.
- **Descriptive Title**: Use a clear Conventional Commit-styled title (e.g., `feat(buzzer): add reconnect fallback`).
- **Complete the PR Template**: Detail what changed, why, how to test, and paste screenshots for visual modifications.
- **Draft PRs for WIP**: If seeking early design feedback, mark the PR as a **Draft**.
- **Self-Review First**: Read through your own diff on GitHub before requesting review to catch stray console logs, temporary comments, or formatting issues.
- **Review Policy**: At least **one approving review** from another maintainer or contributor is required prior to merging. Do not merge your own PR without peer review unless authorized by explicit project governance.
- **Squash & Merge**: Maintainers prefer squash merges for feature branches to keep the `main` history clean and linear.

---

## Code Quality & Security Standards

- **Maintainability First**: Write clean, readable code with intuitive naming. Strive for self-documenting logic, accompanied by clear comments on complex heuristics.
- **Zero Secrets**: **Never commit sensitive data** (API keys, personal tokens, credentials, private certificates, or internal IPs). Use environment variables (`.env`) which are excluded via [`.gitignore`](.gitignore).
- **No Unvetted Dependencies**: Do not introduce heavy third-party npm packages or Python libraries without justification and team consensus.
- **Clean Diffs**: Verify that no unwanted OS metadata (`.DS_Store`, `Thumbs.db`) or build artifacts (`dist/`, `node_modules/`) are checked into source control.

---

## Definition of Done

Before submitting or approving a Pull Request for merge into `main`, verify the following checklist:

- [ ] **Functional Correctness**: All proposed changes work as expected and solve the stated problem.
- [ ] **Validation Completed**: The code has been manually tested or verified against test cases.
- [ ] **Documentation Current**: Project READMEs, inline code docstrings, and idea documents are updated.
- [ ] **Conventional Commits**: Commit messages follow the Conventional Commits specification.
- [ ] **No Secrets or Bloat**: No sensitive tokens, temporary files, or dependencies are included.
- [ ] **PR Description Complete**: The PR template is filled out, linked to corresponding issues, and includes testing notes.
- [ ] **Peer Approval**: At least one peer review has approved the PR and all conversation threads are resolved.

---

## Frequently Asked Questions for Beginners

### 1. Which terminal application should I use?
Any terminal works!
- **Windows**: Use PowerShell, Windows Terminal, or Git Bash.
- **macOS / Linux**: Use the built-in Terminal.
- **Inside VS Code or Cursor**: Press `Ctrl + \`` (Windows/Linux) or `Cmd + \`` (macOS) to open the integrated terminal directly within your workspace.

### 2. What do the `<...>` angle brackets in commands mean?
Angle brackets denote placeholders that you need to replace with your personal information:
- `<your-username>` ➔ e.g., `alex-smith`
- `<your-branch-name>` ➔ e.g., `docs/add-timer-idea`
- *Never type the literal `<` or `>` characters into your terminal.*

### 3. I get `fatal: not a git repository` when running git commands!
This almost always means your terminal is in the wrong directory. Run `pwd` (or `Get-Location` in PowerShell) to check your current folder. If you are not inside the repository, run `cd tech-and-data`.

### 4. I get `fatal: remote upstream already exists`!
This means you have already configured the upstream remote previously. Run `git remote -v` to confirm. If `upstream` is listed pointing to the central repo, you are good to go!

### 5. Can I edit files directly on the GitHub website?
For small markdown contributions (such as adding an idea to [`ideas/idea-dump.md`](ideas/idea-dump.md)), you can click the pencil icon on GitHub to edit directly in your browser. GitHub will automatically offer to fork the repository and open a pull request for you. However, learning the local terminal workflow (`git checkout -b`, `git commit`, `git push`) is highly recommended as you transition to writing software and building tools.

### 6. Who reviews my Pull Request?
Club maintainers and fellow Tech & Data vertical members review pull requests. If your PR has been open for a couple of days without review, feel free to mention a maintainer in the PR comments!

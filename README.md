# Tech & Data | Quizzing Club

Welcome to the **Tech & Data Vertical** collaborative workspace of the **Quizzing Club**!

This repository serves as our shared development hub for technological solutions that support club activities, streamline quiz operations, and improve the overall quizzing experience for **quizmasters, participants, and organizers**.

More than just a collection of code, this repository is a shared, student-friendly space for members to experiment, learn, propose creative ideas, build useful tools, and contribute to the club's long-term technical growth. Whether you are writing your first line of code or architecting complex systems, you have a place here.

---

## Table of Contents

- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Collaboration Philosophy](#collaboration-philosophy)
- [Contribution Pipeline](#contribution-pipeline)
- [Quick Contribution Guide](#quick-contribution-guide)
- [Where to Contribute](#where-to-contribute)
- [Questions & Communication](#questions--communication)
- [Maintainer Setup & Recommended Repository Settings](#maintainer-setup--recommended-repository-settings)

---

## Overview

The Tech & Data Vertical drives technical innovation, digital initiatives, and automation for the Quizzing Club. Our responsibilities include:

- **Supporting Live Quiz Operations**: Building and maintaining reliable systems (such as buzzers, scoreboards, and timers) used during live competitions.
- **Engaging Quizmasters & Participants**: Developing digital portals, archives, and tools that make hosting, discovering, and playing quizzes seamless and engaging.
- **Fostering Technical Growth**: Providing club members with real-world software engineering experience, open-source collaboration skills, and an encouraging sandbox for technical experimentation.

This monorepo brings together all our vertical's projects under a unified, beginner-friendly workflow so that any club member can contribute.

---

## Repository Structure

```text
tech-and-data/
├── website/                         # Web applications and club portals
│   └── README.md
├── ideas/                           # Brainstorming canvas & proposal incubator
│   └── idea-dump.md
├── buzzer/                          # Buzzer system workspace (specs & implementation)
│   └── README.md
├── .github/                         # GitHub automation and collaboration templates
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md            # Standard bug report template
│   │   ├── feature_request.md       # New feature proposal template
│   │   └── idea_proposal.md         # Idea and initiative proposal template
│   └── pull_request_template.md     # Pull request checklist & review template
├── README.md                        # Central repository guide
├── CONTRIBUTING.md                  # Comprehensive collaboration & git guidelines
├── .gitignore                       # Multi-stack git ignore patterns
└── .editorconfig                    # Cross-editor styling rules (UTF-8, LF, spacing)
```

### Directory Summary

- **[`website/`](website/README.md)**: Reserved for our website project and web applications. It is kept lightweight and unopinionated until requirements and framework choices are finalized.
- **[`ideas/`](ideas/idea-dump.md)**: A collaborative Markdown document (`idea-dump.md`) where anyone can propose experiments, feature ideas, and architectural notes.
- **[`buzzer/`](buzzer/README.md)**: Reserved for the Buzzer project workspace. Hardware, networking, or software specifications will be documented here as development commences.
- **[`.github/`](.github/)**: Issue and pull request templates to streamline bug reporting, feature requests, and peer reviews.

### Adding Future Projects

As new initiatives emerge (e.g., automated quiz scoring, data analytics on past quiz performance, Discord/Telegram quiz bots), create a new top-level directory containing a descriptive `README.md` and propose it via an [Idea Proposal](.github/ISSUE_TEMPLATE/idea_proposal.md).

---

## Getting Started

You do not need to be an experienced developer to contribute. Basic familiarity with Git and a willingness to learn is all that is required.

### Prerequisites

1. **Git**: Installed on your computer ([Download Git](https://git-scm.com/)).
   - If this is your first time using Git, configure your name and email in your terminal so your commits are linked to your GitHub account:
     ```bash
     git config --global user.name "Your Name"
     git config --global user.email "your-github-email@example.com"
     ```
2. **GitHub Account**: To fork the repository and open pull requests ([Sign up for GitHub](https://github.com/)).
3. **Code Editor / IDE**: Use whatever environment you feel comfortable with (e.g., Visual Studio Code, Cursor, JetBrains IDEs, or Neovim).
   - *Supported Environment*: **Google Antigravity** is fully supported as an agentic development environment, though contributors are free to use their preferred tools.

> [!TIP]
> **New to Open Source or Pull Requests?**  
> We have written a step-by-step tutorial specifically for your very first PR! Check out the [First-Time Contributor Walkthrough in CONTRIBUTING.md](CONTRIBUTING.md#first-time-contributor-walkthrough-your-first-pr-in-5-minutes) to submit an idea to our Idea Dump in under 5 minutes.
> 
> *Note on command examples*: Whenever you see angle brackets like `<your-username>` or `<your-branch-name>`, replace them with your actual values without typing the `<` or `>` characters.

---

## Collaboration Philosophy

To foster a productive and welcoming engineering vertical, we follow these core principles:

1. **Transparent & Collaborative**: Work in the open. Share progress early rather than waiting for a finished masterpiece.
2. **Small, Focused, and Reviewable**: Break large ideas into concise, digestible pull requests that are easy to test and review.
3. **Discussions & Feedback are Encouraged**: Honest questions and friendly code reviews make our codebase resilient and help everyone learn.
4. **Documentation is Part of Development**: Code and documentation evolve together. A feature is not complete until its documentation reflects how it works.
5. **Experiments are Welcome**: Half-baked ideas and exploratory prototypes are celebrated—use [`ideas/idea-dump.md`](ideas/idea-dump.md) as your playground.
6. **Communicate Architectural Shifts**: Before introducing heavy frameworks, major database dependencies, or redesigning systems, talk with the team via GitHub Issues.

---

## Contribution Pipeline

All code changes move through a structured 9-stage pipeline:

```text
1. Propose ──> 2. Fork ──> 3. Clone & Config ──> 4. Branch ──> 5. Develop
                                                                     │
6. Commit <── 7. Push & Open PR <── 8. Code Review <── 9. Merge <───┘
```

### 1. Propose
- Share rough concepts in [`ideas/idea-dump.md`](ideas/idea-dump.md) or open a GitHub Issue using our templates.
- Discuss substantial changes prior to writing code.
- Coordinate or comment on an issue to claim a task, avoiding duplicate effort.

### 2. Fork
- Fork the central repository to your personal GitHub profile.
- Forking provides an isolated sandbox where you can experiment without affecting the primary repository.

### 3. Clone and Configure
Clone your fork locally and configure the central repository as the `upstream` remote:

```bash
# Clone your fork
git clone https://github.com/<your-username>/tech-and-data.git
cd tech-and-data

# Set the central repository as upstream
git remote add upstream https://github.com/<org-name>/tech-and-data.git

# Verify remotes
git remote -v
```

### 4. Create a Branch
- Never commit directly to `main`.
- Create a dedicated branch off `main` for each task using standardized names:
  - `feat/website-navigation`
  - `fix/buzzer-input-validation`
  - `docs/update-idea-dump`
  - `chore/reorganize-project-files`
  - `feat/42-website-navigation` (with issue number)

```bash
git checkout main
git pull upstream main
git checkout -b feat/your-feature-name
```

### 5. Develop
- Keep your changes focused strictly on the goal of your branch.
- Follow existing project styles and formatting rules.
- Test your modifications locally to ensure nothing breaks.
- Update relevant documentation alongside code changes.

### 6. Commit
- Craft atomic, meaningful commits using [Conventional Commits](https://www.conventionalcommits.org/):
  - Format: `<type>(<optional-scope>): <description>`
  - Examples: `feat(website): add mobile drawer`, `fix(buzzer): debounce button presses`
  - For comprehensive rules, see [CONTRIBUTING.md](CONTRIBUTING.md#commit-guidelines-conventional-commits).

### 7. Push and Open a Pull Request
- Push your branch to your fork:
  ```bash
  git push -u origin feat/your-feature-name
  ```
- Go to the central repository on GitHub and open a Pull Request targeting `main`.
- Fill out the PR template completely with summaries, rationale, testing details, and screenshots if applicable.
- Use **Draft PRs** for in-progress work where you would like early feedback.

### 8. Code Review
- Every PR requires review and approval from at least one other team member.
- Reviews evaluate correctness, code clarity, maintainability, and documentation.
- Maintain a constructive, friendly dialogue during review discussions.

### 9. Merge
- Once approved and status checks pass, maintainers merge using **Squash and Merge** to maintain a clean git history.
- Delete your feature branch after merging to keep the repository tidy.
- The `main` branch is always kept stable and deployable.

### Syncing Your Fork with Upstream

To keep your local and remote fork up to date with the latest changes on `upstream/main`:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## Quick Contribution Guide

Here is the quick sequence of commands for a typical contribution workflow:

```bash
# 1. Update your local main branch from upstream
git checkout main
git fetch upstream
git merge upstream/main

# 2. Create a new feature branch
git checkout -b feat/buzzer-sound-effects

# 3. Work on changes, test them, then stage and commit
git add buzzer/
git commit -m "feat(buzzer): add buzzer sound effect triggers"

# 4. Push your branch to your personal fork (origin)
git push -u origin feat/buzzer-sound-effects

# 5. Open a Pull Request on GitHub against upstream:main!
```

---

## Where to Contribute

Looking for ways to get involved? Here are the primary areas:

- **[Website](website/README.md)**: Help design user interfaces, quiz portals, leaderboards, and club information pages.
- **[Idea Dump](ideas/idea-dump.md)**: Add suggestions, read what others have proposed, or participate in discussions on active ideas.
- **[Buzzer](buzzer/README.md)**: Collaborate on technical design, low-latency protocols, or client interfaces for the club buzzer system.
- **Documentation & Infrastructure**: Improve guides, create onboarding tutorials, add issue templates, or refine [`.gitignore`](.gitignore) and [`.editorconfig`](.editorconfig).

---

## Questions & Communication

- **Work-Related Discussions**: Use [GitHub Issues](https://github.com/<org-name>/tech-and-data/issues) to propose changes, report bugs, or coordinate work.
- **Code Feedback**: Use [Pull Request Discussions](https://github.com/<org-name>/tech-and-data/pulls) for reviews and code-level questions.
- **Idea Brainstorming**: Use [`ideas/idea-dump.md`](ideas/idea-dump.md) for lightweight, early-stage project ideas.

---

## Maintainer Setup & Recommended Repository Settings

> [!NOTE]
> The following items are administrative settings configured on the **GitHub web interface** under **Settings**, not file-based configurations within Git. Maintainers should configure these once the repository is published to GitHub.

To maintain repository health, branch stability, and a reliable contribution flow, maintainers are strongly encouraged to configure the following settings on GitHub:

1. **Default Branch**:
   - Ensure `main` is designated as the default branch (**Settings > General > Default branch**).
2. **Branch Protection Rules / Rulesets**:
   - Navigate to **Settings > Rules > Rulesets** (or **Branches > Branch protection rules**) and create a rule targeting `main`:
     - **Require a pull request before merging**: Enforces that all code enters `main` via PRs.
     - **Require approvals**: Set to at least **1 approving review**.
     - **Dismiss stale pull request approvals when new commits are pushed**: Ensures reviews reflect the latest code.
     - **Require conversation resolution before merging**: All review comments and discussions must be resolved.
     - **Require status checks to pass before merging**: Enable once CI or automated test workflows are implemented.
     - **Block force pushes**: Prohibit `git push --force` on `main`.
     - **Block branch deletions**: Prevent accidental deletion of `main`.
3. **Pull Request Merge Settings**:
   - Under **Settings > General > Pull Requests**:
     - **Allow Squash merging**: Checked (recommended as the default to produce clean single-commit merges per PR).
     - **Automatically delete head branches**: Checked (cleans up branches upon merge to avoid repository clutter).
4. **Features & Discussions**:
   - Ensure **Issues** is checked under repository features so contributors can file bug reports, feature requests, and idea proposals.

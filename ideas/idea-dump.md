# Idea Dump & Brainstorming Board

Welcome to the **Tech & Data Idea Dump**! This is our open, collaborative brainstorming canvas for the **Quizzing Club**.

---

## Welcome & Philosophy

This document is a shared space where any club member can propose:
- **Technical initiatives**: New platforms, digital club archives, or infrastructure.
- **New quizzing tools**: Buzzer interfaces, scoreboards, timer displays, or question generators.
- **Improvements to existing systems**: Enhancing stability, reducing latency, or simplifying setup.
- **Creative quiz formats**: Grid quizzes, bounce-and-pounce digital systems, audio/visual quiz round tooling.
- **Automation opportunities**: Automating score calculation, sheet generation, or participant registration.
- **Experimental projects**: Hardware tinkering, data science on question patterns, or bot integrations.

**You do not need a fully fleshed-out design doc or production-ready code to share an idea here.** Whether you've noticed a recurring friction point during club quizzes, thought of an exciting new tech stack to experiment with, or simply want to suggest a small enhancement, your input is welcome.

- **No idea is too raw**: Rough notes, single-sentence proposals, and napkin sketches are all valid starting points.
- **Collaborative refinement**: Team members are encouraged to leave comments, discuss potential solutions, or pair up to build prototypes.
- **Easy to contribute**: Simply submit a Pull Request adding your entry using the template below.

---

## How an Idea Evolves

We follow a progressive lifecycle from rough concept to merged implementation:

```text
[Idea Dump Entry] 
       ↓ 
[Team Discussion & Feedback] 
       ↓ 
[Formal GitHub Issue / Feature Request] 
       ↓ 
[Project / Feature Implementation via PR]
```

1. **Record**: Add your idea to the [New Ideas](#new-ideas) section by opening a Pull Request.
2. **Discuss**: Club members review the PR or discuss the idea during vertical syncs.
3. **Graduate to an Issue**: Once an idea gains interest and consensus, create a formal [Idea Proposal](../.github/ISSUE_TEMPLATE/idea_proposal.md) or [Feature Request](../.github/ISSUE_TEMPLATE/feature_request.md) on GitHub to track actionable tasks.
4. **Build**: Contributors claim tasks, build features in dedicated branches, and merge code following our [Contribution Guidelines](../CONTRIBUTING.md).

---

## Idea Template

When adding a new entry, copy and paste this markdown snippet at the bottom of the [New Ideas](#new-ideas) section:

```markdown
### [Idea Title]

- **Contributor**: @your-github-username (or Name)
- **Date**: YYYY-MM-DD
- **Target Project / Area**: (e.g., website, buzzer, data-analysis, tooling)
- **Description**: A short summary of what you are proposing.
- **Problem or Opportunity**: What challenge does this address, or what new capability does this unlock for the club?
- **Possible Implementation**: How might we build or test this? (Optional: mention languages, frameworks, or tools).
- **Additional Notes**: References, links, inspirations, or open questions.
```

---

## Ideas Under Discussion

*Ideas that have received initial interest and are actively being debated, clarified, or architected.*

### Real-Time Live Quiz Scoreboard

- **Contributor**: @core-maintainer
- **Date**: 2026-10-25
- **Target Project / Area**: website / buzzer
- **Description**: A synchronized public screen showing live scores, team standings, and round transitions during offline and online quizzes.
- **Problem or Opportunity**: Scorekeeping during multi-round quizzes is often manual or tracked in spreadsheets, making it hard for audiences and teams to see dynamic standing changes.
- **Possible Implementation**: Web-based frontend with a lightweight WebSocket or server-sent events (SSE) backend to push score updates to display monitors in real time.
- **Additional Notes**: Needs to be easily operable by a non-technical scorekeeper while remaining crash-resilient.

---

## New Ideas

*Freshly submitted ideas awaiting initial discussion and feedback. Add yours below!*

### Question Bank & Tagged Quiz Archive

- **Contributor**: @community-contributor
- **Date**: 2026-10-25
- **Target Project / Area**: website / data-analysis
- **Description**: A searchable archive of past quiz questions categorized by genre (History, Sci-Tech, Pop Culture, Sports, etc.), difficulty, and tournament year.
- **Problem or Opportunity**: The club has accumulated hundreds of questions across past seasons that are currently scattered across slide decks and docs.
- **Possible Implementation**: Static search indexing or a lightweight database with Markdown/JSON source files for easy community contributions.
- **Additional Notes**: Could enable automated practice rounds for new quiz club recruits.

---

## Ideas Being Developed

*Ideas that have transitioned into active GitHub issues or development branches.*

*(Currently none — pick an idea from above or propose a new one to get started!)*

---

## Archived / Implemented Ideas

*Ideas that have been completed or retired after review.*

*(None yet)*

# PRD Generator Skill

Generate a comprehensive Product Requirements Document (PRD) through structured AI conversation. Works with Claude Code, Codex, OpenCode, and Hermes Agent.

## Quick Start

1. **Install the skill**:
   ```bash
   # For Hermes Agent
   hermes skills add /path/to/prd-generator
   
   # For Claude Code
   cp -r prd-generator ~/.claude/skills/
   
   # For Codex
   cp -r prd-generator ~/.codex/skills/
   
   # For OpenCode
   cp -r prd-generator ~/.opencode/skills/
   ```

2. **Use the skill**:
   ```
   User: "Generate a PRD for my expense tracking app"
   Agent: [loads skill] → starts interview → generates PRD
   ```

## How It Works

### 1. Interview Phase
The skill asks one question at a time to gather requirements:
- Project name and description
- Target users
- Problem statement
- Core features (prioritized)
- Technical constraints
- Success metrics
- Timeline

### 2. Generation Phase
Creates a comprehensive PRD with:
- Project overview
- Problem statement
- Target users
- Features (prioritized)
- User stories
- Acceptance criteria
- Technical requirements
- Success metrics
- Timeline & milestones
- Risks & mitigation

### 3. Export Phase
Formats PRD for target tools:
- Markdown document
- Cursor rules (.cursorrules)
- Claude system prompt
- OpenCode prompt
- Task list (JSON)
- Roadmap (Mermaid)

### 4. Revision Phase
Allows user to request changes:
- Revise specific sections
- Add/remove features
- Update requirements

## Features

- **Structured Interview**: One question at a time, never overwhelming
- **Comprehensive PRD**: All sections needed for implementation
- **Multi-Format Export**: Works with Cursor, Claude, OpenCode, etc.
- **Revision Support**: Easy to update and iterate
- **Task Breakdown**: Export tasks with estimates and dependencies
- **Roadmap Generation**: Visual timeline with Mermaid

## Example Usage

```
User: "Generate a PRD for my app"
Agent: "Let's create your PRD! What's the name of your project?"
User: "ExpenseTracker Pro"
Agent: "Great name! Can you describe what ExpenseTracker Pro does?"
User: "A mobile app that helps freelancers track expenses and generate invoices."
Agent: "Perfect! Who are the primary users?"
...
Agent: "PRD generated! Here's your complete PRD:"
[PRD displayed]
Agent: "Export as Cursor rules? (y/n)"
```

## Customization

Edit prompts in `prompts/` directory to customize:
- `interview.md` — Change questions or flow
- `generate.md` — Modify PRD structure
- `revise.md` — Adjust revision handling
- `export.md` — Add new export formats

Edit templates in `templates/` directory:
- `prd-structure.md` — Modify PRD template
- `export-formats.md` — Add new export formats

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with multiple AI agents
5. Submit a pull request

## License

MIT License — feel free to use and modify.

## Support

- GitHub Issues: [repo-url]/issues
- Discord: [discord-invite]
- Email: [your-email]

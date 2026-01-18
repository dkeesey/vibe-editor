#!/bin/bash
# Start vibe-editor with secrets loaded

# Load secrets if available
if [ -f ~/.claude/secrets.env ]; then
  source ~/.claude/secrets.env
fi

# Start dev server
npm run dev

#!/bin/bash

# Wrapper script to generate Twitter marketing posts and export to Excel
# Automatically loads environment variables from .env.local

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables from .env.local
if [ -f "$PROJECT_ROOT/.env.local" ]; then
  export OPENROUTER_API_KEY=$(grep OPENROUTER_API_KEY "$PROJECT_ROOT/.env.local" | cut -d= -f2)
  echo "✓ Loaded OPENROUTER_API_KEY from .env.local"
fi

# Check if OPENROUTER_API_KEY is set
if [ -z "$OPENROUTER_API_KEY" ]; then
  echo "❌ Error: OPENROUTER_API_KEY not found in .env.local"
  exit 1
fi

# Run the npm script
cd "$PROJECT_ROOT"
npm run agent:twitter-marketing:excel

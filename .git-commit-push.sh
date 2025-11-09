#!/bin/bash

cd /Users/sh0ckpro/Works/Freelance/React/nktc-app

echo "=== Git Status ==="
git status

echo ""
echo "=== Adding all changes ==="
git add -A

echo ""
echo "=== Staged files ==="
git status --short

echo ""
echo "=== Committing changes ==="
git commit -m "fix: security improvements and remove unused dependencies

- Fix CORS origin validation vulnerability (domain hijacking prevention)
- Remove hard-coded values in CORS configuration (use environment variables)
- Fix backend password hashing issues (teachers.service.ts, users.service.ts)
- Remove bcryptjs from frontend (security risk - password hashing should be server-side)
- Remove unused dependencies from frontend (~9 packages)
- Remove duplicate date-fns-buddhist-adapter
- Update environment setup documentation"

echo ""
echo "=== Pushing to remote ==="
git push

echo ""
echo "=== Done ==="


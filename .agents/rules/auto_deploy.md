# Automatic Deployment Rule

Whenever changes or features are implemented and `npm run build` (or test/build verification) passes:
- Automatically stage and commit the changes if not already committed.
- Always execute `git push origin main` so that changes deploy directly to the live website without waiting for a manual prompt.

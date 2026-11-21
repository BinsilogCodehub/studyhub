# StudyHub

StudyHub is a student workspace for organizing subjects, assignments, and reminders.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The App Router pages are:

- `/dashboard`
- `/subjects`
- `/assignments`
- `/reminders`
- `/settings`

## Data storage

Subjects, assignments, and reminders are saved in the current browser's localStorage. Data is
available after refresh in that browser, but is not synchronized to other devices or backed up.
The Settings page explains the storage status and provides a confirmed reset action.

## Validation

```bash
npm run lint
npm run build
```

# Engines

Domain helpers extracted from services:

| Path | Role |
| --- | --- |
| `lesson/` | Question payload shaping + answer grading |
| `progression/` | Streak activity + freeze award/consume |
| `srs/` | (scheduling still in `@walky-talky/shared` + `services/srs.ts`) |

Services orchestrate transactions; engines stay side-effect light where possible.

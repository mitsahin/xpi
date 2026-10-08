# Controllers

Request/response shaping layer between `routes/` and `services/`.

Phase 1 mounts thin Express routers that call `services/*` directly. Extract handlers here when routes grow (new question types, admin, webhooks).

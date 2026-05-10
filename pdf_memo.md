# PDF Generation Rules

## Rendering Constraints
- Only draw walls, windows, and doors that enclose defined floor areas.
- Do not draw lines or symbols outside of floor-enclosed spaces.

## Dimension Logic
- For each enclosed room/area:
  - Automatically calculate the width (in current BitUnit) and height (in current BitUnit).
  - Place the dimensions text in the center of the enclosed area.
  - Dimensions should follow the format: `[Width] x [Height]`.

# Testing and validation

## Automated checks

Run `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, and `pnpm test`. Unit coverage includes unit conversion, bounding-box overlap, outside-room detection, door sweep, combined warnings, measured specification generation, product hard filters including sponsored rejection, placement footprints, and versioned save/load. The rendered-page check proves the production worker serves the finished entry page without starter markers.

## Manual end-to-end script

1. Open the landing page at 1440×900 and choose **เริ่มออกแบบห้อง**.
2. Create a 4 × 5 × 2.6 m room with a 30,000 THB budget.
3. Add a sofa and table; orbit, zoom, pan, and switch Top/Preview views.
4. Drag the table onto the sofa and confirm the red outline and collision message.
5. Confirm the FBX object stays under the pointer while dragging; move it away, drag another object into the door zone, and confirm the door warning.
6. Use the right-panel 90° controls and confirm the selected model turns exactly a quarter turn without changing position.
7. Rotate with Q/E and the mobile rotation controls; test duplicate, lock, delete, undo, and redo.
8. Save and confirm the warning badge/status.
9. Generate the specification and verify dimensions reflect the room/placement.
10. Open recommendations; confirm every visible product fits the active maximum dimensions. Toggle the budget filter.
11. Confirm sponsored labels are visible and no oversized sponsored product appears.
12. Favorite and compare products, then open a merchant URL and verify an outbound click is stored.
13. Reload, open Projects, and reopen the saved project.
14. Repeat visual/touch checks at 1280×720, 768×1024, and 390×844. Ensure no canvas overflow, side panels become bottom sheets, major controls remain above the browser bar, and no primary action requires hover.

## Prototype validation checklist

- [ ] Participant understands the promise without facilitator explanation.
- [ ] Participant creates a room with valid dimensions.
- [ ] Participant discovers orbit, zoom, pan, and camera presets.
- [ ] Participant adds, drags, rotates, duplicates, locks, and removes an object.
- [ ] Participant understands collision and door warnings.
- [ ] Participant recognizes walkway distance as an adjustable recommendation.
- [ ] Participant can save and reopen a project after reload.
- [ ] Participant understands how a measured requirement was calculated.
- [ ] Participant recognizes sponsored products and trusts that fit is checked first.
- [ ] Participant understands that opening a store link is not a confirmed purchase.

## Scan error measurement template — five rooms

Do not fill this table with invented results. Measure each dimension independently with a trusted reference device.

| Room | Surface/opening | Reference (cm) | Scan (cm) | Absolute error (cm) | Error (%) | Device/OS | Lighting/notes |
|---|---|---:|---:|---:|---:|---|---|
| 1 |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |
| 4 |  |  |  |  |  |  |  |
| 5 |  |  |  |  |  |  |  |

## Usability survey template — 30 participants

Use a 1–5 scale for ease, confidence, warning clarity, specification clarity, recommendation trust, and purchase confidence. Add task completion, time on task, device, prior planning-tool experience, one strongest point, one confusion, and consented notes.

| Participant | Device | Task completed | Time | Ease | Confidence | Warning clarity | Spec clarity | Recommendation trust | Purchase confidence | Notes |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| P01 |  |  |  |  |  |  |  |  |  |  |
| P02 |  |  |  |  |  |  |  |  |  |  |
| P03–P30 | Duplicate this row for each real participant; do not synthesize responses. |  |  |  |  |  |  |  |  |  |

## Merchant letter of intent template

**Non-binding product data collaboration — Fursign**

Merchant: ______  Contact: ______  Date: ______

The merchant expresses non-binding interest in evaluating a Fursign pilot and, subject to a later definitive agreement, supplying accurate product identifiers, dimensions, prices, stock status, images, URLs, style tags, and update timestamps. Fursign will not alter hard fit results in exchange for sponsorship. Data ownership, update frequency, brand use, privacy, affiliate terms, support, service level, pilot duration, and termination remain to be negotiated. No purchase volume, conversion, exclusivity, accuracy, or revenue is promised by this template.

Authorized representative: ______  Signature: ______

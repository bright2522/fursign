# Integration plans and known limitations

## AR room scan plan

1. Define adapters for AR Foundation/ARCore, Apple RoomPlan, and manually measured JSON.
2. Convert every source to meters and the Fursign right-handed floor coordinate convention.
3. Preserve source confidence and raw measurements beside normalized walls/openings.
4. Reject unsupported `schemaVersion` values and show field-level import errors.
5. Add a calibration step with one known physical distance.
6. Validate with the five-room error template in `testing-and-validation.md` before presenting scan accuracy claims.

AR scanning is not implemented in this prototype. Room JSON import proves the boundary and validation flow only.

## Affiliate integration plan

The prototype records project, product, merchant, timestamp, source specification, and click ID before opening a merchant URL. An outbound click is not proof of purchase.

A real integration must add an affiliate redirect service, signed click identifiers, consent and retention rules, merchant/network postback or conversion API, idempotent conversion storage, and reconciliation. Coupon codes or merchant confirmation may be used where postback is unavailable.

## Product data source plan

Priority order:

1. curated mock data;
2. merchant form;
3. validated CSV feed;
4. affiliate feed or merchant API;
5. web scraping only with explicit permission.

Required CSV columns are `product_id, merchant_id, name, category, width_m, depth_m, height_m, price_thb, style_tags, color, image_url, product_url, stock_status, sponsored, updated_at`. Validate dimensions, currency, URLs, timestamps, category vocabulary, and duplicate identifiers before publishing.

## Known limitations

- The editor is now a WebGL/Three.js low-poly modeler with shadows and cutaway walls. It is intentionally not photorealistic and walk mode does not yet include first-person collision.
- Rotated collision uses an axis-aligned footprint; it is conservative for diagonal objects.
- Door clearance is represented as a rectangular sweep envelope, not an exact arc polygon.
- Walkway warnings are proximity recommendations chosen by the user, not legal or accessibility compliance claims.
- Room setup supports one configurable door and one optional window on any wall. Multiple openings are supported by the data contract and JSON import, but not yet by the setup form.
- Projects are device-local and have no account sync, collaboration, server backup, or conflict resolution.
- Product, merchant, stock, price, image, and sponsored data are mock data. URLs point to an example domain.
- The comparison action prepares a selection but does not yet render a full comparison table.
- The assistant is rule-based and only explains existing project data.
- Printable specification and JSON export are available; PDF generation is not included.

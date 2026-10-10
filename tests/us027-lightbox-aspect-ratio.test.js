const assert = require('assert')
const fs = require('fs')
const path = require('path')

const css = fs.readFileSync(path.join(__dirname, '../css/components.css'), 'utf8')
const app = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')
const lightboxMainRule = css.match(/\.lightbox-main\s*\{([^}]*)\}/s)
const lightboxTransform = app.match(
  /lightboxImageElement\.style\.transform\s*=\s*`([^`]*)`/
)

assert.ok(lightboxMainRule, 'Lightbox image sizing rule is missing')
assert.ok(lightboxTransform, 'Lightbox image transform is missing')

const declarations = Object.fromEntries(
  lightboxMainRule[1]
    .split(';')
    .map(declaration => declaration.trim())
    .filter(Boolean)
    .map(declaration => {
      const separator = declaration.indexOf(':')
      return [
        declaration.slice(0, separator).trim(),
        declaration.slice(separator + 1).trim()
      ]
    })
)

assert.strictEqual(declarations.width, 'auto')
assert.strictEqual(
  declarations.height,
  'auto',
  'Lightbox image height must follow the intrinsic image ratio'
)
assert.strictEqual(declarations['max-width'], '96vw')
assert.strictEqual(declarations['max-height'], '96vh')
assert.strictEqual(
  declarations['object-fit'],
  'contain',
  'Lightbox image must fit within the viewport without distortion'
)
assert.match(
  lightboxTransform[1],
  /scale\(\$\{lightboxScale\}\)/,
  'Zoom must apply one uniform scale to preserve the image ratio'
)
assert.doesNotMatch(
  lightboxTransform[1],
  /scale[XY]\(/,
  'Zoom must not scale the image axes independently'
)

console.log('US-027 lightbox aspect-ratio regression checks passed')

# exma-frui

Parses an exma schema to [FREE react UI](https://www.npmjs.com/package/frui).

## Install

```bash
yarn add -D exma-frui

... or ...

npm i --dev exma-frui
```

## Usage

In your `schema.exma` file add the following generator.

```js
plugin "exma-frui" {
  ui "tailwind"
  ts true
  output "./react"
  types "./types.ts"
}
```

Options
 - `ui` - `react` or `tailwind`
 - `ts` - whether to generate the typescript files or the final `*.d.ts`
 - `output` - folder where to generate the hooks and components
 - `types` - where the schema typescript typings are. see [exma-typescipt](https://www.npmjs.com/package/exma-typescript)

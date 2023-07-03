# exma-prisma

Parses an exma schema to a prisma schema

## Install

```bash
yarn add -D exma-prisma

... or ...

npm i --dev exma-prisma
```

## Usage

In your `schema.exma` file add the following generator.

```js
generator "exma-prisma" {
  generator { client { provider "prisma-client-js" } }
  db { provider "cockroachdb" url ["DATABASE_URL"] }
  output "./prisma.schema"
}
```
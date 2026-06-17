import { type FastCheck, pipe, Schema, type SchemaAST } from 'effect'

export type ArbitraryAnnotation = () => (
  fc: typeof FastCheck,
) => FastCheck.Arbitrary<unknown>

/*
 * A field's `.ast` is one of two shapes:
 *   - SchemaAST.AST — a plain value schema (e.g. `Schema.String`), used as-is.
 *   - PropertySignatureTransformation — a `fromKey`-renamed field, holding the
 *     value type (`to.type`) and the encoded key it reads from (`from.fromKey`).
 */
type FieldAst = SchemaAST.AST | Schema.PropertySignatureTransformation

/*
 * Add an `arbitrary` annotation to a field's *value* schema (it has no effect on
 * the `propertySignature`/`fromKey` wrapper). The field's type and key are kept,
 * so a schema's `fields` can be re-annotated without redeclaring them.
 */
export function withArbitrary<F>(field: F, arbitrary: ArbitraryAnnotation): F {
  const ast = (field as { readonly ast: FieldAst }).ast

  if (ast._tag === 'PropertySignatureTransformation') {
    const property = Schema.propertySignature(
      Schema.make(ast.to.type).annotations({ arbitrary }),
    )

    return (
      ast.from.fromKey === undefined
        ? property
        : pipe(property, Schema.fromKey(ast.from.fromKey))
    ) as unknown as F
  }

  return Schema.make(ast).annotations({ arbitrary }) as unknown as F
}

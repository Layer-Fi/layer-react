# Publishing This Module

The @layerfi/components module is [available on
NPM](https://www.npmjs.com/package/@layerfi/components).

NOTE: This module is available to and accessible by anyone in the world, even if
they do not have the credentials to access the LayerFi service itself. Please
make sure no access tokens or keys get put into it accidentally.

## Development

Developing on this module is possible via `npm link`. This assumes that the
demonstration app `demo` and the module `components` live in the same directory.

# Do not add the module to package.json of `demo`.
# `cd ../demo`
# `npm link ../components`
# `cd ../components`
# `npm install`
# `rm -rf node_modules/react node_modules/react-dom`
# `npm run build`
# `cd ../demo`
# Stop the server if it's currently running.
# `npm install`
# `npm start`

When making changes that you want to see appear in the app, you should only need
to run `npm run build`. You may need to refresh the browser page if the change
was more than just a little styling.

Making changes to the dependencies of the module requires that it be installed.
Start at Step 4 above (`cd ../components`).

## Production

The module is published with `npm publish`.

In order to see what will happen before publishing, use `npm publish --dry-run`.
This will show what the command will do, but will not actually publish the
module. You can use this output to check for oversights before publishing.
Similarly, you can run `npm pack` to build a local tarball of the package.

Running `npm publish`/`npm pack` in the module will put everything that is in
the directory into the module _except_ the files disallowed by `.npmignore`. All
that is necessary are the files in `dist` after being generated with `npm run
build`. Therefore, you must run `npm run build` before packing/publishing.
However, this should run automatically via the `prepack` script.

### Version Numbers

The version number must be incremented in order to be put on NPM. That is,
version numbers refer to a specific and unique set of code. Once a version
number is taken, it cannot be reused, even if that version is "unpublished".

In Semantic Versioning, the version numbers mean things: the version is split
into `Major.Minor.Patch` numbers. From [semver.org](https://semver.org/):

> Given a version number MAJOR.MINOR.PATCH, increment the:
>
> * MAJOR version when you make incompatible API changes
> * MINOR version when you add functionality in a backward compatible manner
> * PATCH version when you make backward compatible bug fixes
>
> Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

Versions with a Major version of 0 are allowed to basically do whatever they
want, as that is considered "prerelease".

NOTE: The `version` field of package.json must be incremented in at least one of these
numbers in order to publish a new version.

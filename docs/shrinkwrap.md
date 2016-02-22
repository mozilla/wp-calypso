Shrinkwrap
============
We use `npm shrinkwrap --dev` to lock down our dependency versions. This allows us to
freeze all dependencies at the exact version we have installed in our node_modules.

See: [shrinkwrap docs](https://docs.npmjs.com/cli/shrinkwrap)

## Modifying Dependencies

We use clingwrap to avoid creating huge diffs in npm-shrinkwrap.json. clingwrap also removes
`from` and `resolved` fields which is expected. If you happen to be pointing at a package
that is not published with npm, you may want to update the npm-shrinkwrap.json by hand.

- Install [clingwrap](https://github.com/goodeggs/clingwrap) globally: `npm install -g clingwrap`
- Update your desired package, e.g. `npm install lodash@4.0.0 --save`
- Clingwrap your updated package `clingwrap lodash`
- Verify that Calypso works as expected and that tests pass.
- Commit the updated package.json and npm-shrinkwrap.json

## Modifying Sub-Dependencies

Periodically, we'll want to bump sub-dependencies to pick up bugfixes. This may result
in a large diff that is too big to review. It's very important that your node_modules 
is deleted before you do this to be sure to pick up the latest versions.

- Run `make distclean` to delete local node_modules
- Delete your local copy of npm-shrinkwrap.json.
- Run `npm install`
- Verify that Calypso works as expected and that tests pass.
- Run `npm shrinkwrap --dev`
- Commit the new npm-shrinkwrap.json

## Testing

To verify that the new npm-shrinkwrap.json works:

- Run `make distclean` to delete local node_modules
- Run `npm install`
- Verify that Calypso works as expected and that tests pass.

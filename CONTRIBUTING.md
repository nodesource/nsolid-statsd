Contributing
================================================================================

Awesome!  We're happy that you want to contribute.

Make sure that you're read and understand the [Code of Conduct](CODE_OF_CONDUCT.md).


Building from source
--------------------------------------------------------------------------------

There are no special instructions to build this project, other than to
run `npm install` after cloning the repo, to get all the dependent packages
installed.

After making changes, you should run `npm test` to ensure all the tests
currently pass.  If you are adding or changing function, you should add tests
in either an existing test module or a new one.  The `test/index.js` file
is nothing but a bunch of `require()` invocations for the actual test files.

To run tests continuously whenever you change source files, you can use
the command `npm run watch`, which will use `nodemon` (installed as a
dev-dependency) to run the tests whenever a source file changes.

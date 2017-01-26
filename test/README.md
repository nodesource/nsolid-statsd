nsolid-statsd tests
================================================================================

unit tests
--------------------------------------------------------------------------------

from the project directory, run `npm test`, or from the test directory, run
`node index`


integration test with DataDog
--------------------------------------------------------------------------------

* Register for a [DataDog][] account, if you don't already have one.

* Install the [DataDog agent][] on the system you will be sending the N|Solid
  stats from.  You can you any accessible machine, but the typical case would
  be to use the same machine you're running the N|Solid apps on.

* Start the DataDog agent, ensure you are getting basic system level stats
  from it by poking around the [Infrastructure list][].  You should see
  CPU usage, Load Averages, etc - just from the DataDog agent (not coming in
  any way from N|Solid).

* Run the module test/apps/trees.js with `nsolid`, with it connecting to a
  running N|Solid storage server.

      nsolid test/apps/trees.js

  This will start a number of N|Solid instances with different app names and
  tags.  See the module for for complete details.  These modules don't do very
  much. You should ensure the expected apps come up in the N|Solid Console or
  are listed with `nsolid-cli ls`.

* Now run `nsolid-statsd`, which expects the statsd server address and the
  N|Solid Storage address as arguments.  The addresses should be host:port, but
  the default host is `localhost` and the default parts are 8125 (statsd) and
  4000 (N|Solid Storage).  To run with the default Datadog agent (which runs a
  statsd server at `localhost:8125`) and default N|Solid Storage (localhost:4000),
  start `nsolid-statsd` as

      node daemon :

  To test with tags, use:

      node daemon --tags -- :

  The `--` string after `--tags` is required so that the `:` string
  isn't interpreted as the value of the option.

* You can now go look at the [Infrastructure list][] again, and see the `nsolid`
  app, along side `system`, `ntp`, etc.  Clicking on that app, you'll see each
  stat in a separate graph - only a subset is shown, you can click buttons for
  more.

* You should also see a link to a `nsolid console` here.  Click that, and
  get a slightly different view of that same thing (bigger graphs).
  This link to the [DataDog nsolid dashboard][] may work for you as well.
  It also has a `$scope` drop-down which will be initially set to
  `host:<your hostname>` or to `*`.  This `$scope` drop-down should also contain
  tag values from N|Solid.  Selecting one of the tags from N|Solid will "blank
  out" all of the graphs that aren't associated with the tag, and only show
  data in graphs that **are** associated with the tag.

* Ensure that values in the graphs at DataDog make sense for the app.

* Also test the `--app`, `--prefix` and `--interval` options.

[DataDog]:                  https://www.datadoghq.com/
[DataDog agent]:            http://docs.datadoghq.com/guides/basic_agent_usage/
[Infrastructure list]:      https://app.datadoghq.com/infrastructure
[DataDog nsolid dashboard]: https://app.datadoghq.com/dash/integration/custom%3Ansolid

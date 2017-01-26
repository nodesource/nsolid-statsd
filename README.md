nsolid-statsd - a daemon that sends N|Solid metrics to statsd
================================================================================

This package provides a daemon which will monitor [N|Solid][] runtimes and send
the metrics from the runtimes to [statsd][].  The runtimes that are monitored
are selected based on the command-line parameters.


installation
================================================================================

    npm install nsolid-statsd


usage
================================================================================

    nsolid-statsd [options] [statsd-address [storage-address]]

where:

    statsd-address - the {address} of the statsd UDP server
                     default: localhost:8125

    storage-address  - the {address} of the N|Solid storage server's API port
                     default: localhost:4000

See {address} below for the expected format of these addresses.

options are:

    -h --help            - print some help text
    -v --version         - print the program version
    --app <app name>     - the N|Solid application name to monitor
                           default: monitor all applications
    --prefix <value>     - prefix statsd metric names with the specified value
                           default: 'nsolid'
    --tags <boolean>     - append N|Solid tags to the metrics
                           default: false

Options are parsed with the [npm rc module][], and so options can be set in
environment variables or files, as supported by rc.  For example, you can
specify options in a file named `.nsolid-statsdrc`.

The {address} parameter of the statsd-address and storage-address parameters
should be in one of the following formats:

    :
    port
    host
    host:port

If port is not specified, the default is 8125 for statsd-address, and 4000 for
storage-address. If host is not specified, the default is localhost.  The host
may be a hostname or IPv4 address.

When the `--tags` option is used, the metrics sent to statsd will be modified
to include the tags value associated with the N|Solid instance the metric
originated from.  If the tags associated with an N|Solid instance are `tag-A`,
`tag-B`, and `tag-C`, the metrics will have the following string appended to
them:

    |#tag-A,tag-B,tag-C

Tag suffixes are an extension to statsd and not supported by all statsd servers.


examples
================================================================================

    nsolid-statsd example.com

Poll metrics from the N|Solid storage at `localhost:4000` and send them to the
statsd server at `example.com:8125`.

    nsolid-statsd --tags true -- : example.com

Poll metrics every second from the N|Solid storage at `example.com:4000` and
send them to the statsd server at `localhost:8125`.  Send the N|Solid
application tags as suffixes on the metrics.


statsd metric names
================================================================================

The association of N|Solid metrics to statsd metrics is as follows:

N-Solid metric   | statsd metric
---------------  | -------------
activeHandles    | {prefix}.{app}.process.activeHandles
activeRequests   | {prefix}.{app}.process.activeRequests
cpu              | {prefix}.{app}.process.cpu
cpuSpeed         | {prefix}.{app}.system.cpuSpeed
freeMem          | {prefix}.{app}.system.freeMem
heapTotal        | {prefix}.{app}.process.heapTotal
heapUsed         | {prefix}.{app}.process.heapUsed
load15m          | {prefix}.{app}.system.load15m
load1m           | {prefix}.{app}.system.load1m
load5m           | {prefix}.{app}.system.load5m
rss              | {prefix}.{app}.process.rss

The `{prefix}` value can be specified via command-line option, and defaults to
`nsolid`.  The `{app}` value is the name of the N|Solid application.

For more information about the N|Solid metrics, see the
[N|Solid Process and System Statistics documentation][].


string value normalization
================================================================================

String values which are provided by N|Solid will be normalized in the following
fashion before being used in a statsd metric

* characters which are not alpha-numeric or "-" or "_" will be converted to "-"
* strings that are greater than 200 characters will be truncated to 200 characters

The values which are affected are:

* N|Solid application name
* N|Solid tags


contributing
================================================================================

To submit a bug report, please create an [issue at GitHub][].

If you'd like to contribute code to this project, please read the
[CONTRIBUTING.md][] document.

Authors and Contributors
================================================================================

<table><tbody>
  <tr>
    <th align="left">Patrick Mueller</th>
    <td><a href="https://github.com/pmuellr">GitHub/pmuellr</a></td>
    <td><a href="https://twitter.com/pmuellr">Twitter/@pmuellr</a></td>
  </tr>
  <tr>
    <th align="left">Dave Olszewski</th>
    <td><a href="https://github.com/cxreg">GitHub/cxreg</a></td>
    <td><a href="https://twitter.com/cxreg">Twitter/@cxreg</a></td>
  <tr>
    <th align="left">Johannes Würbach</th>
    <td><a href="https://github.com/johanneswuerbach">GitHub/johanneswuerbach</a></td>
    <td>&nbsp;</td>
  </tr>
</tbody></table>


License & Copyright
================================================================================

**nsolid-statsd** is Copyright (c) 2016-2017 NodeSource and licensed under the
MIT license. All rights not explicitly granted in the MIT license are reserved.
See the included [LICENSE.md][] file for more details.


[N|Solid]: https://nodesource.com/products/nsolid
[statsd]: https://github.com/etsy/statsd
[npm rc module]: https://www.npmjs.com/package/rc
[N|Solid Process and System Statistics documentation]: https://docs.nodesource.com/docs/using-the-cli
[issue at GitHub]: https://github.com/nodesource/nsolid-statsd/issues
[CONTRIBUTING.md]: CONTRIBUTING.md
[LICENSE.md]: LICENSE.md

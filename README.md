nsolid-statsd - a daemon that sends N|Solid metrics to statsd
================================================================================

This package provides a daemon which will monitor [N|Solid][] runtimes and send
the metrics from the runtimes to statsd.  The runtimes that are monitored are
selected based on the command-line parameters.

The metrics from N|Solid will be obtained using the `nsolid-cli` command,
which is shipped with N|Solid, in the same directory as the `nsolid` command.


usage
================================================================================

    nsolid-statsd [options] statsd-address [nsolid-proxy-address]

where:

`statsd-address` is the address of the statsd UDP server.
See `<address>` below for the expected format.

`nsolid-proxy-address` is the address of the N|Solid proxy server.
Defaults to `localhost:9000`.
See `<address>` below for the expected format.

`options` are

* `--help` - print some help text
* `--version` - print the program version
* `--app <app name>` - the N|Solid application name to monitor.  Defaults to
  monitor all applications.
* `--interval <seconds>` - number of seconds between requesting metrics from
  N|Solid.  Defaults to 10 seconds.
* `--timeout <seconds>` - number of seconds to wait for response from N|Solid.
  Defaults to 10 seconds.
* `--prefix <value>` - prefix statsd metric names with the specified value.
  Defaults to `nsolid`
* `--fragmentTags` - add N|Solid tags to the metrics as statsd "fragments" (see
  below).

Options are parsed with the [npm `rc` module][npm-rc], and so options can be
set in environment variables or files, as supported by `rc`.  For example, you
can specify options in an file named `.nsolid-statsdrc`.  Options which do not
take values (eg, `--fragmentTags`) should not be used directly before
parameters, otherwise the parameter will be associated with the option value
(which is ignored).  You can use `--` to separate options from parameters.

The `<address>` parameter of the `statsd-address` and `nsolid-proxy-address`
parameters should be in the following format:

* `port`
* `host`
* `host:port`

If `port` is not specified, the default is `8125` for `statsd-address`, and
`9000` for `nsolid-proxy-address`.

If `host` is not specified, the default is `localhost`.

For the `nsolid-proxy-address` parameter, you may also prefix the parameter
with either `http://` or `https://` (default being `http://`).

When the `--fragmentTags` option is used, the metrics sent to statsd will be
modified to include the tags values associated with the N|Solid instance the
metric originated from.  If the tags associated with an N|Solid instance are
`tag-A`, `tag-B`, and `tag-C`, the metrics will have the following string
appended to them:

    #tag-A,tag-B,tag-C

Tag fragments are an extension to statsd and not supported by all statsd
servers.


examples
================================================================================

    nsolid-statsd example.com

Poll metrics every 10 seconds from the N|Solid proxy at `localhost:9000` and
send them to the statsd server at `example.com:8125`.

    nsolid-statsd --interval 1 --fragmentTags -- 8125 example.com

Poll metrics every second from the N|Solid proxy at `example.com:9000` and
send them to the statsd server at `localhost:8125`.  Send the N|Solid
application tags as fragments.


statsd metric names
================================================================================

The association of N|Solid metrics to statsd metrics is as follows:

N-Solid metric                   | statsd metric
-------------------------------  | -------------
process stats - uptime           | {prefix}.{app}.process.uptime         
process stats - rss              | {prefix}.{app}.process.rss            
process stats - heapTotal        | {prefix}.{app}.process.heapTotal      
process stats - heapUsed         | {prefix}.{app}.process.heapUsed       
process stats - active_requests  | {prefix}.{app}.process.active_requests
process stats - active_handles   | {prefix}.{app}.process.active_handles
process stats - cpu              | {prefix}.{app}.process.cpu            
system stats - freemem           | {prefix}.{app}.system.freemem         
system stats - uptime            | {prefix}.{app}.system.uptime          
system stats - load_1m           | {prefix}.{app}.system.load_1m         
system stats - load_5m           | {prefix}.{app}.system.load_5m         
system stats - load_15m          | {prefix}.{app}.system.load_15m        
system stats - cpu_speed         | {prefix}.{app}.system.cpu_speed       

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


[N|Solid]: https://nodesource.com/products/nsolid
[npm-rc]: https://www.npmjs.com/package/rc
[N|Solid Process and System Statistics documentation]: https://docs.nodesource.com/docs/process-and-system-statistics
[issue at GitHub]: https://github.com/nodesource/nsolid-statsd/issues
[CONTRIBUTING.md]: CONTRIBUTING.md

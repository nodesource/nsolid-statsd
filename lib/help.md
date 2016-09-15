usage:

    nsolid-statsd [options] [statsd-address [storage-address]]

where:

    statsd-address - the {address} of the statsd UDP server
                     default: localhost:8125

    storage-address - the {address} of the N|Solid storage server
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

Options are parsed with the npm rc module, and so options can be set in
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

For the storage-address parameter, you may also prefix the parameter with either
`http://` or `https://` (default being `https://`).

When the `--tags` option is used, the metrics sent to statsd will be modified to
include the tags value associated with the N|Solid instance the metric
originated from.  If the tags associated with an N|Solid instance are `tag-A`,
`tag-B`, and `tag-C`, the metrics will have the following string appended to
them:

    |#tag-A,tag-B,tag-C

Tag suffixes are an extension to statsd and not supported by all statsd servers.

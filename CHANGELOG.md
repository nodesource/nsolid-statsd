Changelog
=========

## v2.0.1 - February 21, 2017

Features

- Added support for N|Solid and statsd endpoint configuration via environment variables
- Base Docker image now using N|Solid Boron
- Added documentation for using the nsolid-statsd Docker image on Docker Hub

## v2.0.0 - January 26, 2017

Features

- N|Solid 2.0 compatibility
- Switched from cli subprocess to client library
- Dockerfile added

Deprecations

- N|Solid 1.x is not compatible with this version, please
  `npm install nsolid-statsd@1` if you need that functionality.

## v1.0.0 - January 12, 2016

Initial public release

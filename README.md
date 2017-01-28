WIP
===

[![Greenkeeper badge](https://badges.greenkeeper.io/mtford90/ssh-system-monitor.svg)](https://greenkeeper.io/)

This project aims to provide a ridiculously simple way to set up monitoring on linux:

* system stats
* logs
* process monitoring

The idea is to use a pool of ssh connections for monitoring rather than having to install agents on every server.

Features in progress:
* Monitors that store data (cpu, process uptime, memory usage, logs etc etc) in various available backends (nedb, sqlite, in-memory etc)
* Alerting (e.g. slack)
    - This should be extensible via an `EventEmitter`
* Rest API for querying historical stats (express)
* Web UI written in React that interfaces with the Rest API
    * log viewer/queries
    * process monitoring
    * system monitoring
* Easy to deploy due to use of node with code as config
    * e.g. `require('ssh-monitor')` & then deploy to dokku/heroku etc.
Alanytics
=========

Super lightwright non-blocking customisable counters for your website,
which can be snapshot to a SQL database for joining on in your code.

Great for building high performance sites (i.e. cached ones) that can
generate some psuedo-realtime data for feeding back into the frontend
views.  For example, you may want to sort articles by most read,
but gathering this data from your existing stats backend (google analytics)
may be subject to too much lag, and caching prevents you getting most
requests reaching your main app server.

Just place a tracking Alan on your site, and pass in the counters you wish
to increment in the URL:

```
    http://server/monkeypants,monkey:poo
```

A job the runs every now and again (configure cron spec in the code) to
collect the redis keys into your SQL database according to whatever patterns
you specify.

Requires a redis server, and optionally a SQL server to run collections
against.

TODO
----

  * Cron spec per collection?
  * Flood protection (examine UA-IP combos?)
  * Date spec in keys (monkey:poo:2012-01-02)
    * ...and therefore key aggregation (sum(monkey:poo:*))
  * Non-Alan trackers!!!!? (Never!)

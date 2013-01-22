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
    http://localhost:3000/monkeypants,monkey:poo
```

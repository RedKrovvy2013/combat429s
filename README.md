
# Combat 429s!

In this sandbox mini-project, developed rate-limit-detecting prototype
which can be used by a larger system to maximize requests to 3rd party
web services while minimizing (429-Too Many Requests) errors from
the 3rd party.


### Fake Software Product / Larger System:

Browser Drawing Program


### Fake Feature:

A user can export their drawing to PDF. Normally, their browser does this
by calling the 3rd party "export-to-PDF" web service. Sometimes, this does not
work, and their drawing is submitted to a backend system.

The backend system processes queue of export-to-PDF jobs by submitting each
job back to the 3rd party. The 3rd party does throttle requests from the
backend system by imposing a rate limit. The backend system has a rate-limit-
detecting prototype which finds an optimal frequency for submitting requests.


## Setup:

    npm install
    node 3rdParty/server3rdParty.js
    node server.js
    // should see console logging on both servers, exhibiting the prototype.

#### Notes:

The code has some database aspects which are somewhat developed and
currently commented out.

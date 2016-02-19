sync-handler
===========

`sync-handler` is an abstraction layer used to sync the data that flowing between 
the client (calypso) and the server (WordPress.com REST-API). It works wrapping 
the request handler of the wpcom.js library which allows it intercept, handler 
and store any requests that the client does.

### How to use

```es6
import { SyncHandler } from 'lib/wp/sync-handler';
import wpcomUndocumented from 'lib/wpcom-undocumented';
import wpcomXHRHandler from 'lib/wpcom-xhr-wrapper';

// wrap the request handler with sync-handler
const handler = new SyncHandler( wpcomXHRHandler );

// create wpcom instance passing the wrapped handler
const wpcom = wpcomUndocumented( handler );
```

### Cache Invalidation

`cache` attempts cleanup the obsolete records from the local storage of the browser so thus reduce the dB size. The current criteria are two:

### syncHandler#pruneRecordsFrom( [lifetime] );
Prune records older than the given `lifetime` (milliseconds or natural language). By default the value of the lifetime is `2 days`.

```es6
// prune the records that are older than one hour of life
syncHandler.pruneRecordsFrom( 1000 * 60 * 60 );

// prune older than 10 hours old
syncHandler
	.pruneRecordsFrom( '10 hours' )
	.then( records => {
		console.log( 'current records count: %s', records.length );
	} );
```

### syncHandler.clearAll();
clearAll the whole sync-handler data.

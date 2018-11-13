[![Build Status](https://travis-ci.org/b2b-alive-ltd/ts-error-generator.svg?branch=master)](https://travis-ci.org/b2b-alive-ltd/ts-error-generator)
[![Coverage Status](https://coveralls.io/repos/github/b2b-alive-ltd/ts-error-generator/badge.svg?branch=master)](https://coveralls.io/github/b2b-alive-ltd/ts-error-generator?branch=master)
ts-error-generator
===================

Custom errors and exceptions with TypeScript interface support in Node.js

This project is inspired by node-custom-error https://github.com/jproulx/node-custom-error/



## Install

```bash
$ npm install ts-error-generator --save
```

## Usage

```typescript
import defineError, { ICustomError } from 'ts-error-generator';

interface APIError extends ICustomError{
    required: string
}

interface HTTPError extends ICustomError{
    code: number,
    status: string
}

const ValidationError = defineError<APIError>('ValidationError', { 'required' : 'Missing parameter x' }, TypeError);
const HTTPError = defineError<HTTPError>('HTTPError', { 'code' : 500, 'status' : 'Server Error' });

throw new ValidationError('Required');
```

The generator function supports the following parameters:

* `name` {String} (required) - A custom name for this error type, which is printed when logging and in stack traces

* `data` {Object} (optional) - Additional properties to attach to the error, in key=value pairs or as object descriptors

* `Constructor` {Function} (optional) - A function to inherit from. Allows for additional methods and properties to be defined on your custom errors

The errors created by the generated functions are identical to built-in Error objects, with additional features such as:

Custom properties can be attached and accessed at run time:
```typescript
const error = new HTTPError('Uh oh');
console.log(error.code, error.status); // prints 500 Server Error
```

## Formatting

Similar to `console.log`, the custom error message will be formatted from all available string and number arguments, using `util.format`:
```typescript
const error = new ValidationError('%s: %s', 'Missing Field', 'name');
console.log(error); // prints ValidationError: Missing Field: name
```

## Wrapped errors

Other error objects can be passed in as arguments, which augment the original error stack trace with their own stack traces:
```typescript
const error = new ValidationError('Missing field');
const serverError = new HTTPError('Something went wrong', error);
console.log(serverError.stack);
```
outputs:
```bash
HTTPError: Something went wrong
    at Object.<anonymous> (/Projects/ts-error-generator/dist/test.js:10:21)
    at Module._compile (internal/modules/cjs/loader.js:688:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:699:10)
    at Module.load (internal/modules/cjs/loader.js:598:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:537:12)
    at Function.Module._load (internal/modules/cjs/loader.js:529:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:741:12)
    at startup (internal/bootstrap/node.js:285:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:739:3)
ValidationError: Missing field
    at Object.<anonymous> (/Projects/ts-error-generator/dist/test.js:9:15)
    at Module._compile (internal/modules/cjs/loader.js:688:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:699:10)
    at Module.load (internal/modules/cjs/loader.js:598:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:537:12)
    at Function.Module._load (internal/modules/cjs/loader.js:529:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:741:12)
    at startup (internal/bootstrap/node.js:285:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:739:3)
```
Multiple error objects are allowed to be passed, and are processed in order.

## JSON support
Errors can also be serialized into JSON format by using `error#toJSON();`. This will enumerate all of the hidden and custom properties, and also format the stack trace into an array of individual lines:

```typescript
console.log(error.toJSON()); // or console.log(JSON.stringify(error));
```
outputs
```bash
{ stack:
   [ 'ValidationError: Required',
     '    at Object.<anonymous> (/Projects/ts-error-generator/dist/test.js:9:15)',
     '    at Module._compile (internal/modules/cjs/loader.js:688:30)',
     '    at Object.Module._extensions..js (internal/modules/cjs/loader.js:699:10)',
     '    at Module.load (internal/modules/cjs/loader.js:598:32)',
     '    at tryModuleLoad (internal/modules/cjs/loader.js:537:12)',
     '    at Function.Module._load (internal/modules/cjs/loader.js:529:3)',
     '    at Function.Module.runMain (internal/modules/cjs/loader.js:741:12)',
     '    at startup (internal/bootstrap/node.js:285:19)',
     '    at bootstrapNodeJSCore (internal/bootstrap/node.js:739:3)' ],
  message: 'Required',
  required: 'Missing parameter x' }
```

## Custom Constructor
Finally, a custom function can be passed in as a 3rd argument. This will allow you to modify the custom error prototype without having to modify the original native Error prototype:

```typescript
interface IAPIError extends ICustomError{
    code: number,
    status: string
    env: string
}

const APIError = defineError<IAPIError>('HTTPError', {env: process.env.NODE_ENV, route: '/'}, function (message: string, code: number) {
    const http = require('http');
    // Set custom properties when thrown based on additional arguments
    this.code = code;
    this.status = http.STATUS_CODES[code];
    // We can override the default message logic if desired:
    this.message = `${message} on ${this.route}`
});

const error = new APIError('You do not have permission', 403);
console.log(error.message, [error.code, error.status, error.env]);
// result: HTTPError: HTTPError: You do not have permission on / [ 403, "Forbidden" , "development"]
```

## Notes
Care is taken to preserve the built-in error handling behavior as much as possible, supporting:

* `custom instanceOf Error`

* `Error.prototype.isPrototypeOf(custom)`

* `util.isError(custom)`

* `custom = generator('message')`

* `custom = new generator('message');`

In other words, you shouldn't have to worry about these errors affecting your syntax or existing code. Simply drop in place for any existing errors you're throwing and it should work just the same.
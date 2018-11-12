import util from 'util';


interface INewCustomError<T> {
    new(...args: any[]): T
}

export interface ICustomError extends Error {
    toJSON(): object
}

export default class CustomErrors {

    private static checkConstructor(constructor?: any) {
        if (constructor && typeof constructor == 'function') {
            if (!Error.prototype.isPrototypeOf(constructor.prototype) && constructor !== Error) {
                const parentProto: { [key: string]: any } = {};
                Object.getOwnPropertyNames(constructor.prototype).forEach(function (name) {
                    parentProto[name] = Object.getOwnPropertyDescriptor(constructor.prototype, name);
                });
                constructor.prototype = Object.create(Error.prototype, parentProto);
            }
        } else {
            constructor = Error;
        }
        return constructor;
    }

    private static setMessage(error: Error, func: Function, message: string) {
        Object.defineProperties(error, {
            message: {
                value: message,
                'enumerable': true,
                'writable': true,
                'configurable': true
            }
        });

        Object.setPrototypeOf(error, Object.create(func.prototype, {
            message: {
                value: message,
                'enumerable': true,
                'writable': true,
                'configurable': true
            }
        }));
    }

    static defineError<T = ICustomError>(name: string, parameters?: { [key: string]: any }, constructor?: any): INewCustomError<T> {

        const errorConstructor = CustomErrors.checkConstructor(constructor);

        const properties: { [key: string]: any } = {};
        if (parameters) {
            Object.keys(parameters).forEach(function (property) {
                properties[property] = {
                    'value': parameters[property],
                    'enumerable': true,
                    'writable': true,
                    'configurable': true
                };
            });
        }

        const CustomErrorCreator = function (...params: any[]): Error {

            const localProperties = {...properties};

            const errors = [];
            const messages = [];
            const length = arguments.length;
            let index = length;
            while (index--) {
                let param = arguments[length - index - 1];
                if (param instanceof Error) {
                    errors.push(param);
                } else if (typeof param === 'number') {
                    messages.push(param);
                } else if (typeof param === 'string') {
                    messages.push(param);
                }
            }


            CustomErrors.setMessage(this, CustomErrorCreator, util.format.apply(null, messages));
            errorConstructor.apply(this, arguments);

            Error.captureStackTrace(this, CustomErrorCreator);

            Object.setPrototypeOf(this, CustomErrorCreator.prototype);

            if (errors.length > 0) {
                let newStack = this.stack;
                errors.forEach(function (error) {
                    newStack = newStack + '\n' + error.stack;
                });
                localProperties.stack = {
                    'value': newStack,
                    'enumerable': true,
                    'writable': true,
                    'configurable': true
                };
            }

            Object.defineProperties(this, localProperties);

            return this;
        };

        const proto: { [key: string]: any } = {
            'constructor': {
                'value': CustomErrorCreator,
                'writable': true,
                'configurable': true,
                'enumerable': false,
            },
            'name': {
                'value': name,
                'enumerable': false,
                'writable': true,
                'configurable': true
            },
            'toJSON': {
                'enumerable': false,
                'configurable': false,
                'value': function () {
                    const json: { [key: string]: any } = {};
                    Object.getOwnPropertyNames(this).forEach(function (name) {
                        json[name] = name == 'stack' ? this[name].split('\n') : this[name];
                    }, this);
                    return json;
                }
            }
        };

        if (parameters) {
            Object.keys(parameters).forEach(function (name) {
                proto[name] = {
                    'value': parameters[name],
                    'enumerable': true,
                    'writable': true,
                    'configurable': true
                };
            });
        }

        CustomErrorCreator.prototype = Object.create(errorConstructor.prototype, proto);
        return <INewCustomError<T>> <unknown> CustomErrorCreator;
    }
}

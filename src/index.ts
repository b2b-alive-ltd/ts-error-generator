import util from 'util';


interface INewCustomError<T> extends ErrorConstructor{
    new(...args: any[]): T
}

export interface ICustomError extends Error {
    toJSON(): object
}

class CustomErrors {

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

    static defineError<T = ICustomError>(name: string, parameters?: { [key: string]: any } | null, constructor?: any): INewCustomError<T> {

        const errorConstructor = CustomErrors.checkConstructor(constructor);
        const errorPrototypeNames = Object.getOwnPropertyNames(Error.prototype);

        const parentProperties: { [key: string]: any } = {};
        Object.getOwnPropertyNames(errorConstructor.prototype).forEach(function (name) {
            if (errorPrototypeNames.indexOf(name) === -1){
                const desc = Object.getOwnPropertyDescriptor(errorConstructor.prototype, name)
                if(desc && desc.enumerable){
                    parentProperties[name] = desc
                }
            }
        });

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

            const localProperties = {
                ...parentProperties,
                ...properties
            };

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

            const proxy = new Error(arguments[0]);
            Object.setPrototypeOf(proxy, Object.create(CustomErrorCreator.prototype));

            const messageProperty = {
                value: util.format.apply(null, messages),
                'enumerable': false,
                'writable': true,
                'configurable': true
            };
            Object.defineProperty(proxy, 'message', messageProperty);
            errorConstructor.apply(proxy, arguments);
            Error.captureStackTrace(proxy, CustomErrorCreator);


            localProperties.stack = {
                'value': proxy.stack,
                'enumerable': false,
                'writable': true,
                'configurable': true
            };

            if (errors.length > 0) {
                let newStack = proxy.stack;
                errors.forEach(function (error) {
                    newStack = newStack + '\n' + error.stack;
                });
                localProperties.stack = {
                    'value': newStack,
                    'enumerable': false,
                    'writable': true,
                    'configurable': true
                };
            }


            Object.defineProperties(proxy, localProperties);
            return proxy;
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
                    for (let name in this) {
                        json[name] = this[name];
                    }
                    json.message = this.message;
                    json.stack = this.stack.split('\n');
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

export const defineError = CustomErrors.defineError;
export default defineError;

interface INewCustomError<T> {
    new (...args: any[]): T;
}
export interface ICustomError extends Error {
    toJSON(): object;
}
export default class CustomErrors {
    private static checkConstructor;
    private static setMessage;
    static defineError<T = ICustomError>(name: string, parameters?: {
        [key: string]: any;
    }, constructor?: any): INewCustomError<T>;
}
export {};

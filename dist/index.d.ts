interface INewCustomError<T> {
    new (...args: any[]): T;
}
export interface ICustomError extends Error {
    toJSON(): object;
}
declare class CustomErrors {
    private static checkConstructor;
    static defineError<T = ICustomError>(name: string, parameters?: {
        [key: string]: any;
    } | null, constructor?: any): INewCustomError<T>;
}
export declare const defineError: typeof CustomErrors.defineError;
export default defineError;

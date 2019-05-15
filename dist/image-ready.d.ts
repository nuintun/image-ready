/**
 * @module image-ready
 * @license MIT
 * @author aui
 * @author nuintun
 * @see https://github.com/nuintun/image-ready
 */
declare type ready = (width: number, height: number) => void;
declare type error = () => void;
/**
 *
 * @param {string} url
 * @param {function} ready
 * @param {function} [error]
 */
export default function imageReady(url: string, ready: ready, error?: error): void;
export {};

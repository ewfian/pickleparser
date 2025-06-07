import { Encoding } from './reader';

export interface IWriter {
    byte(value: number): IWriter;
    bytes(data: Uint8Array): IWriter;
    uint16(value: number): IWriter;
    int32(value: number): IWriter;
    uint32(value: number): IWriter;
    uint64(value: number | bigint): IWriter;
    float64(value: number): IWriter;
    line(text: string): IWriter;
    string(text: string, encoding: Encoding): IWriter;

    /** Returns the complete buffer containing all written data */
    getBuffer(): Uint8Array;
}

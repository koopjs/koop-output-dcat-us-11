import { Transform, TransformCallback } from 'stream';

export class FeedFormatterStream extends Transform {
  private _headerAdded: boolean;
  private _header: string;
  private _footer: string;
  private _delineator: string;
  private _formatChunk: any;

  constructor (header: string, footer: string, delineator: string, formatChunk: any) {
    super({ objectMode: true });
    this._headerAdded = false;
    this._header = header;
    this._footer = footer;
    this._delineator = delineator;
    this._formatChunk = formatChunk;
  }

  _transform (chunk: any, _encoding: BufferEncoding, cb: TransformCallback) {
    if (!this._headerAdded) {
      this._headerAdded = true;
      this.push(this._header);
      this.push(this._formatChunk(chunk));
    } else {
      this.push(this._delineator.concat(this._formatChunk(chunk)));
    }

    cb();
  }

  _flush (cb: TransformCallback) {
    const { _header: header, _footer: footer, _headerAdded: headerAdded } = this;
    const final = headerAdded ? footer : `${header}${footer}`;
    this.push(final);
    cb();
  }
}

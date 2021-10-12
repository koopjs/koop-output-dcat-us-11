import { Readable } from "stream";

export function readableFromArray (arr: Array<any>) {
  const docStream = new Readable({
    objectMode: true
  });

  for (const chunk of arr) {
    docStream.push(chunk);
  }

  docStream.push(null); // signal the end of the stream
  return docStream;
}

export function streamToString (stream: Readable): Promise<string> {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

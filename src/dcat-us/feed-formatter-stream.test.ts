import { readableFromArray, streamToString } from '../test-helpers/stream-utils';
import { FeedFormatterStream } from './feed-formatter-stream';

it('Feed Formatter Stream: just header and footer when no contents', async function () {
  const formatter = new FeedFormatterStream(
    'header',
    'footer',
    '|',
    (chunk) => chunk,
  );

  const res = await streamToString(readableFromArray([]).pipe(formatter));

  expect(res).toBe('headerfooter');
});

it('Feed Formatter Stream: adds delineator', async function () {
  const formatter = new FeedFormatterStream(
    'header',
    'footer',
    '|',
    (chunk) => chunk,
  );

  const res = await streamToString(
    readableFromArray(['foo', 'bar']).pipe(formatter),
  );

  expect(res).toBe('headerfoo|barfooter');
});

it('Feed Formatter Stream: applies format function', async function () {
  const formatter = new FeedFormatterStream(
    'header',
    'footer',
    '|',
    (chunk) => `processed:${chunk}`,
  );

  const res = await streamToString(
    readableFromArray(['foo', 'bar']).pipe(formatter),
  );

  expect(res).toBe('headerprocessed:foo|processed:barfooter');
});

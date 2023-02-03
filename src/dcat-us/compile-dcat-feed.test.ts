import { compileDcatFeedEntry, getDcatErrorWithStatusCode } from './compile-dcat-feed';
import * as datasetFromApi from '../test-helpers/mock-dataset.json';

describe('generating DCAT-US 1.1 feed', () => {
  it('should throw 400 error if template contains transformer that is not defined', async function () {
    try {
      compileDcatFeedEntry(datasetFromApi, {
        title: '{{name}}',
        description: '{{description}}',
        keyword: '{{tags}}',
        issued: '{{created:toISO}}',
        modified: '{{modified:toISO}}',
        publisher: {
          name: '{{source}}'
        },
        contactPoint: {
          '@type': 'vcard:Contact',
          fn: '{{owner}}',
          hasEmail: '{{orgContactEmail:optional}}'
        }
      }, {});
    } catch (e) {
      expect(e).toEqual(getDcatErrorWithStatusCode('Attempted to apply non-existant transform toISO on created with params created:toISO', 400));
    }
  });

});

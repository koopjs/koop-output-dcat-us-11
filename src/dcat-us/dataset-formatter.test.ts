import { formatDcatDataset } from './dataset-formatter';
import * as datasetFromApi from '../test-helpers/mock-dataset.json';
import { RemoteServerError } from '@esri/hub-common';

describe('generating DCAT-US 1.1 feed', () => {
  it('should throw 400 error if template contains transformer that is not defined', async function () {
    try {
      formatDcatDataset(datasetFromApi, {
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
      expect(e).toEqual(new RemoteServerError('Attempted to apply non-existant transform toISO on created with params created:toISO', null, 404));
    }
  });

});

import { compileDcatFeedEntry } from './compile-dcat-feed';
import * as datasetFromApi from '../test-helpers/mock-dataset.json';
import { DcatUsError } from './dcat-us-error';

describe('generating DCAT-US 1.1 feed', () => {
  it('should throw 400 DcatUs error if template contains transformer that is not defined', async function () {
    const dcatTemplate = {
      title: '{{name}}',
      description: '{{description}}',
      keyword: '{{tags}}',
      issued: '{{created:toISO}}'
    }

    try {
      compileDcatFeedEntry(datasetFromApi, dcatTemplate, {});
    } catch (error) {
      expect(error).toBeInstanceOf(DcatUsError);
      expect(error).toHaveProperty('statusCode', 400);
    }
  });

  it('show return distribution in a single array', async function () {
    const dcatTemplate = {
      title: '{{name}}',
      description: '{{description}}',
      keyword: '{{tags}}',
      distribution: [
        'distro1',
        'distro2',
        ['distro3', 'distro4']
      ]
    }

    const dcatDataset = JSON.parse(compileDcatFeedEntry(datasetFromApi, dcatTemplate, {}));
    expect(dcatDataset.distribution).toBeDefined();
    expect(dcatDataset.distribution).toStrictEqual(['distro1', 'distro2', 'distro3', 'distro4']);
  });

  it('show not return uninterpolated distribution in dataset', async function () {
    const dcatTemplate = {
      title: '{{name}}',
      description: '{{description}}',
      keyword: '{{tags}}',
      distribution: ['distro1', '{{distroname}}']
    }
    const dcatDataset = JSON.parse(compileDcatFeedEntry(datasetFromApi, dcatTemplate, {}));
    expect(dcatDataset.distribution).toStrictEqual(['distro1']);
  });

  it('should contain default theme if spatial key exists in dataset', async function () {
    const distribution = ['distro1', '{{distroname}}'];
    const dcatTemplate = {
      title: '{{name}}',
      description: '{{description}}',
      keyword: '{{tags}}',
      distribution,
      spatial: '{{extent}}'
    }
    const dcatDataset = JSON.parse(compileDcatFeedEntry(datasetFromApi, dcatTemplate, {}));
    expect(dcatDataset.theme).toBeDefined();
    expect(dcatDataset.theme).toStrictEqual(['geospatial']);
  });

});
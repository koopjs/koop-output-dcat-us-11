import * as config from 'config';

export const portalUrl = config.has('arcgisPortal')
    ? (config.get('arcgisPortal') as string)
    : 'https://www.arcgis.com';
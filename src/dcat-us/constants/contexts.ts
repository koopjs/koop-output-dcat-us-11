// Context header for DCAT US 1.1
export const HEADER_V_1X = {
    '@context':
        'https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld',
    '@type': 'dcat:Catalog',
    conformsTo: 'https://project-open-data.cio.gov/v1.1/schema',
    describedBy: 'https://project-open-data.cio.gov/v1.1/schema/catalog.json',
};

// Context header for DCAT US 3.0
export const HEADER_V_3_0 = {
    '@type': 'dcat:Catalog',
	conformsTo: {
		'@type': 'Standard',
		title: 'DCAT-US 3.0',
		identifier: 'https://resources.data.gov/dcat-us/3.0.0'
	},
};

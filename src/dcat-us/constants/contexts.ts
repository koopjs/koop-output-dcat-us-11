// Context header for DCAT US 1.1
export const HEADER_V_1X = {
    '@context':
        'https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld',
    '@type': 'dcat:Catalog',
    conformsTo: 'https://project-open-data.cio.gov/v1.1/schema',
    describedBy: 'https://project-open-data.cio.gov/v1.1/schema/catalog.json',
};

// Context header for DCAT US 3.0
// source: https://raw.githubusercontent.com/DOI-DO/dcat-us/refs/heads/main/context/dcat-us-3.0.jsonld
export const HEADER_V_3X = {
    '@context': {
        '@version': 1.1,
        '@protected': true,
        'adms': 'http://www.w3.org/ns/adms#',
        'cnt': 'http://www.w3.org/2011/content#',
        'dash': 'http://datashapes.org/dash#',
        'dcat': 'http://www.w3.org/ns/dcat#',
        'dcatap': 'http://data.europa.eu/r5r/',
        'dcat-us': 'http://data.resources.gov/ontology/dcat-us#',
        'dcat-us-shp': 'http://data.resources.gov/shapes/dcat-us#',
        'dcterms': 'http://purl.org/dc/terms/',
        'dqv': 'http://www.w3.org/ns/dqv#',
        'foaf': 'http://xmlns.com/foaf/0.1/',
        'gsp': 'http://www.opengis.net/ont/geosparql#',
        'locn': 'http://www.w3.org/ns/locn#',
        'odrs': 'http://schema.theodi.org/odrs#',
        'org': 'http://www.w3c.org/ns/org#',
        'owl': 'http://www.w3.org/2002/07/owl#',
        'prov': 'http://www.w3.org/ns/prov#',
        'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
        'schema': 'http://schema.org/',
        'sh': 'http://www.w3.org/ns/shacl#',
        'skos': 'http://www.w3.org/2004/02/skos/core#',
        'sdmx-attribute': 'http://purl.org/linked-data/sdmx/2009/attribute#',
        'spdx': 'http://spdx.org/rdf/terms#',
        'vcard': 'http://www.w3.org/2006/vcard/ns#',
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        'adms:Identifier': {
            '@id': 'adms:Identifier',
            '@context': {
                'schemaAgency': 'http://www.w3.org/ns/adms#schemaAgency',
                'creator': {
                    '@id': 'dcterms:creator',
                    '@type': '@id'
                },
                'issued': {
                    '@id': 'dcterms:issued'
                },
                'version': 'http://purl.org/dc/terms/version',
                'notation': 'http://www.w3.org/2004/02/skos/core#notation'
            }
        },
    },
    '@type': 'dcat:Catalog',
    conformsTo: 'https://resource.data.gov/profile/dcat-us#',
};

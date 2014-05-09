/**
 * @fileoverview Static data require by the application.
 *
 * This file must be uploaded to https://mbinfo.storage.googleapis.com/meta-data.js
 * unless, the file exist.
 * The application may update it afterwords.
 *
 * gsutil cp -n meta-data.js gs://mbinfo/meta-data.js
 */


window.sitemapHome = {
  'title': 'Home',
  'url': 'http://www.mechanobio.info/index.html',
  children: [{
    'title': 'About Us',
    'url': 'http://www.mechanobio.info/about.html'
  }, {
    'url': 'http://www.mechanobio.info/contact-us.html',
    'title': 'Contact Us'
  }, {
    'url': 'http://www.mechanobio.info/privacy.html',
    'title': 'Privacy'
  }, {
    'url': 'http://www.mechanobio.info/terms-of-use.html',
    'title': 'Terms of Use'
  }, {
    'url': 'http://www.mechanobio.info/whatismechanobiology.html',
    'title': 'What is Mechanobiology'
  }, {
    'url': 'http://www.mechanobio.info/physiological_relevance.html',
    'title': 'Physiological Relevance'
  }]
};


/**
 * Sidebar topic definations.
 * @type {Object.<string>}
 */
window.metaTopicDefinition = {
  'cellular-organization': {
    title: 'Cellular Organization',
    description: 'Cellular process often occur within distinct cellular regions or compartments. However, they do not occur independently as one process may regulate another, or provide the components or resources for mechanisms carried out in distant regions of the cell. Each region, compartment and component functions in concert with each other to produce cellular machines with highly specialized functions.'
  },
  'cytoskeleton-dynamics': {
    title: 'Cytoskeleton Dynamics',
    description: 'Within nearly every cell exists a protein-based framework that provides structural support, provides ‘tracks’ for the transport cargo, facilitates the generation of force and can be exploited for the transduction of mechanical signals. This network is highly dynamic, constantly undergoing assembly, disassembly and reorganization. This network is known as the cytoskeleton.'
  },
  'signaling': {
    title: 'Signaling',
    description: 'Cells constantly communicate with each other. A molecular handshake between neighbouring cells, or the pull of a cell matrix adhesion, will initiate the transfer of information through a multitude of signaling pathways. Whether chemical, mechanical or electrical; long-distance or local, these signaling pathways are crucial to the overall function, and survival, of the cell.  '
  },
  'synthesis': {
    title: 'Synthesis',
    description: 'Molecular factories exist throughout every cell, persistently and efficiently synthesizing molecular components, proteins and lipids to keep up with the demands of cellular life. From the genetic blueprint contained within DNA, through to a perfectly folded and functional protein, cells must produce it all with the highest accuracy – lest defects in these products prove fatal for the cell, or its organism. '
  }
};


/**
 * Links in Orb navigation bar.
 * This data is obtained by
 * var xp = app.exports()
 * xp.orbNav.dumpUrls()
 * @type {Array}
 */
window.metaOrbNavLinks = [
  {
    "title": "Cellular Organization",
    "links": [
      {
        "title": "Introduction",
        "url": "/topics/cellular-organization"
      },
      {
        "title": "Clathrin-mediated endocytosis",
        "url": "/topics/cellular-organization/go-0072583"
      },
      {
        "title": "Nucleus",
        "url": "/topics/cellular-organization/go-0005634"
      }
    ]
  },
  {
    "title": "Cytoskeleton Dynamics",
    "links": [
      {
        "title": "Introduction",
        "url": "/topics/cytoskeleton-dynamics"
      },
      {
        "title": "Bleb",
        "url": "/topics/cytoskeleton-dynamics/go-0032059"
      },
      {
        "title": "Contractile Fiber",
        "url": "/topics/cytoskeleton-dynamics/go-0043292"
      },
      {
        "title": "Cytoskeleton",
        "url": "topics/cytoskeleton-dynamics/go-0005856"
      },
      {
        "title": "Filopodium",
        "url": "/topics/cytoskeleton-dynamics/go-0030175"
      },
      {
        "title": "Invadopodium",
        "url": "/topics/cytoskeleton-dynamics/go-0071437"
      },
      {
        "title": "Lamellipodium",
        "url": "/topics/cytoskeleton-dynamics/go-0030027"
      },
      {
        "title": "Podosome",
        "url": "/topics/cytoskeleton-dynamics/go-0002102"
      },
      {
        "title": "Stress Fiber",
        "url": "/topics/cytoskeleton-dynamics/go-0001725"
      }
    ]
  },
  {
    "title": "Mechanosignaling",
    "links": [
      {
        "title": "Introduction",
        "url": "/topics/signaling"
      },
      {
        "title": "Cell-Matrix Adhesion",
        "url": "/topics/signaling/go-0007160"
      },
      {
        "title": "Cell-cell signaling",
        "url": "/topics/signaling/go-0007267"
      },
      {
        "title": "Canonical Wnt Receptor Signaling Pathway",
        "url": "/topics/signaling/go-0060070"
      }
    ]
  },
  {
    "title": "Synthesis",
    "links": [
      {
        "title": "Introduction",
        "url": "/topics/synthesis"
      },
      {
        "title": "Chromatin",
        "url": "/topics/synthesis/go-0000785"
      },
      {
        "title": "DNA packaging",
        "url": "/topics/synthesis/go-0006323"
      },
      {
        "title": "DNA-templated transcription",
        "url": "/topics/synthesis/go-0006351"
      }
    ]
  }
];


/**
 * Number of records use in mbi.utils.storage.getStorage.
 * Application may update this data.
 * @type {Array}
 */
window.metaBiCounts = [
  {name: 'ortholog', count: 239},
  {name: 'page', count: 133},
  {name: 'homologene', count: 843},
  {name: 'interaction', count: 300},
  {name: 'protein', count: 2072},
  {name: 'gene', count: 7935} // -1
];


/**
 * Number of records use in mmbi.data.storage.getStorage.
 * Application may update this data.
 * @type {Array}
 */
window.metaWikiCounts = [
  {name: 'page', count: 133},
  {name: 'modules', count: 51, exact: true},
  {name: 'definition', count: 100}
];

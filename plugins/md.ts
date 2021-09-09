import { createFilter } from '@rollup/pluginutils';

export function md() {
  return {
    name: 'react-markdown',
    resolveId(source, importer) {
      // console.log(source, 'source', 'importer');
      if (!importer) {
        if (/\.md$/.test(source)) {
          // console.log(source);
        }
      }
    },
    load(id) {
      const filter = createFilter(/\.md$/);
      if (filter(id)) {
        // console.log(id, 'filter');
      }
    },
    // configureServer(server) {},
    transform(code, id, ssr) {
      const filter = createFilter(/\.md$/);
      if (filter(id)) {
        // console.log(id, 'transform');
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null,
        };
      }
    },
  };
}

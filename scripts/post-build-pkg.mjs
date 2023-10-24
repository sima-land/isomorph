import fs from 'fs-extra';
import path from 'node:path';

fs.readFile('./package.json', 'utf-8')
  .then(JSON.parse)
  .then(pkg => ({
    pkg,
    subfolders: Object.entries(pkg.exports)
      .map(([key, value]) => ({
        pathname: key,
        definition: value,
      }))
      .filter(
        ({ pathname, definition }) =>
          path.basename(pathname) !==
          path.basename(definition.import, path.extname(definition.import)),
      ),
  }))
  .then(({ pkg, subfolders }) =>
    Promise.all(
      subfolders.map(item =>
        fs.outputFile(
          path.join(path.relative('./', item.pathname), 'package.json'),
          JSON.stringify(
            {
              name: path.join(pkg.name, item.pathname),
              types: path.relative(path.relative('./', item.pathname), item.definition.types),
              main: path.relative(path.relative('./', item.pathname), item.definition.require),
              module: path.relative(path.relative('./', item.pathname), item.definition.import),
            },
            null,
            2,
          ),
        ),
      ),
    ),
  );

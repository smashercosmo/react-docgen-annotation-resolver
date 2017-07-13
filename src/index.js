import { utils as docgenUtils } from 'react-docgen'; // eslint-disable-line

const reactDocs = require('react-docgen'); // eslint-disable-line

export default function (ast, recast) {
  /**
   * Find all the currently exported component definitions.
   */
  const components = reactDocs.resolver.findAllExportedComponentDefinitions(ast, recast);

  const types = recast.types.namedTypes;

  const exportTagged = (path) => {
    const leadingComments = path.value.leadingComments;
    if (!leadingComments) {
      return false;
    }

    // Search for the @component tag in any export and if it is present assume
    // that we are exporting a valid react component.
    const isTagged = leadingComments.reduce((acc, comment) => acc === true
      || comment.value.indexOf('@component') !== -1, []);

    if (!isTagged) {
      return false;
    }

    const definitions = docgenUtils.resolveExportDeclaration(path, types);

    definitions.forEach((definition) => {
      if (definition && components.indexOf(definition) === -1) {
        components.push(definition);
      }
    });

    return false;
  };

  recast.visit(ast, {
    visitFunctionDeclaration: false,
    visitFunctionExpression: false,
    visitClassDeclaration: false,
    visitClassExpression: false,
    visitIfStatement: false,
    visitWithStatement: false,
    visitSwitchStatement: false,
    visitCatchCause: false,
    visitWhileStatement: false,
    visitDoWhileStatement: false,
    visitForStatement: false,
    visitForInStatement: false,

    visitExportDeclaration: exportTagged,
    visitExportNamedDeclaration: exportTagged,
    visitExportDefaultDeclaration: exportTagged,
  });

  return components;
}

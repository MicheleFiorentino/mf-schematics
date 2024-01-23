import { Rule, Tree, SchematicContext, externalSchematic, chain, mergeWith, MergeStrategy, move, applyTemplates, apply, url, forEach, FileEntry } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { CustomLibSchema } from './custom-lib';

export function customLibGenerator(options: CustomLibSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('Generating custom library...');

    const libraryPath = `${options.project}/${strings.dasherize(options.name)}`;
    const templateSource = apply(url('./files'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        name: options.name,
        selector: options.selector
      }),
      move(normalize(`${options.project}/${strings.dasherize(options.name)}`)),
      forEach((fileEntry: FileEntry) => {
        // Just by adding this is allows the file to be overwritten if it already exists
        if (tree.exists(fileEntry.path)) {
          tree.overwrite(fileEntry.path, fileEntry.content);
          return null;
        }
        return fileEntry;
      }),
    ]);

    return chain([
      externalSchematic('@schematics/angular', 'library', {
        name: options.name,
        projectRoot: normalize(libraryPath),
      }),
      mergeWith(templateSource, MergeStrategy.Overwrite),
      (tree: Tree) => {
        const libraryLibPath = `${libraryPath}/src/lib`;
        tree.delete(`${libraryLibPath}/${strings.dasherize(options.name)}.service.ts`);
        tree.delete(`${libraryLibPath}/${strings.dasherize(options.name)}.service.spec.ts`);
        return tree;
      },
    ]);
  };
}

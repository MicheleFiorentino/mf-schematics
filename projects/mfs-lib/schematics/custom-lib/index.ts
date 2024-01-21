import { apply, applyTemplates, chain, mergeWith, Rule, Tree, SchematicContext, url, move } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { CustomLibSchema } from './custom-lib';

export function customLiBGenerator(options: CustomLibSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(
      url('./files'), [
        applyTemplates({
          classify: strings.classify,
          dasherize: strings.dasherize,
          name: options.name
        }),
        move(normalize(`/${options.path}/${strings.dasherize(options.name)}`))
      ]
    );

    return chain([
      mergeWith(templateSource)
    ]);
  }
}

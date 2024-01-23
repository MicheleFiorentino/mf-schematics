import { Rule, Tree, SchematicContext, externalSchematic, chain, mergeWith, MergeStrategy, move, applyTemplates, apply, url } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { CustomLibSchema } from './custom-lib';

export function customLibGenerator(options: CustomLibSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {

    context.logger.info('Generating custom library...');
    tree;

    const templateSource = apply(
      url('./files'), [
        applyTemplates({
          classify: strings.classify,
          dasherize: strings.dasherize,
          name: options.name
        }),
        move(normalize(`${options.project}/${strings.dasherize(options.name)}/src/lib/`))
      ]
    );

    return chain([
      externalSchematic('@schematics/angular', 'library', {
        name: options.name,
        projectRoot: normalize(`${options.project}/${strings.dasherize(options.name)}`)
      }),
      mergeWith(templateSource, MergeStrategy.Overwrite)
    ]);

  }
}

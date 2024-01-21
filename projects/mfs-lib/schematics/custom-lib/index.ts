import { apply, applyTemplates, chain, mergeWith, Rule, url, move } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { CustomLibSchema } from './custom-lib';

export function customLibGenerator(options: CustomLibSchema): Rule {
  return () => {
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

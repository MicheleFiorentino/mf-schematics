# Schematics Guide for Library Generation

The following guide is just a start-up to generate the first component. The rest is showed in code.
This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.0.

## 1. Project Creation

For the new project, there's no need to create the application. Execute the following command:

```bash
ng new mf-schematics --no-create-application
```

Once created, navigate to its directory.


## 2. Library Creation

The library will host the collection of our schematics. Subsequently, it needs to be prefixed to the schematic we want to use.

```bash
ng generate library mfs-lib
```

In addition to the library, a projects folder will also be created.

## 3. Initializing the Schematics Collection

Starting from the root folder of the library (note: it is a sibling of src):

- Create a folder named "schematics."
- Inside the "schematics" folder, create a file named "collection.json."

The "collection.json" file describes the list of supported schematics. Within it, you can find two fields:

- `$schema`: a path relative to the Angular Devkit collection schema.
- `schematics`: an object describing the schematics that are part of the collection.

```json
{
  "$schema": "../../../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {}
}
```

## 4. Schematic Creation

In the `collection.json` file, inside the "schematics" object, you can define a new schematic. The two main fields for this schematic are:

- `description`: provides a description of the schematic.
- `factory`: specifies which script should be executed by Angular CLI. Typically, it is a function with the same name as the schematic, found in an `index.ts` file.

```json
"schematics": {
  "custom-lib": {
    "description": "generates a custom library with a special DTS",
    "factory": "./custom-lib/index#customLibGenerator"
  }
}
```

Inside the schematics folder, create a new folder representing your schematic. Inside that folder, create a file named index.ts (which will be defined later).

## 5. Adding Additional Options to the Schematic

Our schematic, which involves generating a library, needs to accept additional input options allowing the user to make other choices, such as the library name, the path where to create it, and so on. To achieve this, we will make use of the "schema" field:

- `schema`: refers to the path of a "schema.json" file where additional options are specified for use during the template execution. This file will be a sibling of `index.ts`.

Additionally, you may specify shortcuts under the "aliases" field.

```json
"custom-lib": {
  ...
  "schema": "./custom-lib/schema.json",
  "aliases": []
}
```

## 6. Definition of the "schema.json" File

Let's define an object with various fields:

- `$schema`: specifies the structure of the JSON document. Insert the link to a schema.
- `$id`: a unique ID for the schema in the collection.
- `title`: the title of the schema.
- `type`: a descriptor for the type provided by the properties, usually an object.
- `properties`: an object defining the available options for the schematic.
- `required`: we can specify properties that are mandatory, such as a name or a path.

For the properties, we want to define:

- `"name"` for the library. Additionally, we can add a description and the type, which in this case is a string.
- `"path"`: the path where the library should be created. In this case, add a description and the type, as well as the "format" that should be of type "path". Optionally, we can add "x-prompt" values. These prompts cause the schematic to pause and request information when executed, and we can specify default values.

## 7. Definition of an Interface for Options

The properties defined in the schema need to be passed to our factory function. To achieve this, we need to define an interface to describe these properties. Therefore, within our schematic, create a new file of the type "custom-lib.ts," and inside it, define an interface named "CustomLibSchema."

```typescript
// custom-lib.ts

export interface CustomLibSchema {
  name: string;
  path: string;
}
```

## 8. Definition of the Function Executed by the Schematic

In the `index.ts` file, define the factory function, which should have the same name as given in the `collection.json` file.

This function will return a "Rule" (from `@angular-devkit/schematics`), which, in turn, is a function that optionally accepts "Tree" and "SchematicContext" as fields:

- `Tree`: a virtual representation of the project's file tree on disk.
- `SchematicContext`: an object that provides various tools, such as logging and debugging.

As for the factory function, pass it an "options" field of type "CustomLibSchema," which, in turn, refers to the `schema.json` file.

```typescript
// index.ts

import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { CustomLibSchema } from './custom-lib';

export function customLibGenerator(options: CustomLibSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    // Implementation of the schematic logic goes here
  };
}
```

## 9. Template Creation for a Schematic

A template is a guide file that, given options like the name, can generate a target file. It's good practice to place template files in a separate folder, such as "files."

For the creation of a template, follow these guidelines:

- File Creation: The file should be named like: `__name@dasherize__.component.ts.template`.
  - `__name__`: "name" refers to the "name" defined in `schema.json`, which will be the name entered by the user.
  - `@dasherize`: the "@" indicates a method, in this case, "dasherize," which formats the user-entered name with dashes (e.g., mySuperLibrary -> my-super-library).
  - `template`: indicates that this is a template file.

- Code in the File: You can create placeholders like `<%= dasherize(name) %>` or `<%= classify(name) %>`.
  - `<%= ... %>`: indicates the area where the field will be present.
  - `name`: the name of the field specified in `schema.json`.
  - `dasherize/classify`: formatting functions.

```typescript
// files/__name@dasherize__.component.ts.template

import { Component } from '@angular/core';

@Component({
  selector: '<%= dasherize(name) %>',
  template: `<p><%= dasherize(name) %> works!<p>`
})
export class <%= classify(name) %>Component {
  constructor(){}
}

```

## 10. Implementation of the Schematic Execution Function

To execute the file generation, we need to use the helper method `apply()`. This method takes two fields:

- `source`: the source of our templates, passed with the helper function `url`.
- an array of `Rule`: for this, we can use another helper function `applyTemplates()`. With this, we define the functions and parameters used in the templates.

In addition to this, we can specify where to create the file using the `move` function (note: since we can use backslash or forward slash based on the OS, it is advisable to normalize the path).

Finally, we need to return these rules. In essence, we have to return a series of rules that will be executed one after the other in a "chain," and for this, we use the `chain()` method (which merges multiple rules into one).

```typescript
// index.ts

import { apply, applyTemplates, chain, mergeWith, Rule, Tree, SchematicContext, url, move } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { CustomLibSchema } from './custom-lib';

export function customLibGenerator(options: CustomLibSchema): Rule {
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
  };
}
```

## 11. Build and Post-Build for the Schematic

To use the schematic, it needs to be built. Schematics should be built after the library, so they are placed in the correct folder. To perform this operation, the library needs a custom TypeScript configuration with instructions on how to compile these library schematics. To add these schematics to the library, new scripts must be added to the `package.json`.

To inform the library how to build the schematics, create a new file named `tsconfig.schematics.json` in the same folder as `tsconfig.lib.json`. Insert the following content (replace the library name "my-lib" with the one assigned in `outdir`):
[Angular Guide on Building Schematics](https://angular.io/guide/schematics-for-libraries#building-your-schematics)

We distinguish two phases: build and post-build:
- **Build:** TypeScript files are built according to a `tsconfig.json` file.
- **Post-Build:** The built files need to be manually moved to a `dist` folder.

To achieve this, add the commands to the "scripts" section in the project's `package.json`. Additionally, add dependencies to use `copyfiles` and `typescript`.

```json
{
  "name": "mfs-lib",
  "version": "0.0.1",
  "scripts": {
    "build": "tsc -p tsconfig.schematics.json",
    "postbuild": "copyfiles schematics/*/schema.json schematics/*/files/** schematics/collection.json ../../dist/mfs-lib/"
  },
  "peerDependencies": {
    "@angular/common": "^15.2.0",
    "@angular/core": "^15.2.0"
  },
  "schematics": "./schematics/collection.json",
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "devDependencies": {
    "copyfiles": "file:../../node_modules/copyfiles",
    "typescript": "file:../../node_modules/typescript"
  },
  "sideEffects": false
}
```

Once the above steps are completed, it's time to build both the project and the schematic. Use the following commands:

```bash
npm run build
npm run build --prefix projects/mfs-lib
```

## 12. Reuse of Existing Schematics

To reuse existing schematics, include an `externalSchematic` in the "chain," specifying the collection, schematic, and options. You can also specify the merge strategy in case of conflicts.

```typescript
// index.ts

return chain([
  externalSchematic('@schematics/angular', 'component', options),
  mergeWith(templateSource, MergeStrategy.Overwrite)
]);
```

## 13. Using the Schematic in Other Projects

After building the project and the schematic, it needs to be packaged using the command `npm pack` inside "dist/mfs-lib". This will result in a .tgz file, which must be added as a dependency in the "package.json" of the project that will use it (remember to run `npm install` afterward).

Finally, invoke the schematic:

```bash
ng generate mfs-lib:my-custom-lib --name foobar
```

# multilang-builder

## Summary
#### [Example of use case](#example-of-use-case-1)
#### [Installation](#installation-1)
#### [Configuration](#configuration-1)
#### [Texts files](#texts-files-1)
#### [Tutorial](#tutorial-1)

## Example of use case

You have a website in english, french and spanish. When you want to make some changes to a page, you need to make the change three times, on the english, the french and the spanish version. 
<br>
Using this module, you create a template, the texts and it can generate the pages in all the three languages. Meaning that, when you want to make some changes to the code of a page, you only have to edit the template and generate the pages in the three languages.

## Installation

#### Prerequisites : Node.js and a package manager (npm, yarn, ...) ([here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))

#### If you don't have initialized yet a node project : 

```
npm init
```

or

```
yarn init
```

#### Then install the module

```
npm install multilang-builder --save-dev
```

or

```
yarn add multilang-builder --dev
```

## Configuration

The configuration file of the module needs to be at the ```root of your node project``` and named ```multilang.config.js```.

```js
// multilang.config.js
module.exports = {
  // Source folder of the template pages
  src: './app',
  // Destination folder of the generated pages
  dest: './dist',
  // The output languages
  languages: ['en', 'fr'],
  // Path of the files containing the texts
  textsFiles: ['texts/texts1.js','texts/texts2.js'],
  // Ignored files or folder path. The ignored files and folder will be ignored when generating files.
  ignored: ['ignored.php', 'ignoredFolder'],
  // Text separator used in your template files, ex : <h1>@@@TITLE@@@</h1>
  textSeparator: '@@@',
};
```

## Texts files

```js
// texts/page.js
module.exports = {
  // language
  en : {
    // The key is what's between the separators (@@@KEY@@@)
    // KEY: text
    TITLE: 'My title',
    SUBTITLE: 'My subtitle',
    DESCRIPTION: 'My description',
    COPYRIGHT: 'My copyright'
  },
  fr: {
    TITLE: 'Mon titre',
    SUBTITLE: 'Mon sous-titre',
    DESCRIPTION: 'Ma description',
    COPYRIGHT: 'Mon copyright'
  }
}
```

## Tutorial

### 1. Initialize the project

run this command in the root of your project :

```
npm init -y
```

### 2. Install the module

run this command in the root of your project :

```
npm install multilang-builder --save-dev
```

### 3. Create my page template : 

```html
<!-- app/page.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@@@TITLE@@@</title>
</head>
<body>
    <header>
        <h1>@@@TITLE@@@</h1>
        <h2>@@@SUBTITLE@@@</h2>
    </header>
    <main>
        <p>@@@DESCRIPTION@@@</p>
    </main>
    <footer>
        <p>@@@COPYRIGHT@@@</p>
    </footer>
</body>
</html>
```

### 4. Create my text file : 

```js
// texts/page.js
module.exports = {
  en : {
    TITLE: 'My title',
    SUBTITLE: 'My subtitle',
    DESCRIPTION: 'My description',
    COPYRIGHT: 'My copyright'
  },
  fr: {
    TITLE: 'Mon titre',
    SUBTITLE: 'Mon sous-titre',
    DESCRIPTION: 'Ma description',
    COPYRIGHT: 'Mon copyright'
  }
}
```

### 5. Create my config file:

```js
// multilang.config.js
module.exports = {
  // Source folder of the template pages
  src: './app',
  // Destination folder of the generated pages
  dest: './dist',
  // The output languages
  languages: ['en', 'fr'],
  // Path of the files containing the texts
  textsFiles: ['texts/page.js'],
  // Ignored files or folder path. The ignored files and folder will be ignored when generating files.
  ignored: ['back'],
  // Text separator used in your template files, ex : <h1>@@@TITLE@@@</h1>
  textSeparator: '@@@',
};
```

File structure :

```
├── multilang.config.js
├── package.json
├── package-lock.json
├── dist
└── texts
    └── page.js
└── app
    ├── page.html
    └── back
        └── ...
```

### 6. Generate the pages in english and french

run this command in the root of your project :

```
npx buildLang
```

Generated english page : 

```html
<!-- dist/en/page.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My title</title>
</head>
<body>
    <header>
        <h1>My title</h1>
        <h2>My subtitle</h2>
    </header>
    <main>
        <p>My description</p>
    </main>
    <footer>
        <p>My copyrigth</p>
    </footer>
</body>
</html>
```

File structure :

```
├── multilang.config.js
├── package.json
├── package-lock.json
├── dist
    ├── en
        └── page.html
    └── fr
        └── page.html
├── texts
    └── page.js
└── app
    ├── page.html
    └── back
        └── ...
```

You have now successfully generated the page in english and french.
<br>
<br>
Now, let's say you need to change the text, you can change the text in the text file and generate again the page.
<br>
If you need to change the style, you can just edit the template and regenerate the files.
# multilang-builder

## Summary
A powerful tool for generating multilingual websites, managing texts, and translating content easily.

- [Installation](#installation)
- [Commands](#commands)
  - [Generate Website](#generate-website)
  - [Extract Texts and Generate Templates](#extract-texts-and-generate-templates)
  - [Translate Texts](#translate-texts)
- [Configuration](#configuration)
- [Example](#example)

## Installation

Make sure you have Node.js and a package manager (npm or yarn) installed on your system.

1. Initialize a Node.js project (if not done already):
   ```
   npm init -y
   ```
   
2. Install `multilang-builder` as a development dependency:
   ```
   npm install multilang-builder --save-dev
   ```

## Commands

### Generate Website

Use the `buildLang` command to generate pages for different languages based on your templates and texts.

```
npx buildLang
```

### Extract Texts and Generate Templates

Use the `extractTexts` command to automatically create text files from your source pages and generate corresponding template pages.

```
npx extractTexts
```

### Translate Texts

Use the `translateTexts` command to translate texts from one language to multiple others.

```
npx translateTexts
```

## Configuration

The configuration file for `multilang-builder` needs to be named `multilang.config.js` and should be at the root of your Node.js project.

```js
// multilang.config.js
module.exports = {
  // Generate Website Configuration
  generateWebsiteConfig: {
    // Root path of the page templates
    src: "./templates",
    // Ignored files or folders
    ignored: ["ignored.php", "ignored"],
    // Destination for the multilang website
    dest: "./dist",
    // Output languages
    languages: ["en", "fr"],
    // Root path of the texts files
    textsSrc: "./texts",
    // Text separator for the templates pages
    textSeparator: "@@@",
  },
  // Extract Texts and Generate Templates Configuration
  extractTextsAndGenerateTemplateConfig: {
    // Root path of the pages you want to extract the texts from
    src: "./app",
    // Ignored files or folders
    ignored: ["ignored.php", "ignored"],
    // Destination of the texts files
    textsDest: "./texts",
    // Destination of the templates
    templatesDest: "./templates",
    // Language of the extracted texts
    language: "en",
    // Text separator for the templates pages
    textSeparator: "@@@",
  },
  // Translate Texts Configuration
  translatingTextsConfig: {
    // Root path of the texts files
    src: "./texts",
    // Ignored files or folders
    ignored: ["ignored.js", "ignored"],
    // Input language
    inputLanguage: "en",
    // Output languages
    outputLanguages: ["fr", "de"],
    // Deepl API Key
    deeplApiKey: "your-deepl-api-key",
  },
};
```


## Example

### Extract Texts, Translate, and Generate Pages

### 1. Project files :

```markdown
example
│   multilang.config.js
│   package.json
│   package-lock.json
└── src
    └── index.html
```

```js
// multilang.config.js
module.exports = {
  extractTextsAndGenerateTemplateConfig: {
    src: "./src",
    ignored: [],
    textsDest: "./texts",
    templatesDest: "./templates",
    language: "en",
    textSeparator: "@@@",
  },
  translatingTextsConfig: {
    src: "./texts",
    ignored: [],
    inputLanguage: "en",
    outputLanguages: ["fr"],
    deeplApiKey: "your-random-api-key-placeholder",
  },
  generateWebsiteConfig: {
    src: "./templates",
    ignored: [],
    dest: "./dist",
    languages: ["en", "fr"],
    textsSrc: "./texts",
    textSeparator: "@@@",
  },
};
```

```html
<!-- src/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multilang Builder</title>
</head>
<body>
    <header>
        <h1>Welcome to Multilang Builder</h1>
        <h2>Your Multilingual Solution</h2>
    </header>
    <main>
        <p>Generate pages in multiple languages easily.</p>
    </main>
</body>
</html>
```

### 2. Extract texts and generate templates

#### Extract command :

```
npx extractTexts
```

#### New files :

```
example
│   multilang.config.js
│   package.json
│   package-lock.json
│   templates
│   └── index.html
│   texts
│   └── index.js
└── src
    └── index.html
```

```html
<!-- templates/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@@@0@@@</title>
</head>
<body>
    <header>
        <h1>@@@1@@@</h1>
        <h2>@@@2@@@</h2>
    </header>
    <main>
        <p>@@@3@@@</p>
    </main>
</body>
</html>

```

```js
// texts/index.js
module.exports = {
  "en": {
    "0": "Multilang Builder",
    "1": "Welcome to Multilang Builder",
    "2": "Your Multilingual Solution",
    "3": "Generate pages in multiple languages easily."
  }
};
```

### 3. Translate texts

#### Translate command :

```
npx translateTexts
```

#### New text file :

```js
// texts/index.js
module.exports = {
  "en": {
    "0": "Multilang Builder",
    "1": "Welcome to Multilang Builder",
    "2": "Your Multilingual Solution",
    "3": "Generate pages in multiple languages easily."
  },
  "fr": {
    "0": "Multilang Builder",
    "1": "Bienvenue dans Multilang Builder",
    "2": "Votre solution multilingue",
    "3": "Générez des pages dans plusieurs langues facilement.",
  }
};
```

### 4. Generate website

#### Generate website command : 

```
npx buildLang
```

#### New files :

```
example
│   multilang.config.js
│   package.json
│   package-lock.json
│   templates
│   └── index.html
│   dist
│   └── en
│       └── index.html
│   └── fr
│       └── index.html
│   texts
│   └── index.js
└── src
    └── index.html
```

```html
<!-- dist/en/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multilang Builder</title>
</head>
<body>
    <header>
        <h1>Welcome to Multilang Builder</h1>
        <h2>Your Multilingual Solution</h2>
    </header>
    <main>
        <p>Generate pages in multiple languages easily.</p>
    </main>
</body>
</html>
```

```html
<!-- dist/fr/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multilang Builder</title>
</head>
<body>
    <header>
        <h1>Bienvenue dans Multilang Builder</h1>
        <h2>Votre solution multilingue</h2>
    </header>
    <main>
        <p>Générez des pages dans plusieurs langues facilement</p>
    </main>
</body>
</html>
```
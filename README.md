# @ioris/tokenizer-kuromoji

A specialized tokenizer library for Japanese lyrics analysis that provides intelligent text segmentation using the Kuromoji morphological analyzer.

## Overview

`@ioris/tokenizer-kuromoji` integrates with the `@ioris/core` framework to provide advanced lyrics tokenization capabilities. The library focuses on natural phrase breaks and proper handling of mixed Japanese/English content, making it ideal for karaoke applications, music apps, and lyrics analysis tools.

## Features

- **Intelligent Segmentation**: Advanced rule-based system for natural phrase breaks
- **Mixed Language Support**: Seamless handling of Japanese and English text
- **Lyrics-Optimized Rules**: Specialized processing for parentheses, quotes, and repetitive patterns
- **Timeline Preservation**: Maintains temporal relationships while adding logical segmentation
- **Part-of-Speech Analysis**: Leverages Kuromoji's morphological analysis for accurate breaks
- **Extensible Rule System**: Customizable rules for specific use cases

## Installation

```bash
npm install @ioris/tokenizer-kuromoji @ioris/core kuromoji
# or
yarn add @ioris/tokenizer-kuromoji @ioris/core kuromoji
```

## Basic Usage

```javascript
import path from "path";
import { createParagraph } from "@ioris/core";
import { builder } from "kuromoji";
import { LineArgsTokenizer } from "@ioris/tokenizer-kuromoji";

// Initialize kuromoji tokenizer
const kuromojiBuilder = builder({
  dicPath: path.resolve(__dirname, "node_modules/kuromoji/dict")
});

// Get kuromoji tokenizer (Promise)
const getTokenizer = () => new Promise((resolve, reject) => {
  kuromojiBuilder.build((err, tokenizer) => {
    if (err) reject(err);
    resolve(tokenizer);
  });
});

// Usage example
async function example() {
  // Get kuromoji tokenizer instance
  const tokenizer = await getTokenizer();

  // Prepare lyrics data with timeline information
  const lyricData = {
    position: 1,
    timelines: [
      {
        wordID: "",
        begin: 1,
        end: 5,
        text: "あの花が咲いたのは、そこに種が落ちたからで"
      }
    ]
  };

  // Create paragraph with custom tokenizer
  const paragraph = await createParagraph({
    ...lyricData,
    lineTokenizer: (lineArgs) => LineArgsTokenizer({
      lineArgs,
      tokenizer
    })
  });

  // Get processing results with natural breaks
  const lines = paragraph.lines;
  const lineText = lines[0].words
    .map(word => {
      let text = word.timeline.text;
      if (word.timeline.hasNewLine) text += '\n';
      return text;
    })
    .join('');
  
  console.log(lineText);
  // Output: "あの花が\n咲いたのは、\nそこに\n種が落ちたからで"
}

example();
```

## Lyrics Analysis Behavior

This tokenizer divides sentences considering the following characteristics of lyrics:

- Natural breaks based on part-of-speech information (e.g., boundaries between particles and verbs)
- Well-balanced division based on length (appropriate division when lines are too long)
- Preservation of phrases enclosed in parentheses or quotation marks
- Appropriate breaks in mixed Japanese and English text
- Proper handling of repetitive expressions (e.g., "Baby Baby Baby")

## Applying Custom Rules

You can also add your own breakpoint rules:

```javascript
import { LineArgsTokenizer } from "@ioris/tokenizer-kuromoji";
import { DEFAULT_BRAKE_RULES } from "@ioris/tokenizer-kuromoji";

// Example with custom rules
const customRules = [
  ...DEFAULT_BRAKE_RULES,
  {
    // Define your own rule
    current: {
      surface_form: [/^(.*[specific string]).*$/]
    },
    after: {
      pos: [["noun", false]]
    }
  }
];

// Use custom rules
const result = LineArgsTokenizer({
  lineArgs,
  tokenizer,
  brakeRules: customRules
});
```

## License

MIT

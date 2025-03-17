# @ioris/tokenizer-kuromoji

## Overview

`@ioris/tokenizer-kuromoji` is a tokenizer library for lyrics analysis that uses the Japanese morphological analysis engine "Kuromoji". This library is designed to be used in conjunction with `@ioris/core`, providing functionality to detect natural breaks in lyrics and divide them into meaningful phrases.

## Features

- Rule sets specialized for phrase segmentation in lyrics
- Proper handling of mixed Japanese and English lyrics
- Special processing for parentheses and symbols
- Natural break point detection using part-of-speech information

## Installation

```bash
npm install @ioris/tokenizer-kuromoji @ioris/core kuromoji
# or
yarn add @ioris/tokenizer-kuromoji @ioris/core kuromoji
```

## Basic Usage

```javascript
import path from "path";
import { Paragraph } from "@ioris/core";
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

  // Prepare lyrics data
  const lyricData = {
    lyricID: "1",
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

  // Create and initialize Paragraph instance
  const paragraph = await new Paragraph({
    ...lyricData,
    lineTokenizer: (lineArgs) => LineArgsTokenizer({
      lineArgs,
      tokenizer
    })
  }).init();

  // Get processing results
  const lines = paragraph.allLines();
  console.log(lines[0].text());
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

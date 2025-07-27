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

## How It Works

The tokenizer analyzes lyrics using advanced linguistic rules to create natural phrase breaks:

### Intelligent Break Detection
- **Part-of-Speech Analysis**: Uses Kuromoji's morphological analysis to identify grammatical boundaries
- **Context Awareness**: Considers before/current/after token relationships for accurate segmentation
- **Length Optimization**: Balances phrase length for optimal readability and singing
- **Mixed Language Handling**: Seamlessly processes Japanese-English transitions

### Special Lyrics Processing
- **Parentheses & Quotes**: Preserves phrases enclosed in brackets, parentheses, or quotation marks
- **Repetitive Patterns**: Handles repetitive expressions like "Baby Baby Baby" intelligently
- **Punctuation Sensitivity**: Respects natural pauses indicated by punctuation marks
- **Timeline Preservation**: Maintains original timing information while adding segmentation

### Example Transformations

```
Input:  "あの花が咲いたのは、そこに種が落ちたからで"
Output: "あの花が\n咲いたのは、\nそこに\n種が落ちたからで"

Input:  "Baby Baby Baby 君を抱きしめていたい"
Output: "Baby\nBaby\nBaby\n君を抱きしめていたい"

Input:  "Oh, I can't help falling in love with you"
Output: "Oh,\nI can't help falling in love with you"
```

## API Reference

### LineArgsTokenizer

The main tokenization function that processes timeline data with intelligent segmentation.

```typescript
function LineArgsTokenizer(options: {
  lineArgs: CreateLineArgs;
  tokenizer: Tokenizer<IpadicFeatures>;
  brakeRules?: TokenizeRule[];
  whitespaceRules?: TokenizeRule[];
}): Promise<Map<number, CreateLineArgs>>
```

#### Parameters

- `lineArgs`: Input timeline data containing text and timing information
- `tokenizer`: Kuromoji tokenizer instance for morphological analysis
- `brakeRules`: Optional custom rules for line breaks (defaults to `DEFAULT_BRAKE_RULES`)
- `whitespaceRules`: Optional custom rules for whitespace handling (defaults to `DEFAULT_WHITESPACE_RULES`)

#### Returns

A Map containing segmented line data with natural break points and preserved timing information.

## Custom Rules

You can extend the tokenizer with custom break point rules:

```javascript
import { LineArgsTokenizer, DEFAULT_BRAKE_RULES } from "@ioris/tokenizer-kuromoji";

// Define custom rules
const customRules = [
  ...DEFAULT_BRAKE_RULES,
  {
    // Break after specific patterns
    current: {
      surface_form: [/^(.*特定の文字列).*$/]
    },
    after: {
      pos: [["名詞", false]]
    }
  }
];

// Apply custom rules
const result = await LineArgsTokenizer({
  lineArgs,
  tokenizer,
  brakeRules: customRules
});
```

### Rule Structure

Rules use the `TokenizeRule` interface with conditions for:
- `before`: Conditions for the previous token
- `current`: Conditions for the current token  
- `after`: Conditions for the next token
- `length`: Length-based constraints
- `insert`: Where to insert the break ("before" or "current")

## Development

### Building

```bash
npm run build        # Full build process
npm run build:types  # TypeScript declarations only
npm run build:esbuild # ESBuild compilation only
```

### Testing

```bash
npm test            # Run all tests
npm run test -- --watch  # Watch mode
```

### Code Quality

```bash
npm run lint        # Check code quality
npm run format      # Auto-fix formatting
```

## Use Cases

- **Karaoke Applications**: Generate natural phrase breaks for synchronized lyrics display
- **Music Apps**: Improve lyrics readability with intelligent segmentation
- **Lyrics Analysis**: Analyze song structure and linguistic patterns
- **Subtitle Generation**: Create well-formatted subtitles for music videos
- **Language Learning**: Study Japanese lyrics with proper phrase boundaries

## Requirements

- Node.js 16.0 or higher
- TypeScript 5.0 or higher (for development)
- `@ioris/core` ^0.3.2
- `kuromoji` ^0.1.2

## License

MIT

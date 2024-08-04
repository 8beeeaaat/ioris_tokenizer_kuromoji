import { LineCreateArgs, WordTimeline } from '@ioris/core';
import { IpadicFeatures, Tokenizer } from 'kuromoji';

type RuleInput = RegExp | [...string[], boolean];

const DEBUG = process.env.NODE_ENV !== 'production'; // or false, depending on your needs

export type TokenizeRule = {
  before?: {
    [key in keyof IpadicFeatures]?: RuleInput[];
  };
  current?: {
    [key in keyof IpadicFeatures]?: RuleInput[];
  };
  after?: {
    [key in keyof IpadicFeatures]?: RuleInput[];
  };
  length?: {
    current?: {
      largerThan?: number;
      shorterThan?: number;
      nextIsLastTokenInWord?: boolean;
    };
    after?: {
      largerThan?: number;
      shorterThan?: number;
      nextIsLastTokenInWord?: boolean;
    };
    remaining?: {
      largerThan?: number;
      shorterThan?: number;
      nextIsLastTokenInWord?: boolean;
      forLastToken?: boolean;
    };
  };
  insert?: 'before' | 'current';
};

const regExpAlphabetOrNumber = new RegExp(/^(.*[a-zA-Z1-9'"`]).*$/);
const regExpNotAlphabetOrNumber = new RegExp(/^(?!.*[a-zA-Z1-9'"`]).*$/);
const regExpPeriod = new RegExp(/^(.*[.,!?]).*$/);
const regExpWhitespace = new RegExp(/^\s+$/);

export const DEFAULT_BRAKE_RULES: TokenizeRule[] = [
  {
    before: {
      surface_form: [regExpAlphabetOrNumber],
    },
    current: {
      surface_form: [regExpWhitespace],
    },
    after: {
      surface_form: [regExpNotAlphabetOrNumber],
    },
    length: {
      remaining: {
        largerThan: 5,
      },
    },
    insert: 'before',
  },
  {
    before: {
      surface_form: [regExpNotAlphabetOrNumber],
    },
    current: {
      surface_form: [regExpWhitespace],
    },
    after: {
      surface_form: [regExpAlphabetOrNumber],
    },
    length: {
      remaining: {
        largerThan: 5,
      },
    },
    insert: 'before',
  },
  {
    before: {
      surface_form: [regExpNotAlphabetOrNumber],
    },
    current: {
      surface_form: [regExpWhitespace],
    },
    length: {
      remaining: {
        largerThan: 8,
      },
    },
    insert: 'before',
  },
  {
    before: {
      surface_form: [regExpNotAlphabetOrNumber],
    },
    current: {
      surface_form: [regExpWhitespace],
    },
    after: {
      surface_form: [regExpNotAlphabetOrNumber],
    },
    insert: 'before',
  },
  {
    current: {
      surface_form: [regExpPeriod],
    },
    length: {
      remaining: {
        largerThan: 8,
        forLastToken: true,
      },
    },
  },
  {
    current: {
      pos_detail_1: [['読点', false]],
    },
  },
  {
    before: {
      pos: [['名詞', false]],
      pos_detail_1: [['固有名詞', false]],
    },
    current: {
      pos: [['名詞', false]],
      pos_detail_1: [['一般', false]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['固有名詞', false]],
    },
  },
  {
    before: {
      pos: [['名詞', false]],
      pos_detail_1: [['接尾', true]],
    },
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['格助詞', false]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['サ変接続', true]],
    },
  },
  {
    before: {
      pos: [['名詞', false]],
      pos_detail_1: [['接尾', false]],
    },
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['格助詞', false]],
    },
    after: {
      pos: [['名詞', false]],
    },
  },
  {
    current: {
      pos: [['名詞', false]],
      pos_detail_1: [['形容動詞語幹', false]],
    },
    after: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
    },
  },
  {
    before: {
      pos: [['名詞', false]],
      pos_detail_1: [['一般', '固有名詞', '数', false]],
    },
    current: {
      pos: [['名詞', false]],
      pos_detail_1: [['接尾', false]],
      pos_detail_2: [['助数詞', false]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['接尾', false]],
      pos_detail_2: [['一般', true]],
    },
  },
  {
    before: {
      pos: [['名詞', false]],
      pos_detail_1: [['一般', '固有名詞', false]],
    },
    current: {
      pos: [['名詞', false]],
      pos_detail_1: [['接尾', false]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['一般', '固有名詞', false]],
    },
    length: {
      remaining: {
        nextIsLastTokenInWord: true,
      },
    },
  },
  {
    before: {
      pos: [['助詞', false]],
      pos_detail_1: [['連体化', false]],
    },
    current: {
      pos: [['名詞', false]],
      pos_detail_1: [['一般', false]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['接尾', false]],
    },
    length: {
      remaining: {
        largerThan: 4,
      },
    },
  },
  {
    before: {
      pos: [['助詞', false]],
      pos_detail_1: [['格助詞', false]],
    },
    current: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
    },
    length: {
      remaining: {
        nextIsLastTokenInWord: true,
        largerThan: 4,
      },
    },
  },
  {
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['格助詞', false]],
    },
    after: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
      conjugated_form: [['連用タ接続', false]],
    },
    length: {
      remaining: {
        largerThan: 4,
      },
    },
  },
  {
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['格助詞', false]],
      pos_detail_2: [['引用', false]],
    },
    after: {
      pos: [['動詞', false], ['助詞', false]],
      pos_detail_1: [['係助詞', true]],
    },
  },
  {
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['接続助詞', '終助詞', false]],
    },
    after: {
      pos: [['名詞', false]],
    },
  },
  {
    before: {
      pos: [['助詞', false]],
      pos_detail_1: [['連体化', false]],
    },
    current: {
      pos: [['名詞', false]],
      pos_detail_1: [['一般', false]],
    },
    after: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
    },
  },
  {
    before: {
      pos: [['名詞', false]],
      pos_detail_1: [['接尾', true]],
    },
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['連体化', false]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['サ変接続', false]],
    },
  },
  {
    before: {
      pos: [['名詞', false]],
    },
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['副助詞', false]],
    },
    after: {
      pos: [['名詞', false]],
    },
  },
  {
    before: {
      pos: [['名詞', false]],
    },
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['副助詞', false]],
    },
    after: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
      conjugated_form: [['連用形', true]],
    },
  },
  {
    current: {
      pos: [['名詞', false]],
      pos_detail_1: [['非自立', false]],
      pos_detail_2: [['副詞可能', false]],
    },
    after: {
      pos: [['副詞', false]],
    },
  },
  {
    before: {
      pos: [['副詞', false]],
    },
    current: {
      pos: [['名詞', false]],
    },
    after: {
      pos: [['名詞', false]],
    },
  },

  {
    before: {
      pos: [['助詞', false]],
      pos_detail_1: [['格助詞', true]],
    },
    current: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
      conjugated_type: [['五段・タ行', true]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['非自立', true]],
    },
    length: {
      after: {
        nextIsLastTokenInWord: false,
      },
    },
  },
  {
    before: {
      pos: [['助詞', false]],
      pos_detail_1: [['格助詞', false]],
    },
    current: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['非自立', '副詞可能', true]],
    },
  },
  {
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['係助詞', false]],
    },
    after: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
      conjugated_form: [['連用形', '未然ウ接続', true]],
    },
  },
  {
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['係助詞', false]],
    },
    after: {
      pos: [['名詞', '副詞', false]],
    },
    length: {
      after: {
        nextIsLastTokenInWord: false,
      },
    },
  },

  {
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['格助詞', false]],
    },
    after: {
      pos: [['連体詞', false]],
    },
  },


  {
    before: {
      pos: [['助動詞', false]],
    },
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['格助詞', false]],
    },
    after: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
    },
  },
  {
    before: {
      pos: [['助動詞', false]],
    },
    current: {
      pos: [['名詞', false]],
      pos_detail_1: [['一般', false]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['一般', false]],
    },
    length: {
      after: {
        nextIsLastTokenInWord: false,
      },
    },
  },
  {
    current: {
      pos: [['助動詞', false]],
      conjugated_form: [['体言接続', true]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['非自立', '副詞可能', true]],
    },
  },
  {
    current: {
      pos: [['助動詞', false]],
      conjugated_form: [['仮定形', false]],
    },
    after: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
    },
  },
  {
    before: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
    },
    current: {
      pos: [['助詞', false]],
      pos_detail_1: [['接続助詞', false]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['形容動詞語幹', false]],
    },
  },
  {
    before: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
    },
    current: {
      pos: [['名詞', false]],
      pos_detail_1: [['非自立', false]],
    },
    after: {
      pos: [['動詞', false]],
      pos_detail_1: [['自立', false]],
    },
  },
  {
    current: {
      pos: [['形容詞', false]],
      pos_detail_1: [['自立', false]],
    },
    after: {
      pos: [['名詞', false]],
      pos_detail_1: [['接尾', true]],
    },
    length: {
      remaining: {
        largerThan: 10,
      },
    },
  },
];

export const DEFAULT_WHITESPACE_RULES: TokenizeRule[] = [
  {
    after: {
      surface_form: [regExpWhitespace],
    },
  },
];

export async function LineArgsTokenizer(props: {
  lineArgs: LineCreateArgs;
  tokenizer: Tokenizer<IpadicFeatures>;
  brakeRules?: TokenizeRule[];
  whitespaceRules?: TokenizeRule[];
}): Promise<Map<number, LineCreateArgs>> {
  const { lineArgs, tokenizer } = props;
  const tokensByLinePosition = lineArgs.timelines.reduce<
    Map<
      number,
      Map<number, { features: IpadicFeatures; timeline: WordTimeline }>
    >
  >((acc, timeline, index) => {
    const timelinePosition = index + 1;
    const tokens = tokenizer.tokenize(timeline.text);
    const last = acc.get(timelinePosition) || new Map();

    tokens.forEach((features) => {
      const currentWordText = timeline.text || '';
      const currentFeaturesText = Array.from(
        acc.get(timelinePosition)?.values() || []
      )
        .map((token) => token.features.surface_form)
        .join('');

      if (last.size === 0) {
        last.set(1, {
          features,
          timeline,
        });
        acc.set(timelinePosition, last);
        return;
      }

      if (currentWordText === currentFeaturesText) {
        const timeline = lineArgs.timelines[acc.size];
        const newMap = new Map();
        newMap.set(1, {
          features,
          timeline,
        });
        acc.set(timelinePosition, newMap);
      } else {
        const timeline = lineArgs.timelines[timelinePosition - 1];
        if (timeline) {
          last.set(last.size + 1, {
            features,
            timeline,
          });
          acc.set(timelinePosition, last);
        }
      }
    });

    return acc;
  }, new Map());

  return convertTokensToLineArgs(
    tokensByLinePosition,
    props.brakeRules,
    props.whitespaceRules
  );
}

function convertTokensToLineArgs(
  tokensByLinePosition: Map<
    number,
    Map<number, { features: IpadicFeatures; timeline: WordTimeline }>
  >,
  brakeRules: TokenizeRule[] = DEFAULT_BRAKE_RULES,
  whitespaceRules: TokenizeRule[] = DEFAULT_WHITESPACE_RULES
): Map<number, LineCreateArgs> {
  return Array.from(tokensByLinePosition).reduce<Map<number, LineCreateArgs>>(
    (lineAcc, [linePosition, tokens]) => {
      const lineTokens = Array.from(tokens);
      const last = lineTokens.at(-1)?.[1];
      const lastToken = last ? last.features : undefined;
      const wordsMap: LineCreateArgs['timelines'] = lineTokens.reduce<
        LineCreateArgs['timelines']
      >((wordAcc, [wordPosition, { features, timeline }]) => {
        const durationByChar = parseFloat(
          (
            (timeline.end - timeline.begin) /
            timeline.text.replaceAll(/\s+/g, '').length
          ).toFixed(3)
        );
        const duration = durationByChar * features.surface_form.length;
        const begin =
          wordPosition === 1
            ? timeline.begin
            : wordAcc[wordAcc.length - 1]?.end || 0;
        const beforeFeatures = tokens.get(wordPosition - 1)?.features;
        const nextFeatures = tokens.get(wordPosition + 1)?.features;

        const lastTokenInWord = wordPosition === tokens.size;
        const nextIsLastTokenInWord =
          tokens.get(wordPosition + 2)?.features === undefined;

        const remainSpaceIndexes = timeline.text
          .split('')
          .reduce<number[]>((acc, char, index) => {
            if (char === ' ') {
              acc.push(index);
            }
            return acc;
          }, []);

        const nextSpaceIndex = remainSpaceIndexes.find(
          (index) => index > features.word_position
        );

        const remainLengthBetweenNextSpace = nextSpaceIndex
          ? nextSpaceIndex +
          1 -
          features.word_position -
          features.surface_form.length
          : 0;

        const remainTextLengthForLineEnd = lastToken
          ? lastToken.word_position +
          lastToken.surface_form.length -
          features.word_position -
          features.surface_form.length
          : 0;

        const hasNewLine = checkMatchedRules({
          beforeFeatures,
          features,
          nextFeatures,
          lastTokenInWord,
          nextIsLastTokenInWord,
          rules: brakeRules,
          remainLengthBetweenNextSpace,
          remainTextLengthForLineEnd,
        });
        const hasWhitespace = checkMatchedRules({
          beforeFeatures,
          features,
          nextFeatures,
          lastTokenInWord,
          nextIsLastTokenInWord,
          rules: whitespaceRules,
          remainLengthBetweenNextSpace,
          remainTextLengthForLineEnd,
        });

        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.table({
            beforeFeatures,
            features,
            nextFeatures,
            remainLengthBetweenNextSpace,
            remainTextLengthForLineEnd,
            nextIsLastTokenInWord,
            // hasNewLine,
            // hasWhitespace,
          });
          console.dir(hasNewLine, { depth: null });
        }

        const hasNewLineMatchedRule = hasNewLine.matchedRule !== undefined;

        if (
          hasNewLineMatchedRule &&
          hasNewLine.matchedRule?.insert === 'before'
        ) {
          wordAcc[wordAcc.length - 1].hasNewLine = true;
        }

        if (features.surface_form.match(/^\s+$/)) {
          return wordAcc;
        }

        const end = lastTokenInWord
          ? timeline.end
          : parseFloat((begin + duration).toFixed(3));

        wordAcc.push({
          begin,
          end,
          text: features.surface_form,
          hasNewLine:
            hasNewLineMatchedRule &&
            (hasNewLine.matchedRule?.insert === undefined ||
              hasNewLine.matchedRule?.insert === 'current'),
          hasWhitespace: hasWhitespace.matchedRule !== undefined,
        });
        return wordAcc;
      }, []);

      lineAcc.set(lineAcc.size + 1, {
        position: linePosition,
        timelines: wordsMap,
      });
      return lineAcc;
    },
    new Map<number, LineCreateArgs>()
  );
}

function isMatchRule(
  input: RuleInput,
  value: IpadicFeatures[keyof IpadicFeatures]
): boolean {
  if (value === undefined || typeof value !== 'string') {
    return false;
  }
  if (Array.isArray(input)) {
    const values = input.slice(0, -1);
    return input.at(-1)
      ? values.every((v) => v !== value)
      : values.some((v) => v === value);
  }
  return input.test(value);
}

function checkMatchedRules(props: {
  rules: TokenizeRule[];
  beforeFeatures: IpadicFeatures | undefined;
  features: IpadicFeatures;
  nextFeatures: IpadicFeatures | undefined;
  lastTokenInWord: boolean;
  nextIsLastTokenInWord: boolean;
  remainLengthBetweenNextSpace: number;
  remainTextLengthForLineEnd: number;
}): {
  matchedRule: TokenizeRule | undefined;
  before: boolean;
  current: boolean;
  after: boolean;
  common: boolean;
} {
  const ret: {
    matchedRule: TokenizeRule | undefined;
    before: boolean;
    current: boolean;
    after: boolean;
    common: boolean;
  } = {
    matchedRule: undefined,
    before: false,
    current: false,
    after: false,
    common: false,
  };
  if (props.lastTokenInWord) {
    return ret;
  }

  props.rules.some((rule) => {
    const beforeMatch = Object.keys(rule.before || {}).every((key) => {
      return rule.before
        ? rule.before[key as keyof IpadicFeatures]?.some((input) => {
          const featureKey = key as keyof IpadicFeatures;
          if (!props.beforeFeatures || !props.beforeFeatures[featureKey]) {
            return false;
          }
          return isMatchRule(input, props.beforeFeatures[featureKey]);
        }) === true
        : false;
    });

    const currentMatch = Object.keys(rule.current || {}).every((key) => {
      const { current, length } = rule;
      const nextIsLastTokenInWord =
        length && length.remaining
          ? length.remaining.nextIsLastTokenInWord === undefined
            ? true
            : props.nextIsLastTokenInWord ===
            length.remaining.nextIsLastTokenInWord
          : true;

      const remainLengthPassed = length?.remaining
        ? length.remaining.largerThan
          ? (length.remaining.forLastToken ||
            props.remainLengthBetweenNextSpace === 0
            ? props.remainTextLengthForLineEnd
            : props.remainLengthBetweenNextSpace) >=
          length.remaining.largerThan
          : length.remaining.shorterThan
            ? (length.remaining.forLastToken ||
              props.remainLengthBetweenNextSpace === 0
              ? props.remainTextLengthForLineEnd
              : props.remainLengthBetweenNextSpace) <=
            length.remaining.shorterThan
            : true
        : true;

      const lengthPassed = length?.current
        ? length.current.largerThan
          ? props.features.surface_form.length >= length.current.largerThan
          : length.current.shorterThan
            ? props.features.surface_form.length <= length.current.shorterThan
            : true
        : true;

      return current
        ? current[key as keyof IpadicFeatures]?.some((input) => {
          const featureKey = key as keyof IpadicFeatures;
          if (!props.features[featureKey]) {
            return false;
          }
          return isMatchRule(input, props.features[featureKey]);
        }) === true &&
        nextIsLastTokenInWord &&
        remainLengthPassed &&
        lengthPassed
        : false;
    });

    const afterMatch = Object.keys(rule.after || {}).every((key) => {
      const { after, length } = rule;
      const nextIsLastTokenInWord =
        props.nextIsLastTokenInWord && length?.after
          ? length.after.nextIsLastTokenInWord === true
          : true;

      const remainLengthPassed =
        length?.after && props.nextFeatures?.surface_form
          ? length.after.largerThan
            ? props.nextFeatures.surface_form.length >= length.after.largerThan
            : length.after.shorterThan
              ? props.nextFeatures.surface_form.length <= length.after.shorterThan
              : true
          : true;

      return after
        ? after[key as keyof IpadicFeatures]?.some((input) => {
          const featureKey = key as keyof IpadicFeatures;
          if (!props.nextFeatures || !props.nextFeatures[featureKey]) {
            return false;
          }
          return isMatchRule(input, props.nextFeatures[featureKey]);
        }) === true &&
        nextIsLastTokenInWord &&
        remainLengthPassed
        : false;
    });

    ret.before = beforeMatch;
    ret.current = currentMatch;
    ret.after = afterMatch;

    if (beforeMatch && currentMatch && afterMatch) {
      ret.matchedRule = rule;
      ret.before = true;
      ret.current = true;
      ret.after = true;
      return true;
    }
  });

  return ret;
}

export default LineArgsTokenizer;

import { LineCreateArgs, WordTimeline } from '@ioris/core';
import { IpadicFeatures, Tokenizer } from 'kuromoji';

type RuleInput = RegExp | [string, boolean?];

const DEBUG = false;

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
    insert: 'before',
  },
  {
    before: {
      surface_form: [regExpWhitespace],
    },
    current: {
      surface_form: [regExpNotAlphabetOrNumber],
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
    insert: 'before',
  },
  {
    current: {
      surface_form: [regExpPeriod],
    },
  },
  {
    current: {
      pos_detail_1: [['読点']],
    },
  },
  {
    current: {
      pos: [['名詞']],
      pos_detail_1: [['一般']],
    },
    after: {
      pos: [['名詞']],
      pos_detail_1: [['一般'], ['接尾']],
    },
  },
  {
    current: {
      pos: [['助詞']],
      pos_detail_1: [['格助詞']],
    },
    after: {
      pos: [['動詞']],
      pos_detail_1: [['自立']],
      conjugated_form: [['連用タ接続']],
    },
  },
  {
    current: {
      pos: [['助詞']],
      pos_detail_1: [['格助詞'], ['接続助詞']],
    },
    after: {
      pos: [['名詞']],
      pos_detail_1: [['一般']],
    },
  },
  {
    current: {
      pos: [['助詞']],
      pos_detail_1: [['連体化'], ['副助詞']],
    },
    after: {
      pos: [['名詞']],
    },
  },
  {
    current: {
      pos: [['助詞']],
      pos_detail_1: [['係助詞']],
    },
    after: {
      pos: [['動詞']],
      pos_detail_1: [['自立']],
      conjugated_form: [['連用形', true]],
    },
  },
  {
    current: {
      pos: [['助詞']],
      pos_detail_1: [['係助詞']],
    },
    after: {
      pos: [['副詞']],
    },
  },
  {
    current: {
      pos: [['助動詞']],
      conjugated_form: [['体言接続', true]],
    },
    after: {
      pos: [['名詞']],
      pos_detail_1: [['非自立', true]],
    },
  },
  {
    current: {
      pos: [['形容詞']],
      pos_detail_1: [['自立']],
    },
    after: {
      pos: [['名詞']],
      pos_detail_1: [['接尾', true]],
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
      const wordsMap: LineCreateArgs['timelines'] = Array.from(tokens).reduce<
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
        const lastTokenInWord = wordPosition === tokens.size;
        const beforeFeatures = tokens.get(wordPosition - 1)?.features;
        const afterFeatures = tokens.get(wordPosition + 1)?.features;
        const hasNewLine = checkMatchedRules({
          beforeFeatures,
          features,
          afterFeatures,
          lastTokenInWord,
          rules: brakeRules,
        });
        const hasWhitespace = checkMatchedRules({
          beforeFeatures,
          features,
          afterFeatures,
          lastTokenInWord,
          rules: whitespaceRules,
        });

        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.table({
            beforeFeatures,
            features,
            afterFeatures,
            hasNewLine,
            hasWhitespace,
          });
        }

        if (
          hasNewLine.matchedRule !== undefined &&
          hasNewLine.matchedRule.insert === 'before'
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
            hasNewLine.matchedRule !== undefined &&
            (hasNewLine.matchedRule.insert === undefined ||
              hasNewLine.matchedRule.insert === 'current'),
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
    return input[1] ? input[0] !== value : input[0] === value;
  }
  return input.test(value);
}

function checkMatchedRules(props: {
  rules: TokenizeRule[];
  beforeFeatures: IpadicFeatures | undefined;
  features: IpadicFeatures;
  afterFeatures: IpadicFeatures | undefined;
  lastTokenInWord: boolean;
}): {
  matchedRule: TokenizeRule | undefined;
  before: boolean;
  current: boolean;
  after: boolean;
} {
  const ret: {
    matchedRule: TokenizeRule | undefined;
    before: boolean;
    current: boolean;
    after: boolean;
  } = {
    matchedRule: undefined,
    before: false,
    current: false,
    after: false,
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
      return rule.current
        ? rule.current[key as keyof IpadicFeatures]?.some((input) => {
          const featureKey = key as keyof IpadicFeatures;
          if (!props.features[featureKey]) {
            return false;
          }
          return isMatchRule(input, props.features[featureKey]);
        }) === true
        : false;
    });

    const afterMatch = Object.keys(rule.after || {}).every((key) => {
      return rule.after
        ? rule.after[key as keyof IpadicFeatures]?.some((input) => {
          const featureKey = key as keyof IpadicFeatures;
          if (!props.afterFeatures || !props.afterFeatures[featureKey]) {
            return false;
          }
          return isMatchRule(input, props.afterFeatures[featureKey]);
        }) === true
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

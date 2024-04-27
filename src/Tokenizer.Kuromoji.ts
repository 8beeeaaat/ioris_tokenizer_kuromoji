import { LineArgs, WordTimeline } from '@ioris/core';
import { IpadicFeatures, Tokenizer } from 'kuromoji';

type RuleInput = RegExp | [string, boolean?];

type Rule = {
  current?: {
    [key in keyof IpadicFeatures]?: RuleInput[];
  };
  after?: {
    [key in keyof IpadicFeatures]?: RuleInput[];
  };
};

const regExpNotAlphabetOrNumber = new RegExp(/^(?!.*[a-zA-Z1-9'"`]).*$/);
const regExpPeriod = new RegExp(/^(.*[.,!?]).*$/);

const brakeRules: Rule[] = [
  {
    current: {
      surface_form: [regExpNotAlphabetOrNumber, regExpPeriod],
    },
    after: {
      pos_detail_1: [['空白']],
    },
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

const whitespaceRules: Rule[] = [
  {
    after: {
      pos_detail_1: [['空白']],
    },
  },
];

export function LineArgsTokenizer(props: {
  tokenizer: Tokenizer<IpadicFeatures>;
  lineArgs: LineArgs;
}): Map<number, LineArgs> {
  const { tokenizer, lineArgs } = props;
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

  return convertTokensToLineArgs(tokensByLinePosition);
}

function convertTokensToLineArgs(
  tokensByLinePosition: Map<
    number,
    Map<number, { features: IpadicFeatures; timeline: WordTimeline }>
  >
): Map<number, LineArgs> {
  return Array.from(tokensByLinePosition).reduce<Map<number, LineArgs>>(
    (lineAcc, [linePosition, tokens]) => {
      const wordsMap: LineArgs['timelines'] = Array.from(tokens).reduce<
        LineArgs['timelines']
      >((wordAcc, [wordPosition, { features, timeline }]) => {
        if (features.surface_form.match(/^\s+$/)) {
          return wordAcc;
        }

        const durationByChar =
          (timeline.end - timeline.begin) / timeline.text.length;
        const duration = durationByChar * features.surface_form.length;
        const begin =
          wordPosition === 1
            ? timeline.begin
            : wordAcc[wordAcc.length - 1]?.end || 0;
        const lastTokenInWord = wordPosition === tokens.size;
        const afterFeatures = tokens.get(wordPosition + 1)?.features;
        const hasNewLine = checkMatchedRules({
          features,
          afterFeatures,
          lastTokenInWord,
          rules: brakeRules,
        });
        const hasWhitespace = checkMatchedRules({
          features,
          afterFeatures,
          lastTokenInWord,
          rules: whitespaceRules,
        });

        wordAcc.push({
          begin,
          end: begin + duration,
          text: features.surface_form,
          hasNewLine,
          hasWhitespace,
        });
        return wordAcc;
      }, []);

      lineAcc.set(lineAcc.size + 1, {
        position: linePosition,
        timelines: wordsMap,
      });
      return lineAcc;
    },
    new Map<number, LineArgs>()
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
  rules: Rule[];
  features: IpadicFeatures;
  afterFeatures: IpadicFeatures | undefined;
  lastTokenInWord: boolean;
}): boolean {
  if (props.lastTokenInWord) {
    return false;
  }

  return props.rules.some((rule) => {
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
    return currentMatch && afterMatch;
  });
}

export default LineArgsTokenizer;

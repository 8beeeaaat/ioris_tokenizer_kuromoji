import type { LineCreateArgs, WordTimeline } from "@ioris/core";
import type { IpadicFeatures, Tokenizer } from "kuromoji";
import {
  DEFAULT_BRAKE_RULES,
  DEFAULT_WHITESPACE_RULES,
  regExpCloseParentheses,
  regExpNotAlphabetOrNumber,
} from "./rules";

type RuleInput = RegExp | [...string[], boolean];

const DEBUG = process.env.NODE_ENV !== "production";

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
    past?: {
      largerThan?: number;
      shorterThan?: number;
      forFirstToken?: boolean;
    };
    remaining?: {
      largerThan?: number;
      shorterThan?: number;
      nextIsLastTokenInWord?: boolean;
      forLastToken?: boolean;
    };
  };
  insert?: "before" | "current";
};

function countNonParenthesesCharacters(text: string):
  | {
      begin: number;
      end: number;
      text: string;
    }[]
  | undefined {
  // "", '', `` に囲まれた文字列を抽出
  const apostropheMatches = [
    ...text.matchAll(new RegExp(/["'][^"']*["']|`[^`]*`/g)),
  ];
  const parenthesesMatches = [
    ...text.matchAll(
      new RegExp(
        /[\[\(\（「『【〝❝“][^\]\)\）」』】〟❞”]*[\]\)\）」』】〟❞”]/g,
      ),
    ),
  ];
  const matches = [...parenthesesMatches, ...apostropheMatches];

  return [
    ...matches.map((match) => {
      const begin = match.index + 1;
      const end = begin + (match[0].length - 2);
      const extractedText = text.slice(begin, end);
      return {
        begin,
        end,
        text: extractedText,
      };
    }),
  ];
}

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

    // 特殊な文字列はスペースで区切る
    const text = timeline.text.replaceAll(")(", ") (");
    const tokens = tokenizer.tokenize(text);
    const last = acc.get(timelinePosition) || new Map();

    for (const features of tokens) {
      const currentFeaturesText = Array.from(
        acc.get(timelinePosition)?.values() || [],
      )
        .map((token) => token.features.surface_form)
        .join("");

      if (last.size === 0) {
        last.set(1, {
          features,
          timeline,
        });
        acc.set(timelinePosition, last);
        continue;
      }

      if (text === currentFeaturesText) {
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
    }

    return acc;
  }, new Map());

  const args = convertTokensToLineArgs(
    tokensByLinePosition,
    props.brakeRules,
    props.whitespaceRules,
  );

  return args;
}

function convertTokensToLineArgs(
  tokensByLinePosition: Map<
    number,
    Map<number, { features: IpadicFeatures; timeline: WordTimeline }>
  >,
  brakeRules: TokenizeRule[] = DEFAULT_BRAKE_RULES,
  whitespaceRules: TokenizeRule[] = DEFAULT_WHITESPACE_RULES,
): Map<number, LineCreateArgs> {
  let lastHasBrakePosition = 0;
  return Array.from(tokensByLinePosition).reduce<Map<number, LineCreateArgs>>(
    (lineAcc, [linePosition, tokens]) => {
      const lineTokens = Array.from(tokens);
      const first = lineTokens[0]?.[1];
      const firstToken = first ? first.features : undefined;
      const last = lineTokens.at(-1)?.[1];
      const lastToken = last ? last.features : undefined;
      const wordsMap: LineCreateArgs["timelines"] = lineTokens.reduce<
        LineCreateArgs["timelines"]
      >((wordAcc, [wordPosition, { features, timeline }]) => {
        const beforeFeatures = tokens.get(wordPosition - 1)?.features;
        const nextFeatures = tokens.get(wordPosition + 1)?.features;
        const countInParentheses = countNonParenthesesCharacters(timeline.text);
        const hasParentheses = countInParentheses !== undefined;
        const isCloseParentheses =
          hasParentheses && nextFeatures
            ? regExpNotAlphabetOrNumber.test(nextFeatures.surface_form) &&
              countInParentheses.some((parentheses) => {
                return parentheses.end + 1 === features.word_position;
              })
            : false;
        const inParentheses = hasParentheses
          ? countInParentheses
              .filter((parentheses) => {
                return (
                  parentheses.begin < features.word_position &&
                  features.word_position < parentheses.end
                );
              })
              .find((parentheses) => {
                return parentheses.text.length <= 10;
              }) !== undefined
          : false;

        const durationByChar = Number.parseFloat(
          (
            (timeline.end - timeline.begin) /
            timeline.text.replaceAll(/\s+/g, "").length
          ).toFixed(3),
        );
        const duration = durationByChar * features.surface_form.length;
        const begin =
          wordPosition === 1
            ? timeline.begin
            : wordAcc[wordAcc.length - 1]?.end || 0;

        const lastTokenInWord = wordPosition === tokens.size;
        const nextIsLastTokenInWord =
          tokens.get(wordPosition + 2)?.features === undefined;

        const spaceIndexes = timeline.text
          .split("")
          .reduce<number[]>((acc, char, index) => {
            if (char === " ") {
              acc.push(index);
            }
            return acc;
          }, []);

        const nextSpaceIndex = spaceIndexes.find(
          (index) => index > features.word_position,
        );

        const remainLengthBetweenBeforeBrake = lastHasBrakePosition
          ? features.word_position - lastHasBrakePosition
          : 0;

        const remainLengthBetweenNextBrake = nextSpaceIndex
          ? nextSpaceIndex +
            1 -
            features.word_position -
            features.surface_form.length
          : 0;

        const remainTextLengthForLineFirst = firstToken
          ? features.word_position - firstToken.word_position
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
          remainLengthBetweenBeforeBrake,
          remainLengthBetweenNextBrake,
          remainTextLengthForLineFirst,
          remainTextLengthForLineEnd,
        });
        const hasWhitespace = checkMatchedRules({
          beforeFeatures,
          features,
          nextFeatures,
          lastTokenInWord,
          nextIsLastTokenInWord,
          rules: whitespaceRules,
          remainLengthBetweenBeforeBrake,
          remainLengthBetweenNextBrake,
          remainTextLengthForLineFirst,
          remainTextLengthForLineEnd,
        });

        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.table({
            inParentheses,
            lastHasBrakePosition,
            wordPosition,
            beforeFeatures,
            features,
            nextFeatures,
            remainLengthBetweenBeforeBrake,
            remainLengthBetweenNextBrake,
            remainTextLengthForLineFirst,
            remainTextLengthForLineEnd,
            nextIsLastTokenInWord,
            hasNewLine,
            hasWhitespace,
          });
          console.dir(countInParentheses, { depth: null });
          console.dir(hasNewLine, { depth: null });
          console.dir(hasWhitespace, { depth: null });
        }

        const hasNewLineMatchedRule =
          (nextFeatures && isCloseParentheses) ||
          hasNewLine.matchedRule !== undefined;
        if (hasNewLineMatchedRule) {
          lastHasBrakePosition = wordPosition - lastHasBrakePosition;
        }

        if (
          !inParentheses &&
          hasNewLineMatchedRule &&
          hasNewLine.matchedRule?.insert === "before"
        ) {
          wordAcc[wordAcc.length - 1].hasNewLine = true;
        }

        if (features.surface_form.match(/^\s+$/)) {
          if (hasNewLineMatchedRule) {
            wordAcc[wordAcc.length - 1].hasNewLine = true;
          }
          return wordAcc;
        }

        const end = Number.parseFloat((begin + duration).toFixed(3));

        wordAcc.push({
          begin,
          end,
          text: features.surface_form,
          hasNewLine:
            !inParentheses &&
            hasNewLineMatchedRule &&
            hasNewLine.matchedRule?.insert !== "before",
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
    new Map<number, LineCreateArgs>(),
  );
}

function isMatchRule(
  input: RuleInput,
  value: IpadicFeatures[keyof IpadicFeatures],
): boolean {
  if (value === undefined || typeof value !== "string") {
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
  remainLengthBetweenBeforeBrake: number;
  remainLengthBetweenNextBrake: number;
  remainTextLengthForLineFirst: number;
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

  if (props.nextFeatures?.surface_form.match(regExpCloseParentheses)) {
    return ret;
  }

  props.rules.some((rule) => {
    const beforeMatch = rule.before
      ? Object.keys(rule.before).every((key) => {
          return rule.before
            ? rule.before[key as keyof IpadicFeatures]?.some((input) => {
                const featureKey = key as keyof IpadicFeatures;
                if (
                  !props.beforeFeatures ||
                  !props.beforeFeatures[featureKey]
                ) {
                  return false;
                }
                return isMatchRule(input, props.beforeFeatures[featureKey]);
              }) === true
            : false;
        })
      : true;

    const currentMatch = rule.current
      ? Object.keys(rule.current).every((key) => {
          const { current, length } = rule;
          const nextIsLastTokenInWord = length?.remaining
            ? length.remaining.nextIsLastTokenInWord === undefined
              ? true
              : props.nextIsLastTokenInWord ===
                length.remaining.nextIsLastTokenInWord
            : true;

          const pastLengthPassed =
            length === undefined
              ? true
              : length?.past
                ? length.past.largerThan
                  ? (length.past.forFirstToken ||
                    props.remainLengthBetweenBeforeBrake === 0
                      ? props.remainTextLengthForLineFirst
                      : props.remainLengthBetweenBeforeBrake) >=
                    length.past.largerThan
                  : length.past.shorterThan
                    ? (length.past.forFirstToken ||
                      props.remainLengthBetweenBeforeBrake === 0
                        ? props.remainTextLengthForLineFirst
                        : props.remainLengthBetweenBeforeBrake) <=
                      length.past.shorterThan
                    : true
                : true;

          const remainLengthPassed =
            length === undefined
              ? true
              : length?.remaining
                ? length.remaining.largerThan
                  ? (length.remaining.forLastToken ||
                    props.remainLengthBetweenNextBrake === 0
                      ? props.remainTextLengthForLineEnd
                      : props.remainLengthBetweenNextBrake) >=
                    length.remaining.largerThan
                  : length.remaining.shorterThan
                    ? (length.remaining.forLastToken ||
                      props.remainLengthBetweenNextBrake === 0
                        ? props.remainTextLengthForLineEnd
                        : props.remainLengthBetweenNextBrake) <=
                      length.remaining.shorterThan
                    : true
                : true;

          const lengthPassed = length?.current
            ? length.current.largerThan
              ? props.features.surface_form.length >= length.current.largerThan
              : length.current.shorterThan
                ? props.features.surface_form.length <=
                  length.current.shorterThan
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
                pastLengthPassed &&
                remainLengthPassed &&
                lengthPassed
            : false;
        })
      : true;

    const afterMatch = rule.after
      ? Object.keys(rule.after).every((key) => {
          const { after, length } = rule;
          const nextIsLastTokenInWord =
            props.nextIsLastTokenInWord && length?.after
              ? length.after.nextIsLastTokenInWord === true
              : true;

          const remainLengthPassed =
            length?.after && props.nextFeatures?.surface_form
              ? length.after.largerThan
                ? props.nextFeatures.surface_form.length >=
                  length.after.largerThan
                : length.after.shorterThan
                  ? props.nextFeatures.surface_form.length <=
                    length.after.shorterThan
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
        })
      : true;

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

  if (props.lastTokenInWord && ret.matchedRule?.insert !== "before") {
    return {
      matchedRule: undefined,
      before: false,
      current: false,
      after: false,
      common: false,
    };
  }

  return ret;
}

export default LineArgsTokenizer;

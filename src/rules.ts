import type { TokenizeRule } from "./Tokenizer.Kuromoji";

export const regExpAlphabetOrNumber = new RegExp(/^(.*[a-zA-Z1-9]).*$/);
export const regExpNotAlphabetOrNumber = new RegExp(/^(?!.*[a-zA-Z1-9]).*$/);
export const regExpUpperAlphabet = new RegExp(/^(.*[A-Z]).*$/);
export const regExpAlphabet = new RegExp(/^(.*[a-zA-Z]).*$/);
export const regExpNominative = new RegExp(
  /^(?=\b(I|You|We|He|She|They)\b).*$/,
);
export const regExpPeriod = new RegExp(/^(.*[.,、。]).*$/);
export const regExpNotPeriod = new RegExp(/^(?!.*[.,、。]).*$/);
export const regExpMark = new RegExp(/^(.*[!?！？]).*$/);
export const regExpNotMark = new RegExp(/^(?!.*[!?！？]).*$/);
export const regExpWhitespace = new RegExp(/^\s+$/);
export const regExpNotCloseApostrophe = new RegExp(
  /^(?!.*['"`](\s|$)).*$/,
  "g",
);
export const regExpOpenParentheses = new RegExp(
  /^(.*[[(（「『【〝❝“]).*$/,
  "g",
);
export const regExpCloseParentheses = new RegExp(
  /^(.*[\])）」』】〟❞”]).*$/,
  "g",
);
export const regExpHiragana = new RegExp(/^(.*[\u3040-\u309F]).*$/);
export const regExpKatakana = new RegExp(/^(.*[\u30A0-\u30FF]).*$/);
export const regExpKanji = new RegExp(/^(.*[\u4E00-\u9FFF]).*$/);
export const regExpLongNote = new RegExp(/^(.*[ー～]).*$/);
export const regExpNotLongNote = new RegExp(/^(?!.*[ー～]).*$/);

export const DEFAULT_BRAKE_RULES: TokenizeRule[] = [
  {
    before: {
      surface_form: [regExpWhitespace],
    },
    current: {
      surface_form: [regExpUpperAlphabet, regExpOpenParentheses],
    },
    insert: "before",
  },
  {
    after: {
      surface_form: [regExpOpenParentheses],
    },
  },
  {
    after: {
      surface_form: [regExpOpenParentheses],
    },
  },
  {
    current: {
      surface_form: [regExpCloseParentheses],
    },
  },
  {
    before: {
      surface_form: [regExpAlphabetOrNumber],
    },
    current: {
      surface_form: [regExpWhitespace],
    },
    after: {
      surface_form: [regExpNominative],
    },
    insert: "before",
  },
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
    insert: "before",
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
    insert: "before",
  },
  {
    current: {
      surface_form: [regExpAlphabet],
    },
    after: {
      surface_form: [regExpHiragana, regExpKatakana, regExpKanji],
    },
    length: {
      remaining: {
        nextIsLastTokenInWord: false,
      },
    },
  },
  {
    current: {
      surface_form: [regExpHiragana, regExpKatakana, regExpKanji],
    },
    after: {
      surface_form: [regExpAlphabet],
    },
    length: {
      remaining: {
        nextIsLastTokenInWord: false,
      },
    },
  },
  {
    current: {
      surface_form: [regExpKatakana],
    },
    after: {
      surface_form: [regExpHiragana, regExpKanji],
      pos_detail_1: [["格助詞", true]],
    },
    length: {
      past: {
        largerThan: 5,
      },
      remaining: {
        largerThan: 5,
      },
    },
  },
  {
    current: {
      surface_form: [regExpHiragana, regExpKanji],
    },
    after: {
      surface_form: [regExpKatakana],
    },
    length: {
      past: {
        largerThan: 5,
      },
      remaining: {
        largerThan: 5,
      },
    },
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
    insert: "before",
  },
  {
    current: {
      surface_form: [regExpPeriod],
    },
    after: {
      surface_form: [regExpNotPeriod],
    },
  },
  {
    current: {
      surface_form: [regExpMark],
    },
    after: {
      surface_form: [regExpNotMark],
    },
  },
  {
    current: {
      pos_detail_1: [["読点", false]],
    },
  },
  {
    before: {
      pos: [["名詞", false]],
      pos_detail_1: [["固有名詞", false]],
    },
    current: {
      pos: [["名詞", false]],
      pos_detail_1: [["一般", false]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["固有名詞", false]],
      surface_form: [regExpNotMark],
    },
  },
  {
    before: {
      pos: [["名詞", false]],
      pos_detail_1: [["接尾", true]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", false]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["サ変接続", true]],
      surface_form: [regExpNotMark],
    },
  },
  {
    before: {
      pos: [["名詞", false]],
      pos_detail_1: [["接尾", "形容動詞語幹", false]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", "副詞化", false]],
    },
    after: {
      pos: [["名詞", false]],
      surface_form: [regExpNotMark],
    },
  },
  {
    before: {
      pos: [["名詞", false]],
      pos_detail_1: [["接尾", false]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", false]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
  },
  {
    before: {
      pos: [["名詞", false]],
      pos_detail_1: [["一般", false]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["連体化", false]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["副詞可能", false]],
      surface_form: [regExpNotMark],
    },
  },
  {
    before: {
      pos: [["名詞", false]],
      pos_detail_1: [["一般", "固有名詞", "数", false]],
    },
    current: {
      pos: [["名詞", false]],
      pos_detail_1: [["接尾", false]],
      pos_detail_2: [["助数詞", false]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["接尾", false]],
      pos_detail_2: [["一般", true]],
      surface_form: [regExpNotMark],
    },
  },
  {
    before: {
      pos: [["名詞", false]],
      pos_detail_1: [["一般", "固有名詞", false]],
    },
    current: {
      pos: [["名詞", false]],
      pos_detail_1: [["接尾", false]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["一般", "固有名詞", false]],
      surface_form: [regExpNotMark],
    },
    length: {
      remaining: {
        nextIsLastTokenInWord: true,
      },
    },
  },
  {
    before: {
      pos: [["助詞", false]],
      pos_detail_1: [["連体化", false]],
    },
    current: {
      pos: [["名詞", false]],
      pos_detail_1: [["一般", false]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["接尾", false]],
      surface_form: [regExpNotMark],
    },
    length: {
      remaining: {
        largerThan: 4,
      },
    },
  },
  {
    before: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", false]],
    },
    current: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
    length: {
      remaining: {
        nextIsLastTokenInWord: true,
        largerThan: 4,
      },
    },
  },
  {
    before: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", false]],
    },
    current: {
      pos: [["形容詞", false]],
      pos_detail_1: [["自立", false]],
    },
    after: {
      pos: [["名詞", false]],
      surface_form: [regExpNotMark],
    },
  },
  {
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", false]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
      conjugated_form: [["連用タ接続", false]],
    },
    length: {
      remaining: {
        largerThan: 4,
      },
    },
  },
  {
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", false]],
      pos_detail_2: [["引用", false]],
    },
    after: {
      pos: [["動詞", "助詞", false]],
      pos_detail_1: [["係助詞", true]],
    },
  },
  {
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["接続助詞", "終助詞", false]],
    },
    after: {
      pos: [["名詞", false]],
      surface_form: [regExpNotMark],
    },
  },
  {
    before: {
      pos: [["助詞", false]],
      pos_detail_1: [["連体化", false]],
    },
    current: {
      pos: [["名詞", false]],
      pos_detail_1: [["一般", false]],
      surface_form: [regExpNotLongNote],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
  },
  {
    before: {
      pos: [["名詞", false]],
      pos_detail_1: [["接尾", true]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["連体化", false]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["サ変接続", false]],
    },
  },
  {
    before: {
      pos: [["名詞", false]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["副助詞", false]],
    },
    after: {
      pos: [["名詞", false]],
      surface_form: [regExpNotMark],
    },
  },
  {
    before: {
      pos: [["名詞", false]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["副助詞", false]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
      conjugated_form: [["連用形", true]],
    },
  },
  {
    before: {
      pos: [["名詞", false]],
      pos_detail_1: [["固有名詞", false]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", false]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
  },
  {
    current: {
      pos: [["名詞", false]],
      pos_detail_1: [["非自立", false]],
      pos_detail_2: [["副詞可能", false]],
    },
    after: {
      pos: [["副詞", false]],
    },
  },
  {
    before: {
      pos: [["副詞", "連体詞", false]],
    },
    current: {
      pos: [["名詞", false]],
      pos_detail_1: [["数", true]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["接尾", true]],
      surface_form: [regExpNotMark],
    },
  },
  {
    current: {
      pos: [["副詞", false]],
      pos_detail_1: [["助詞類接続", true]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
  },
  {
    before: {
      pos: [["助詞", false]],
      pos_detail_1: [["副助詞", false]],
    },
    current: {
      pos: [["動詞", false]],
    },
    after: {
      pos: [["助詞", false]],
      pos_detail_1: [["接続助詞", false]],
    },
    insert: "before",
  },
  {
    before: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", true]],
    },
    current: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
      conjugated_type: [["五段・タ行", true]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["非自立", "接尾", true]],
      surface_form: [regExpNotLongNote],
    },
    length: {
      after: {
        nextIsLastTokenInWord: false,
      },
    },
  },
  {
    before: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", false]],
    },
    current: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
    after: {
      surface_form: [regExpNotCloseApostrophe],
      pos: [["名詞", false]],
      pos_detail_1: [["非自立", "副詞可能", true]],
    },
  },
  {
    before: {
      pos: [["助詞", false]],
      pos_detail_1: [["接続助詞", false]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", false]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
  },
  {
    before: {
      pos_detail_1: [["空白", true]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["係助詞", false]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
      conjugated_form: [["連用形", "未然ウ接続", true]],
    },
  },
  {
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["係助詞", false]],
    },
    after: {
      pos: [["名詞", "副詞", false]],
    },
    length: {
      past: {
        largerThan: 3,
      },
      after: {
        nextIsLastTokenInWord: false,
      },
    },
  },
  {
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", false]],
    },
    after: {
      pos: [["連体詞", false]],
    },
  },
  {
    before: {
      pos: [["助動詞", false]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["格助詞", false]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
  },
  {
    before: {
      pos: [["助動詞", false]],
    },
    current: {
      pos: [["名詞", false]],
      pos_detail_1: [["一般", false]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["一般", false]],
      surface_form: [regExpNotMark],
    },
    length: {
      after: {
        nextIsLastTokenInWord: false,
      },
    },
  },
  {
    current: {
      pos: [["助動詞", false]],
      conjugated_form: [["体言接続", true]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["非自立", "副詞可能", true]],
      surface_form: [regExpNotMark],
    },
  },
  {
    current: {
      pos: [["助動詞", false]],
      conjugated_form: [["仮定形", false]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
  },
  {
    current: {
      pos: [["助動詞", false]],
    },
    after: {
      pos: [["連体詞", false]],
    },
  },
  {
    before: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["接続助詞", false]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["形容動詞語幹", false]],
      surface_form: [regExpNotMark],
    },
  },
  {
    before: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
    current: {
      pos: [["名詞", false]],
      pos_detail_1: [["非自立", false]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
  },
  {
    before: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
    current: {
      pos: [["助詞", false]],
      pos_detail_1: [["接続助詞", false]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
  },
  {
    current: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["代名詞", false]],
      surface_form: [regExpNotMark],
    },
    length: {
      remaining: {
        nextIsLastTokenInWord: false,
      },
    },
  },
  {
    current: {
      pos: [["形容詞", false]],
      pos_detail_1: [["自立", false]],
    },
    after: {
      pos: [["名詞", false]],
      pos_detail_1: [["接尾", true]],
      surface_form: [regExpNotMark],
    },
    length: {
      remaining: {
        largerThan: 10,
      },
    },
  },
  {
    before: {
      pos: [["形容詞", false]],
      pos_detail_1: [["自立", false]],
    },
    current: {
      pos: [["名詞", false]],
      pos_detail_1: [["非自立", false]],
    },
    after: {
      pos: [["動詞", false]],
      pos_detail_1: [["自立", false]],
    },
  },
  {
    current: {
      pos: [["形容詞", false]],
      pos_detail_1: [["自立", false]],
    },
    after: {
      pos: [["形容詞", false]],
      pos_detail_1: [["自立", false]],
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

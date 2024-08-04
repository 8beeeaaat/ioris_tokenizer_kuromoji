/* eslint-disable quotes */
import { Paragraph, WordTimeline } from '@ioris/core';
import { IpadicFeatures, Tokenizer, builder } from 'kuromoji';
import path from 'path';
import { beforeEach, describe, expect, it } from 'vitest';
import { LineArgsTokenizer } from './Tokenizer.Kuromoji';

const kuromojiBuilder = builder({
  dicPath: path.resolve(__dirname, '../node_modules/kuromoji/dict'),
});

const getTokenizer = (): Promise<Tokenizer<IpadicFeatures>> =>
  new Promise((resolve, reject) => {
    kuromojiBuilder.build((err, tokenizer) => {
      if (err) {
        reject(err);
      }
      resolve(tokenizer);
    });
  });

const timelines: {
  input: WordTimeline;
  want: string;
}[][] = [
    [
      {
        input: {
          wordID: '',
          begin: 1,
          end: 5,
          text: 'あの花が咲いたのは、そこに種が落ちたからで',
        },
        want: 'あの花が\n咲いたのは、\nそこに\n種が落ちたからで',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 6,
          end: 12,
          text: 'いずれにしても立ち去らなければならない彼女は傷つきすぎた',
        },
        want: 'いずれにしても\n立ち去らなければならない\n彼女は傷つきすぎた',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 13,
          end: 14,
          text: 'お前なんかどこか消えちまえと言われた時初めて気付いた',
        },
        want: 'お前なんか\nどこか消えちまえと\n言われた時\n初めて気付いた',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 14,
          end: 15,
          text: '開かないカーテン 割れたカップ流し台の腐乱したキャベツ',
        },
        want: '開かない\nカーテン\n割れた\nカップ\n流し台の\n腐乱した\nキャベツ',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 15,
          end: 16,
          text: '私だけが知っているんだからわがままはとうの昔に止めた',
        },
        want: '私だけが\n知っているんだから\nわがままは\nとうの昔に止めた',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 16,
          end: 17,
          text: '昔嬉しそうに話していた母は今夜もまだ帰らない',
        },
        want: '昔嬉しそうに話していた\n母は\n今夜も\nまだ帰らない',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 21,
          end: 21.5,
          text: '自虐家のアリー波の随に 歌って',
        },
        want: '自虐家のアリー\n波の随に\n歌って',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 21.5,
          end: 22,
          text: '行きたい場所なんて何処にもないここに居させてと泣き喚いた',
        },
        want: '行きたい\n場所なんて\n何処にもない\nここに居させてと\n泣き喚いた',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 22,
          end: 25,
          text: 'Oh, I can\'t help falling in love with you',
        },
        want: 'Oh,\nI can\'t help falling in love with you',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 25,
          end: 26,
          text: '変な感じ 全然慣れないや',
        },
        want: '変な感じ\n全然慣れないや',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 26,
          end: 27,
          text: 'ふたりぼっちでも大作戦 叶えたいことが曇らないように',
        },
        want: 'ふたりぼっちでも大作戦\n叶えたいことが曇らないように',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 27,
          end: 28,
          text: '捨てられない古びた Teddy bear',
        },
        want: '捨てられない古びた\nTeddy bear',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 28,
          end: 29,
          text: 'Baby Baby Baby Baby 君を抱きしめていたい',
        },
        want: 'Baby Baby Baby Baby\n君を抱きしめていたい',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 29,
          end: 30,
          text: 'I’m needing you! I’m needing you!',
        },
        want: 'I’m needing you!\nI’m needing you!',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 30,
          end: 31,
          text: 'I wanna gonna go, go!!',
        },
        want: 'I wanna gonna go, go!!',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 31,
          end: 36,
          text: '君にすすめるよ赤猫',
        },
        want: '君にすすめるよ\n赤猫',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 37,
          end: 38,
          text: 'そんな店の名は赤猫',
        },
        want: 'そんな店の名は\n赤猫',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 38,
          end: 39,
          text: '猫たちが切り盛りする店',
        },
        want: '猫たちが\n切り盛りする店',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 39,
          end: 40,
          text: '機械仕掛けの涙 それに震えるこの心は誰のもの',
        },
        want: '機械仕掛けの涙\nそれに震えるこの心は\n誰のもの',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 40,
          end: 41,
          text: '境界線の向こう側で 打ちのめされて',
        },
        want: '境界線の向こう側で\n打ちのめされて',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 41,
          end: 42,
          text: '昭和生まれ平成令和を駆け抜けるサムライ崩れ',
        },
        want: '昭和生まれ\n平成令和を駆け抜ける\nサムライ崩れ',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 42,
          end: 43,
          text: '泥水でもなんでもすすり二十有余年ジャンクワーカー',
        },
        want: '泥水でも\nなんでもすすり\n二十有余年\nジャンクワーカー',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 43,
          end: 44,
          text: '我武者羅這いつくばって幸せ見つけてやるぜ馬鹿野郎',
        },
        want: '我武者羅\n這いつくばって\n幸せ\n見つけてやるぜ\n馬鹿野郎',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 44,
          end: 45,
          text: 'いつもの店暖簾をくぐれば',
        },
        want: 'いつもの店暖簾をくぐれば',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 45,
          end: 46,
          text: '接客一番味二番で',
        },
        want: '接客一番味二番で',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 46,
          end: 47,
          text: 'いい香りに包まれる',
        },
        want: 'いい香りに包まれる',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 47,
          end: 48,
          text: '虎打ち麺盛り付けも豪華',
        },
        want: '虎打ち麺盛り付けも豪華',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 48,
          end: 49,
          text: '僕を見ていてね、最愛のファタール！',
        },
        want: '僕を見ていてね、\n最愛のファタール！',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 49,
          end: 50,
          text: '生きるために死んで 享楽にえずいて',
        },
        want: '生きるために死んで\n享楽にえずいて',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 50,
          end: 51,
          text: 'ならば生きる為に叫べアイデンティティ',
        },
        want: 'ならば生きる為に叫べ\nアイデンティティ',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 51,
          end: 52,
          text: '不許可の心携えた者の末路に',
        },
        want: '不許可の心\n携えた者の末路に',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 52,
          end: 53,
          text: '誰も伝えたいことなんて無くなったから',
        },
        want: '誰も伝えたいことなんて\n無くなったから',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 53,
          end: 54,
          text: '深い闇も連れとなった',
        },
        want: '深い闇も\n連れとなった',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 54,
          end: 55,
          text: '泣き叫んだ声なき声',
        },
        want: '泣き叫んだ\n声なき声',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 55,
          end: 56,
          text: 'とどのつまり僕ら生まれ変わりのラプソディー',
        },
        want: 'とどのつまり僕ら\n生まれ変わりのラプソディー',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 56,
          end: 57,
          text: 'ぬくもりが消える前にあの日の遠い声',
        },
        want: 'ぬくもりが消える前に\nあの日の遠い声',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 57,
          end: 58,
          text: '会心ノ一撃は逆鱗の末路',
        },
        want: '会心ノ一撃は\n逆鱗の末路',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 58,
          end: 59,
          text: '私が創るんだ',
        },
        want: '私が創るんだ',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 59,
          end: 60,
          text: 'あなたがいないと生きていけない',
        },
        want: 'あなたがいないと\n生きていけない',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 60,
          end: 61,
          text: '身を焼かれるような絶望も糧にはなろうか',
        },
        want: '身を焼かれるような絶望も\n糧にはなろうか',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 61,
          end: 62,
          text: '憧れに焦がれるまま燃やし続けている',
        },
        want: '憧れに焦がれるまま\n燃やし続けている',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 62,
          end: 63,
          text: 'カラカラ渇いて可哀想なlack of 愛？',
        },
        want: 'カラカラ渇いて\n可哀想なlack of 愛？',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 63,
          end: 64,
          text: '六等星の瞬き',
        },
        want: '六等星の瞬き',
      },
    ],
    [
      {
        input: {
          wordID: '',
          begin: 64,
          end: 65,
          text: 'この海になれたら抱きしめてくれるかな',
        },
        want: 'この海になれたら\n抱きしめてくれるかな',
      }
    ],
    [
      {
        input: {
          wordID: '',
          begin: 65,
          end: 66,
          text: '人気の赤猫スペシャル',
        },
        want: '人気の赤猫スペシャル',
      }
    ],
    [
      {
        input: {
          wordID: '',
          begin: 66,
          end: 67,
          text: '君が欲しいものとは少し',
        },
        want: '君が欲しいものとは少し',
      }
    ]
  ];

describe('Paragraph not used Kuromoji Tokenizer', () => {
  let paragraph: Paragraph;

  beforeEach(async () => {
    paragraph = await new Paragraph({
      lyricID: '1',
      position: 1,
      timelines: timelines.map((t) => t.map((l) => l.input)),
    }).init();
  });

  it('should return text of the line', () => {
    expect(paragraph.allLines()[0].text()).toBe(
      'あの花が咲いたのは、そこに種が落ちたからで'
    );
    expect(paragraph.allLines()[0].begin()).toBe(1);
    expect(paragraph.allLines()[1].end()).toBe(12);

    expect(paragraph.allLines()[1].text()).toBe(
      'いずれにしても立ち去らなければならない彼女は傷つきすぎた'
    );
    expect(paragraph.allLines()[3].text()).toBe(
      '開かないカーテン 割れたカップ流し台の腐乱したキャベツ'
    );
    expect(paragraph.allLines()[4].text()).toBe(
      '私だけが知っているんだからわがままはとうの昔に止めた'
    );
    expect(paragraph.allLines()[5].text()).toBe(
      '昔嬉しそうに話していた母は今夜もまだ帰らない'
    );
    expect(paragraph.allLines()[6].text()).toBe(
      '自虐家のアリー波の随に 歌って'
    );
    expect(paragraph.allLines()[7].text()).toBe(
      '行きたい場所なんて何処にもないここに居させてと泣き喚いた'
    );
    expect(paragraph.allLines()[8].text()).toBe(
      'Oh, I can\'t help falling in love with you'
    );
    expect(paragraph.allLines()[9].text()).toBe('変な感じ 全然慣れないや');
    expect(paragraph.allLines()[10].text()).toBe(
      'ふたりぼっちでも大作戦 叶えたいことが曇らないように'
    );
    expect(paragraph.allLines()[10].end()).toBe(27);

    expect(paragraph.allLines()[11].text()).toBe(
      '捨てられない古びた Teddy bear'
    );

    expect(paragraph.allLines()[12].text()).toBe(
      'Baby Baby Baby Baby 君を抱きしめていたい'
    );

    expect(paragraph.allLines()[13].text()).toBe(
      'I’m needing you! I’m needing you!'
    );

    expect(paragraph.allLines()[14].text()).toBe('I wanna gonna go, go!!');

    expect(paragraph.allLines()[15].text()).toBe('君にすすめるよ赤猫');
  });

  it('should return the voids count', () => {
    expect(paragraph.voids().length).toBe(4);
  });
});

describe('Paragraph used Kuromoji Tokenizer', () => {
  let paragraph: Paragraph;

  beforeEach(async () => {
    const tokenizer = await getTokenizer();
    paragraph = await new Paragraph({
      lyricID: '1',
      tokenizer: (lineArgs) =>
        LineArgsTokenizer({
          lineArgs,
          tokenizer,
        }),
      position: 1,
      timelines: timelines.map((t) => t.map((l) => l.input)),
    }).init();
  });

  it('should return text of the line', () => {
    paragraph.allLines().forEach((line, index) => {
      expect(line.text()).toBe(timelines[index][0].want);
    });
  });

  it('wordGridPositionByWordID should return ', () => {
    expect(
      Array.from(
        paragraph.allLines()[6].wordGridPositionByWordID().values()
      ).reduce<
        Array<{
          column: number;
          row: number;
          text: string;
        }>
      >((sum, p) => {
        sum.push({
          column: p.column,
          row: p.row,
          text: p.word.text(),
        });
        return sum;
      }, [])
    ).toStrictEqual([
      {
        column: 1,
        row: 1,
        text: '自虐',
      },
      {
        column: 2,
        row: 1,
        text: '家',
      },
      {
        column: 3,
        row: 1,
        text: 'の',
      },
      {
        column: 4,
        row: 1,
        text: 'アリー',
      },
      {
        column: 1,
        row: 2,
        text: '波',
      },
      {
        column: 2,
        row: 2,
        text: 'の',
      },
      {
        column: 3,
        row: 2,
        text: '随',
      },
      {
        column: 4,
        row: 2,
        text: 'に',
      },
      {
        column: 1,
        row: 3,
        text: '歌っ',
      },
      {
        column: 2,
        row: 3,
        text: 'て',
      },
    ]);
  });

  it('should return the voids count', () => {
    expect(paragraph.voids().length).toBe(4);
  });
});

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

const timelines: WordTimeline[][] = [
  [
    {
      wordID: '',
      begin: 1,
      end: 5,
      text: 'あの花が咲いたのは、そこに種が落ちたからで',
    },
  ],

  [
    {
      wordID: '',
      begin: 6,
      end: 12,
      text: 'いずれにしても立ち去らなければならない彼女は傷つきすぎた',
    },
  ],
  [
    {
      wordID: '',
      begin: 14,
      end: 15,
      text: '開かないカーテン 割れたカップ流し台の腐乱したキャベツ',
    },
  ],
  [
    {
      wordID: '',
      begin: 15,
      end: 16,
      text: '私だけが知っているんだからわがままはとうの昔に止めた',
    },
  ],
  [
    {
      wordID: '',
      begin: 16,
      end: 17,
      text: '昔嬉しそうに話していた母は今夜もまだ帰らない',
    },
  ],
  [
    {
      wordID: '',
      begin: 21,
      end: 21.5,
      text: '自虐家のアリー波の随に 歌って',
    },
  ],
  [
    {
      wordID: '',
      begin: 21.5,
      end: 22,
      text: '行きたい場所なんて何処にもないここに居させてと泣き喚いた',
    },
  ],
  [
    {
      wordID: '',
      begin: 22,
      end: 25,
      text: 'Oh, I can\'t help falling in love with you',
    },
  ],
  [
    {
      wordID: '',
      begin: 25,
      end: 26,
      text: '変な感じ 全然慣れないや',
    },
  ],
  [
    {
      wordID: '',
      begin: 26,
      end: 27,
      text: 'ふたりぼっちでも大作戦 叶えたいことが曇らないように',
    },
  ],
  [
    {
      wordID: '',
      begin: 27,
      end: 28,
      text: '捨てられない古びた Teddy bear',
    },
  ],
  [
    {
      wordID: '',
      begin: 28,
      end: 29,
      text: 'Baby Baby Baby Baby 君を抱きしめていたい',
    },
  ],
  [
    {
      wordID: '',
      begin: 29,
      end: 30,
      text: 'I’m needing you! I’m needing you!',
    },
  ],
];

describe('Paragraph not used Kuromoji Tokenizer', () => {
  let paragraph: Paragraph;

  beforeEach(async () => {
    paragraph = await new Paragraph({
      lyricID: '1',
      position: 1,
      timelines,
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
    expect(paragraph.allLines()[2].text()).toBe(
      '開かないカーテン 割れたカップ流し台の腐乱したキャベツ'
    );
    expect(paragraph.allLines()[3].text()).toBe(
      '私だけが知っているんだからわがままはとうの昔に止めた'
    );
    expect(paragraph.allLines()[4].text()).toBe(
      '昔嬉しそうに話していた母は今夜もまだ帰らない'
    );
    expect(paragraph.allLines()[5].text()).toBe(
      '自虐家のアリー波の随に 歌って'
    );
    expect(paragraph.allLines()[6].text()).toBe(
      '行きたい場所なんて何処にもないここに居させてと泣き喚いた'
    );
    expect(paragraph.allLines()[7].text()).toBe(
      'Oh, I can\'t help falling in love with you'
    );
    expect(paragraph.allLines()[8].text()).toBe('変な感じ 全然慣れないや');
    expect(paragraph.allLines()[9].text()).toBe(
      'ふたりぼっちでも大作戦 叶えたいことが曇らないように'
    );
    expect(paragraph.allLines()[9].end()).toBe(27);

    expect(paragraph.allLines()[10].text()).toBe(
      '捨てられない古びた Teddy bear'
    );

    expect(paragraph.allLines()[11].text()).toBe(
      'Baby Baby Baby Baby 君を抱きしめていたい'
    );

    expect(paragraph.allLines()[12].text()).toBe(
      'I’m needing you! I’m needing you!'
    );
  });

  it('should return the voids count', () => {
    expect(paragraph.voids().length).toBe(3);
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
      timelines,
    }).init();
  });

  it('should return text of the line', () => {
    expect(paragraph.allLines()[0].text()).toBe(
      'あの花が\n咲いたのは、\nそこに\n種が落ちたからで'
    );
    expect(paragraph.allLines()[0].begin()).toBe(1);
    expect(paragraph.allLines()[1].end()).toBe(12);
    expect(paragraph.allLines()[1].text()).toBe(
      'いずれにしても\n立ち去らなければならない\n彼女は傷つきすぎた'
    );
    expect(paragraph.allLines()[2].text()).toBe(
      '開かない\nカーテン\n割れた\nカップ\n流し台の\n腐乱した\nキャベツ'
    );
    expect(paragraph.allLines()[3].text()).toBe(
      '私だけが\n知っているんだから\nわがままは\nとうの\n昔に止めた'
    );
    expect(paragraph.allLines()[4].text()).toBe(
      '昔嬉しそうに話していた\n母は今夜も\nまだ帰らない'
    );
    expect(paragraph.allLines()[5].text()).toBe(
      '自虐家の\nアリー\n波の\n随に\n歌って'
    );
    expect(paragraph.allLines()[6].text()).toBe(
      '行きたい\n場所なんて\n何処にもない\nここに居させてと泣き喚いた'
    );
    expect(paragraph.allLines()[7].text()).toBe(
      'Oh,\nI can\'t help falling in love with you'
    );
    expect(paragraph.allLines()[8].text()).toBe('変な感じ\n全然慣れないや');
    expect(paragraph.allLines()[9].text()).toBe(
      'ふたりぼっちでも大作戦\n叶えたいことが曇らないように'
    );
    expect(paragraph.allLines()[9].end()).toBe(27);

    expect(paragraph.allLines()[10].text()).toBe(
      '捨てられない古びた\nTeddy bear'
    );

    expect(paragraph.allLines()[11].text()).toBe(
      'Baby Baby Baby Baby\n君を抱きしめていたい'
    );
    expect(paragraph.allLines()[12].text()).toBe(
      'I’m needing you!\nI’m needing you!'
    );
  });

  it('should return the voids count', () => {
    expect(paragraph.voids().length).toBe(3);
  });
});

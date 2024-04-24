import { Paragraph } from '@ioris/core';
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

describe('Paragraph used Kuromoji Tokenizer', () => {
  let paragraph: Paragraph;

  beforeEach(async () => {
    const tokenizer = await getTokenizer();
    paragraph = new Paragraph({
      lyricID: '1',
      tokenizer: (lineArgs) =>
        LineArgsTokenizer({
          tokenizer,
          lineArgs,
        }),
      position: 1,
      timelines: new Map([
        [
          1,
          new Map([
            [
              1,
              {
                begin: 1,
                end: 5,
                text: 'あの花が咲いたのは、そこに種が落ちたからで',
              },
            ],
          ]),
        ],
        [
          2,
          new Map([
            [
              1,
              {
                begin: 6,
                end: 12,
                text: 'いずれにしても立ち去らなければならない彼女は傷つきすぎた',
              },
            ],
            [
              2,
              {
                begin: 14,
                end: 15,
                text: '開かないカーテン 割れたカップ流し台の腐乱したキャベツ',
              },
            ],
            [
              3,
              {
                begin: 15,
                end: 16,
                text: '私だけが知っているんだからわがままはとうの昔に止めた',
              },
            ],
            [
              4,
              {
                begin: 16,
                end: 17,
                text: '昔嬉しそうに話していた母は今夜もまだ帰らない',
              },
            ],
          ]),
        ],
        [
          3,
          new Map([
            [
              1,
              {
                begin: 21,
                end: 21.5,
                text: '自虐家のアリー波の随に 歌って',
              },
            ],
            [
              2,
              {
                begin: 21.5,
                end: 22,
                text: '行きたい場所なんて何処にもないここに居させてと泣き喚いた',
              },
            ],
          ]),
        ],
        [
          4,
          new Map([
            [
              1,
              {
                begin: 22,
                end: 25,
                text: "Oh, I can't help falling in love with you",
              },
            ],
          ]),
        ],
        [
          5,
          new Map([
            [
              1,
              {
                begin: 25,
                end: 26,
                text: '変な感じ 全然慣れないや',
              },
            ],
            [
              2,
              {
                begin: 25,
                end: 26,
                text: 'ふたりぼっちでも大作戦 叶えたいことが曇らないように',
              },
            ],
          ]),
        ],
      ]),
    });
  });

  it('should return text of the line', () => {
    expect(paragraph.allLines()[0].text()).toBe(
      'あの花が\n咲いたのは、\nそこに\n種が落ちたからで'
    );
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
      "Oh,\nI can't help falling in love with you"
    );
    expect(paragraph.allLines()[8].text()).toBe('変な感じ\n全然慣れないや');
    expect(paragraph.allLines()[9].text()).toBe(
      'ふたりぼっちでも大作戦\n叶えたいことが曇らないように'
    );
  });
});

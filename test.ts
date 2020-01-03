import { I18n } from "./src/I18n";

const i18n = new I18n({
  defaultLocale: {
    key: 'zh',
    values: {
      a: 'string',
      b: {
        c: {
          d: 'abcd',
        },
        i: {
          j: [
            'zzzzz{{name}}',
            { name: undefined }
          ]
        }
      },
      e: {
        f: 'gggggg',
      }
    }
  },
});

const count = 1000000;

console.time('a');
for (let i = 0; i < count; ++i) {
  i18n.chain.a;
}
console.timeEnd('a');


console.time('b');
for (let i = 0; i < count; ++i) {
  i18n.chain.e.f;
}
console.timeEnd('b');


console.time('c');
for (let i = 0; i < count; ++i) {
  i18n.chain.b.c.d;
}
console.timeEnd('c');

console.time('d');
for (let i = 0; i < count; ++i) {
  i18n.chain.b.i.j({
    name: 'kfdif',
  });
}
console.timeEnd('d');


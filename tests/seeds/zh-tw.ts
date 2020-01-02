import { Locale } from './en';

// @ts-ignore
const zhTw: Locale = {
  name: '中文繁体',
  profile: {
    info1: '这是基本信息',
    info2: [
      '我是{{name}}',
      {
        name: undefined,
      },
    ],
    info3: [
      '我的名字叫{{name}}',
      {
        name: 'Tom',
      },
    ],
    info4: [
      '我的名字叫{{name}}，几年{{age}}岁',
      {
        name: 'Tom',
        age: undefined,
      },
    ],
    info5: {
      info6: '好样的',
    },
  },
  moment: {
    info1: [
      '今天日期是{{date}}',
      {
        date: (value: Date) => {
          return value.getFullYear() + '/' + value.getMonth() + '/' + value.getDate();
        },
      },
    ],
    info2: [
      '今天日期是{{date}}',
      {
        date: (value: Date = new Date(2019, 11, 1)) => {
          return value.getFullYear() + '/' + value.getMonth() + '/' + value.getDate();
        },
      },
    ],
  },
};

export default zhTw;
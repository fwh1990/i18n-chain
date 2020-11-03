const en = {
  name: 'English',
  profile: {
    info1: 'Here is the profile',
    info2: [
      'I am {{name}}',
      {
        name: undefined,
      },
    ],
    info3: [
      'My name is {{name}}',
      {
        name: 'John',
      },
    ],
    info4: [
      'My name is {{name}}, I am {{age}} years old',
      {
        name: 'Tom',
        age: undefined,
      },
    ],
    info5: {
      info6: 'You are cool man',
    },
  },
  moment: {
    info1: [
      'Today is {{date}}',
      {
        date: (value: Date) => {
          return value.getFullYear() + '/' + value.getMonth() + '/' + value.getDate();
        },
      },
    ],
    info2: [
      'Today is {{date}}',
      {
        date: (value: Date = new Date(2019, 11, 1)) => {
          return value.getFullYear() + '/' + value.getMonth() + '/' + value.getDate();
        },
      },
    ],
  },
  defaultValue: {
    info1: 'Here is default value',
    info2: {
      info3: 'Deeply default value',
      info4: 'Deeply default value 4',
    },
  },
};

export default en;
export type Locale = typeof en;

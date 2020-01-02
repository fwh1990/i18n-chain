import expect from 'expect.js';
import en from './seeds/en';
import zhTw from './seeds/zh-tw';
import { I18n } from '../src/I18n';

let i18n = new I18n({
  defaultLocale: {
    key: 'en',
    values: en,
  }
});

beforeEach(() => {
  i18n = new I18n({
    defaultLocale: {
      key: 'en',
      values: en,
    },
    loader: (name) => new Promise((resolve) => resolve(require('./seeds/' + name))),
  });
  i18n.define('zh-tw', zhTw);
  i18n.locale('en');
});

afterEach(() => {
  i18n.locale('en');
});

it('Get default string', () => {
  expect(i18n.chain.name).to.be('English');
  expect(i18n.chain.profile.info1).to.be('Here is the profile');
});

describe('Template parameters', () => {
  it('With required parameters', () => {
    expect(i18n.chain.profile.info2({ name: 'Tom' })).to.be('I am Tom');
  });
  
  it('With optional parameters', () => {
    expect(i18n.chain.profile.info3()).to.be('My name is John');
    expect(i18n.chain.profile.info3({ name: 'Tom' })).to.be('My name is Tom');
  });
  
  it('With both type of parameters', () => {
    expect(i18n.chain.profile.info4({
       age: 20,
    })).to.be('My name is Tom, I am 20 years old');
  
    expect(i18n.chain.profile.info4({
      age: 20,
      name: 'John',
   })).to.be('My name is John, I am 20 years old');
  });
});

describe('Template function parameters', () => {
  it('Required without default parameter', () => {
    const now = new Date();
  
    expect(i18n.chain.moment.info1({
      date: now,
    })).to.be('Today is ' + now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate());
  });
  
  it('Have default parameter', () => {
    const now = new Date();
    const str = now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate();
  
    expect(i18n.chain.moment.info2()).to.be('Today is 2019/11/1');
    expect(i18n.chain.moment.info2({ date: now })).to.be('Today is ' + str);
  });
  
});

it('Message is not found', () => {
  // @ts-ignore
  expect(i18n.chain.nameNotExist).to.be('nameNotExist');
  // @ts-ignore
  expect(i18n.chain.profile.info1000).to.be('profile.info1000');
});

describe('Switch locale', () => {
  it('From defined language', () => {
    expect(i18n.chain.name).to.be('English');
    i18n.locale('zh-tw');
    expect(i18n.chain.name).to.be('中文繁体');
    i18n.locale('zh-tw');
    i18n.locale('zh-tw');
    expect(i18n.chain.name).to.be('中文繁体');
  });

  it('From async import', async () => {
    const unListen = i18n.listen((name) => {
      if (name === 'en') {
        unListen();
      }
    });

    expect(i18n.chain.name).to.be('English');
    await i18n.locale('zh');
    expect(i18n.chain.name).to.be('中文');
    i18n.locale('zh');
    i18n.locale('zh');
    expect(i18n.chain.name).to.be('中文');
  });

  it('Not found locale', async () => {
    try {
      await i18n.locale('zh-hk');
      expect(true).to.be(false);
    } catch (e) {
      expect(e.message).to.contain('zh-hk');
    }
  });
});

it('Use string literal', () => {
  expect(i18n.chain['profile.info1']).to.be('Here is the profile');
  expect(i18n.chain['profile.info5.info6']).to.be('You are cool man');
  expect(i18n.chain.profile['info5.info6']).to.be('You are cool man');
});

it('Use message fallback to default locale', () => {
  expect(i18n.chain.defaultValue.info1).to.be('Here is default value');
  i18n.locale('zh-tw');
  expect(i18n.chain.defaultValue.info1).to.be('Here is default value');

  i18n.locale('en');
  expect(i18n.chain.defaultValue.info2.info3).to.be('Deeply default value');
  expect(i18n.chain.defaultValue['info2.info10000']).to.be('defaultValue.info2.info10000');
  i18n.locale('zh-tw');
  expect(i18n.chain.defaultValue.info2.info3).to.be('Deeply default value');
  expect(i18n.chain.defaultValue['info2.info10000']).to.be('defaultValue.info2.info10000');
});
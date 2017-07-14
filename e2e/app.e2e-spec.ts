import { FccBookTradingPage } from './app.po';

describe('fcc-book-trading App', () => {
  let page: FccBookTradingPage;

  beforeEach(() => {
    page = new FccBookTradingPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});

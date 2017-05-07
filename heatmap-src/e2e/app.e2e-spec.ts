import { BarchartPage } from './app.po';

describe('barchart App', () => {
  let page: BarchartPage;

  beforeEach(() => {
    page = new BarchartPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

import { MasterEtWebPage } from './app.po';

describe('master-et-web App', () => {
  let page: MasterEtWebPage;

  beforeEach(() => {
    page = new MasterEtWebPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});

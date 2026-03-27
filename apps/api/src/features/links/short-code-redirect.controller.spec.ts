jest.mock('./links.service', () => ({
  LinksService: class LinksService {},
}));

import { ShortCodeRedirectController } from './short-code-redirect.controller';
import type { LinksService } from './links.service';

describe('ShortCodeRedirectController', () => {
  it('returns redirect payload from resolved short code URL', async () => {
    const linksService = {
      resolveShortCode: jest
        .fn()
        .mockResolvedValue('https://example.com/target'),
    } as unknown as LinksService;
    const controller = new ShortCodeRedirectController(linksService);

    await expect(controller.redirectByShortCode('abc12345')).resolves.toEqual({
      url: 'https://example.com/target',
    });

    expect(linksService.resolveShortCode).toHaveBeenCalledWith('abc12345');
  });
});

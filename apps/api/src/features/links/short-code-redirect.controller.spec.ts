jest.mock('./links.service', () => ({
  LinksService: class LinksService {},
}));
jest.mock('../click-events/clicks.service', () => ({
  ClicksService: class ClicksService {},
}));

import type { Request } from 'express';
import type { ClicksService } from '../click-events/clicks.service';
import { ShortCodeRedirectController } from './short-code-redirect.controller';
import type { LinksService } from './links.service';

describe('ShortCodeRedirectController', () => {
  it('redirects to the resolved URL and records the click', async () => {
    const linksService = {
      resolveShortCode: jest
        .fn()
        .mockResolvedValue({ id: 'link-1', url: 'https://example.com/target' }),
      incrementClicks: jest.fn().mockResolvedValue(undefined),
    } as unknown as LinksService;
    const clicksService = { record: jest.fn() } as unknown as ClicksService;
    const controller = new ShortCodeRedirectController(
      linksService,
      clicksService,
    );
    const request = { headers: {} } as Request;

    await expect(
      controller.redirectByShortCode('abc12345', request),
    ).resolves.toEqual({ url: 'https://example.com/target' });

    expect(linksService.resolveShortCode).toHaveBeenCalledWith('abc12345');
    expect(linksService.incrementClicks).toHaveBeenCalledWith('link-1');
    expect(clicksService.record).toHaveBeenCalledWith('link-1', request);
  });
});

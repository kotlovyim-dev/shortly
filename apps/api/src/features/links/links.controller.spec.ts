jest.mock('./links.service', () => ({
  LinksService: class LinksService {},
}));

import { LinksController } from './links.controller';
import type { LinksService } from './links.service';

describe('LinksController', () => {
  it('delegates create requests to the service', async () => {
    const linksService = {
      create: jest.fn().mockResolvedValue({ shortCode: 'abc12345' }),
    } as unknown as LinksService;
    const controller = new LinksController(linksService);

    await expect(
      controller.createLink({
        originalUrl: 'https://example.com',
      }),
    ).resolves.toEqual({ shortCode: 'abc12345' });

    expect(linksService.create).toHaveBeenCalledWith({
      originalUrl: 'https://example.com',
    });
  });
});

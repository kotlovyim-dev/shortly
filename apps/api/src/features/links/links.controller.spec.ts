jest.mock('./links.service', () => ({
  LinksService: class LinksService {},
}));

import { LinksController } from './links.controller';
import type { LinksService } from './links.service';

describe('LinksController', () => {
  it('delegates create requests to the service', async () => {
    const linksService = {
      create: jest.fn().mockResolvedValue({ shortCode: 'abc12345' }),
      findCurrentUserLinks: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

  it('delegates list requests to the service', async () => {
    const linksService = {
      create: jest.fn(),
      findCurrentUserLinks: jest.fn().mockResolvedValue({ items: [] }),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as LinksService;
    const controller = new LinksController(linksService);

    await expect(
      controller.listLinks(
        {
          id: 'user-1',
          email: 'alice@example.com',
        },
        {
          page: 3,
          limit: 10,
        } as never,
      ),
    ).resolves.toEqual({ items: [] });

    expect(linksService.findCurrentUserLinks).toHaveBeenCalledWith('user-1', {
      page: 3,
      limit: 10,
    });
  });

  it('delegates update requests to the service', async () => {
    const linksService = {
      create: jest.fn(),
      findCurrentUserLinks: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: 'link-1' }),
      delete: jest.fn(),
    } as unknown as LinksService;
    const controller = new LinksController(linksService);

    await expect(
      controller.updateLink(
        'link-1',
        {
          id: 'user-1',
          email: 'alice@example.com',
        },
        {
          title: 'Updated title',
        } as never,
      ),
    ).resolves.toEqual({ id: 'link-1' });

    expect(linksService.update).toHaveBeenCalledWith('link-1', 'user-1', {
      title: 'Updated title',
    });
  });

  it('delegates delete requests to the service', async () => {
    const linksService = {
      create: jest.fn(),
      findCurrentUserLinks: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as LinksService;
    const controller = new LinksController(linksService);

    await expect(
      controller.deleteLink('link-1', {
        id: 'user-1',
        email: 'alice@example.com',
      }),
    ).resolves.toBeUndefined();

    expect(linksService.delete).toHaveBeenCalledWith('link-1', 'user-1');
  });
});

import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('maps JWT payloads to the current user shape', () => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
    } as unknown as ConfigService;

    const strategy = new JwtStrategy(configService);

    expect(
      strategy.validate({ sub: 'user-1', email: 'alice@example.com' }),
    ).toEqual({
      id: 'user-1',
      email: 'alice@example.com',
    });
  });
});

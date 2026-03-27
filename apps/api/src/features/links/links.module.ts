import { Module } from '@nestjs/common';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import { ShortCodeRedirectController } from './short-code-redirect.controller';

@Module({
  controllers: [LinksController, ShortCodeRedirectController],
  providers: [LinksService],
})
export class LinksModule {}

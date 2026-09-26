import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ClickEvent,
  ClickEventSchema,
} from '../click-events/click-event.schema';
import { ClicksService } from '../click-events/clicks.service';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import { ShortCodeRedirectController } from './short-code-redirect.controller';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ClickEvent.name,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const days = config.getOrThrow<number>('ANALYTICS_RETENTION_DAYS');
          ClickEventSchema.index(
            { createdAt: 1 },
            { expireAfterSeconds: days * 86400 },
          );
          return ClickEventSchema;
        },
      },
    ]),
  ],
  controllers: [LinksController, ShortCodeRedirectController],
  providers: [LinksService, ClicksService],
  exports: [LinksService],
})
export class LinksModule {}

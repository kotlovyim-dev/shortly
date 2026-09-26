import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClickEventDocument = HydratedDocument<ClickEvent>;

@Schema({ collection: 'click_events', versionKey: false })
export class ClickEvent {
  @Prop({ required: true })
  linkId: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ default: 'unknown' })
  country: string;

  @Prop({ default: 'unknown' })
  city: string;

  @Prop({ default: 'unknown' })
  browser: string;

  @Prop({ default: 'unknown' })
  os: string;

  @Prop({ default: 'desktop' })
  device: string;

  @Prop({ default: 'direct' })
  referer: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ClickEventSchema = SchemaFactory.createForClass(ClickEvent);
ClickEventSchema.index({ linkId: 1, createdAt: -1 });

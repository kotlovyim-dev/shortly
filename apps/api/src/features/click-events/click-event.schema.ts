import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClickEventDocument = HydratedDocument<ClickEvent>;

@Schema({ collection: 'click_events' })
export class ClickEvent {
  @Prop({ required: true })
  linkId: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  browser: string;

  @Prop({ required: true })
  os: string;

  @Prop({ required: true })
  device: string;

  @Prop({ required: true })
  referer: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ClickEventSchema = SchemaFactory.createForClass(ClickEvent);

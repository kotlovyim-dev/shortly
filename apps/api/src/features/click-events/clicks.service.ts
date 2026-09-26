import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model } from 'mongoose';
import { UAParser } from 'ua-parser-js';
import { ClickEvent } from './click-event.schema';

type Count = { value: string; count: number };

export type LinkStats = {
  totalClicks: number;
  uniqueVisitors: number;
  clicksToday: number;
  topCountries: Count[];
  topReferrers: Count[];
  devices: Count[];
  browsers: Count[];
};

export type TimelinePoint = { date: string; clicks: number };

const TOP_LIMIT = 5;

@Injectable()
export class ClicksService {
  private readonly logger = new Logger(ClicksService.name);

  constructor(
    @InjectModel(ClickEvent.name)
    private readonly clickModel: Model<ClickEvent>,
  ) {}

  // Fire-and-forget: a failed analytics write must never break the redirect.
  record(linkId: string, request: Request): void {
    const ua = new UAParser(request.headers['user-agent']).getResult();
    // ponytail: country/city stay 'unknown' until a geo-IP source is added (maxmind, or a trusted CDN header).
    this.clickModel
      .create({
        linkId,
        ip: request.ip ?? 'unknown',
        browser: ua.browser.name,
        os: ua.os.name,
        device: ua.device.type,
        referer: this.refererHost(request.headers.referer),
      })
      .catch((error: unknown) =>
        this.logger.warn(`Failed to record click: ${String(error)}`),
      );
  }

  async stats(linkId: string): Promise<LinkStats> {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const top = (field: string, limit = TOP_LIMIT) => [
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1 as const } },
      { $limit: limit },
      { $project: { _id: 0, value: '$_id', count: 1 } },
    ];

    const [result] = await this.clickModel.aggregate<{
      total: { count: number }[];
      unique: { count: number }[];
      today: { count: number }[];
      countries: Count[];
      referrers: Count[];
      devices: Count[];
      browsers: Count[];
    }>([
      { $match: { linkId } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          unique: [{ $group: { _id: '$ip' } }, { $count: 'count' }],
          today: [
            { $match: { createdAt: { $gte: startOfToday } } },
            { $count: 'count' },
          ],
          countries: top('country'),
          referrers: top('referer'),
          devices: top('device'),
          browsers: top('browser'),
        },
      },
    ]);

    return {
      totalClicks: result.total[0]?.count ?? 0,
      uniqueVisitors: result.unique[0]?.count ?? 0,
      clicksToday: result.today[0]?.count ?? 0,
      topCountries: result.countries,
      topReferrers: result.referrers,
      devices: result.devices,
      browsers: result.browsers,
    };
  }

  async timeline(linkId: string, days: number): Promise<TimelinePoint[]> {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const rows = await this.clickModel.aggregate<{
      _id: string;
      clicks: number;
    }>([
      { $match: { linkId, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          clicks: { $sum: 1 },
        },
      },
    ]);
    const byDate = new Map(rows.map((row) => [row._id, row.clicks]));

    // Fill empty days so the chart has a continuous x-axis.
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(since);
      date.setUTCDate(since.getUTCDate() + index);
      const key = date.toISOString().slice(0, 10);
      return { date: key, clicks: byDate.get(key) ?? 0 };
    });
  }

  async deleteForLink(linkId: string): Promise<void> {
    await this.clickModel.deleteMany({ linkId });
  }

  private refererHost(referer: string | undefined): string | undefined {
    if (!referer) return undefined;
    try {
      return new URL(referer).hostname;
    } catch {
      return undefined;
    }
  }
}

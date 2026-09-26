import {
  Body,
  Delete,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserPayload } from '../auth/auth-user.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLinkDto } from './dto/create-link.dto';
import { ListLinksQueryDto } from './dto/list-links-query.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ClicksService } from '../click-events/clicks.service';
import { TimelineQueryDto } from './dto/timeline-query.dto';
import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
  constructor(
    @Inject(LinksService) private readonly linksService: LinksService,
    @Inject(ClicksService) private readonly clicksService: ClicksService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createLink(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() createLinkDto: CreateLinkDto,
  ) {
    return this.linksService.create(createLinkDto, currentUser.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  listLinks(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: ListLinksQueryDto,
  ) {
    return this.linksService.findCurrentUserLinks(currentUser.id, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getLink(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.linksService.findOwned(id, currentUser.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateLink(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() updateLinkDto: UpdateLinkDto,
  ) {
    return this.linksService.update(id, currentUser.id, updateLinkDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteLink(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<void> {
    await this.linksService.delete(id, currentUser.id);
    await this.clicksService.deleteForLink(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  async getStats(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    await this.linksService.ensureOwnership(id, currentUser.id);
    return this.clicksService.stats(id);
  }

  @Get(':id/timeline')
  @UseGuards(JwtAuthGuard)
  async getTimeline(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: TimelineQueryDto,
  ) {
    await this.linksService.ensureOwnership(id, currentUser.id);
    return this.clicksService.timeline(id, query.days);
  }
}

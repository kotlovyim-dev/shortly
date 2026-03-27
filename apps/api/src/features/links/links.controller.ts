import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserPayload } from '../auth/auth-user.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLinkDto } from './dto/create-link.dto';
import { ListLinksQueryDto } from './dto/list-links-query.dto';
import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
  constructor(
    @Inject(LinksService) private readonly linksService: LinksService,
  ) {}

  @Post()
  createLink(@Body() createLinkDto: CreateLinkDto) {
    return this.linksService.create(createLinkDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  listLinks(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: ListLinksQueryDto,
  ) {
    return this.linksService.findCurrentUserLinks(currentUser.userId, query);
  }
}

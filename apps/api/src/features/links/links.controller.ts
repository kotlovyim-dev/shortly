import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
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
}

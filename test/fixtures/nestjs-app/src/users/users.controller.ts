@Controller('users')
export class UsersController {
  @Get() list() {}
  @Get(':id') one() {}
  @Post() create() {}
}
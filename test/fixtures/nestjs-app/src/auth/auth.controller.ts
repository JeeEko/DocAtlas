@Controller('auth')
export class AuthController {
  @Post('login') login() {}
  @Post('register') register() {}
}
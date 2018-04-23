import { Authorized, JsonController, OnUndefined, Post } from 'routing-controllers';

@JsonController('/auth')
export class AuthController {

    @Authorized()
    @Post('/login')
    @OnUndefined(200)
    public login(): undefined {
        return undefined;
    }

    @Post('/logout')
    @OnUndefined(200)
    public logout(): undefined {
        return undefined;
    }

}

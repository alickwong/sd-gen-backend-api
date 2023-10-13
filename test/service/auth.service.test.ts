import {Test, TestingModule} from '@nestjs/testing';
import {DynamodbService} from "../../src/service/app.dynamodb";
import {InstanceStatus} from "../../src/enum/InstanceStatus";
import {AuthService} from "../../src/service/auth.service";

jest.setTimeout(90 * 1000);

describe('Auth Service', () => {
  it('Test Verify JWT', async () => {
    let appService = new AuthService();
    let jwt = "eyJraWQiOiJaQmd4Tm5uZkFhdDY1dTRJekJSa3";

    let result = await appService.verifyJwt(jwt);
    console.log(result);
  });
});

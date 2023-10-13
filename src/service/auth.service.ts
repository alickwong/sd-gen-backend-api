import {Injectable, Scope} from '@nestjs/common';
import {CognitoJwtVerifier} from "aws-jwt-verify";


@Injectable({scope: Scope.REQUEST})
export class AuthService {

  constructor() {

  }

  public async verifyJwt(jwt: string) {
    // Verifier that expects valid access tokens:
    let verifier = CognitoJwtVerifier.create({
      userPoolId: "ap-northeast-1_L8oGn6V4G",
      tokenUse: "access",
      clientId: "179p88q2isspuj5no3mjl5unlo"
    });

    try {
      const payload = await verifier.verify(jwt);
      return payload;
    } catch (e){
      console.log("Token not valid!", e);
      return;
    }
  }
}

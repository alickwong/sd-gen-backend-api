import {Injectable, Scope} from '@nestjs/common';
import * as shell from "shelljs"
import {DynamodbService} from "./app.dynamodb";

@Injectable({scope: Scope.REQUEST})
export class InstanceService {
  public getRandomInstanceId() {
    return Math.random().toString(36).slice(2, 12);
  }

  public helmInstall(input: {
    instanceId: string,
    userId: string,
    webuiLoginName: string,
    webuiLoginPassword: string,
    ingressListenPort: number,
    instanceType: string,
    capacityType: string,
    ociPath: string,
    chartVersion: string,
    pvcName: string,
    imageUrl: string,
  }) {
    console.log(input.chartVersion);
    let commend = `aws ecr get-login-password \
--region ap-northeast-1 | helm registry login \
--username AWS \
--password-stdin 331102492406.dkr.ecr.ap-northeast-1.amazonaws.com ` +
      `&& helm install ${input.instanceId} ${input.ociPath} --version ${input.chartVersion} ` +
      `--set deployment.instanceId=${input.instanceId} ` +
      `--set deployment.userId=${input.userId} ` +
      `--set deployment.HEARTBEAT_URL=webui ` +
      `--set deployment.webuiLoginName=${input.webuiLoginName} ` +
      `--set deployment.webuiLoginPassword=${input.webuiLoginPassword} ` +
      `--set deployment.pvcName=${input.pvcName} ` +
      `--set image.url=${input.imageUrl} ` +
      `--set ingress.ingressListenPort=${input.ingressListenPort} ` +
      `--set nodeSelector.instanceType=${input.instanceType} ` +
      `--set nodeSelector.capacityType=${input.capacityType} ` +
      `--set metadata.name=webui-${input.instanceId} `;

    return shell.exec(commend, {});
  }

  public helmUnInstall(instanceId) {
    shell.exec(`helm uninstall ${instanceId}`);
  }

  public getWebUIDeploymentList(): {
    name: string, instanceId: string, status: string
  }[] {
    const {stdout, stderr, code} = shell.exec(`kubectl get pod -ojson`, {silent: true});
    let data = JSON.parse(stdout);

    let deploys = data.items.filter(x => {
      if (x.metadata.name.indexOf('webui-') !== -1) {
        return true;
      }
    }).map(x => {
      let nameArray = x.metadata.name.split('-')
      return {
        name: x.metadata.name,
        instanceId: nameArray[1],
        status: x.status.phase
      };
    });

    return deploys;
  }
}

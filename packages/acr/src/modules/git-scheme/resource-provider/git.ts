import { IResourceProvider, IResource } from '@ali/ide-editor/lib/browser';
import { URI, localize } from '@ali/ide-core-common';
import { Injectable, Autowired } from '@ali/common-di';
import { LabelService } from '@ali/ide-core-browser/lib/services';
import { Path } from '@ali/ide-core-common/lib/path';

import { getMinimalDiffPath } from '../../../utils';
import { fromSCMUri } from '../../../utils/scm-uri';

@Injectable()
export class GitResourceProvider implements IResourceProvider {
  readonly scheme = 'git';

  @Autowired(LabelService)
  labelService: LabelService;

  provideResource(uri: URI) {
    return Promise.all([
      this.getFileStat(uri.toString()),
      this.labelService.getName(uri),
      this.labelService.getIcon(uri.withoutScheme().withoutQuery()),
    ] as const).then(([stat, name, icon]) => {
      let fileName = stat ? name : name + localize('file.resource-deleted');
      if (uri.scheme === 'git') {
        const { ref } = fromSCMUri(uri);
        fileName = `${name}${ref ? ` (${ref.slice(0, 8)})` : ''} (${localize(
          'acr.common.read-only'
        )})`;
      }

      return {
        name: fileName,
        icon,
        uri,
        metadata: null,
      };
    });
  }

  provideResourceSubname(resource: IResource, groupResources: IResource[]): string | null {
    const shouldDiff: URI[] = [];
    for (const res of groupResources) {
      if (
        res.uri.scheme === this.scheme &&
        res.uri.displayName === resource.uri.displayName &&
        res !== resource
      ) {
        // 存在同协议的相同名称的文件
        shouldDiff.push(res.uri);
      }
    }
    if (shouldDiff.length > 0) {
      return '...' + Path.separator + getMinimalDiffPath(resource.uri, shouldDiff);
    } else {
      return null;
    }
  }

  // TODO 除了doc dirty之外的逻辑基本上是通用的
  async shouldCloseResource(resource: IResource, openedResources: IResource[][]): Promise<boolean> {
    // git scheme 资源暂时不给关闭
    return true;
  }

  // TODO browser fs
  private getFileStat(uri: string) {
    return true;
  }
}

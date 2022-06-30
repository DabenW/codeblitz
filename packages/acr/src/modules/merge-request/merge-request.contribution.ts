import { Domain, getIcon, localize, SlotLocation } from '@opensumi/ide-core-browser';
import {
  ComponentContribution,
  ComponentRegistry,
  ClientAppContribution,
} from '@opensumi/ide-core-browser';
import { Autowired } from '@opensumi/di';

import { MergeRequestSummary } from './mr-summary';
import { MergeRequestExplorerId } from './common';
import { ChangeTreeView } from './changes-tree';
import { WebSCMView } from './web-scm';
import { MenuContribution, IMenuRegistry } from '@opensumi/ide-core-browser/lib/menu/next';
import { LayoutState, LAYOUT_STATE } from '@opensumi/ide-core-browser/lib/layout/layout-state';
import { IMainLayoutService } from '@opensumi/ide-main-layout';

@Domain(ComponentContribution, MenuContribution, ClientAppContribution)
// @ts-ignore
export class MergeRequestContribution
  implements ComponentContribution, MenuContribution, ClientAppContribution
{
  @Autowired(IMainLayoutService)
  layoutService: IMainLayoutService;

  @Autowired(ComponentRegistry)
  componentRegistry: ComponentRegistry;

  @Autowired()
  private layoutState: LayoutState;

  registerComponent(registry: ComponentRegistry) {
    registry.register(MergeRequestExplorerId, [ChangeTreeView, WebSCMView], {
      titleComponent: MergeRequestSummary,
      iconClass: getIcon('explorer'),
      priority: 10,
      containerId: MergeRequestExplorerId,
    });
  }

  onDidStart() {
    const tabbarService = this.layoutService.getTabbarService(SlotLocation.left);
    const componentRegistry =
      this.componentRegistry.getComponentRegistryInfo(MergeRequestExplorerId);
    if (componentRegistry) {
      tabbarService.registerContainer(MergeRequestExplorerId, componentRegistry);
      const state = this.layoutState.getState(LAYOUT_STATE.MAIN, {});
      let currentId: string,
        size: number = 0,
        show = true;
      for (const key in state) {
        if (key === SlotLocation.left) {
          currentId = state[key]?.currentId;
          size = state[key]?.size || 0;
          show = currentId ? true : false;
        }
      }
      this.layoutService.toggleSlot(SlotLocation.left, show, size);
    }
  }

  registerMenus(menus: IMenuRegistry) {
    // 卸载左侧面板的右键菜单
    menus.unregisterMenuId(`accordion/${MergeRequestExplorerId}`);
    // 卸载配置菜单
    menus.unregisterMenuId(`activityBar/extra`);
    // 卸载左侧右键菜单
    menus.unregisterMenuId(`tabbar/left`);
  }
}

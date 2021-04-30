import '@ali/ide-i18n/lib/browser';
import '@alipay/alex-i18n';
import {
  ClientApp,
  RuntimeConfig,
  makeWorkspaceDir,
  IAppOpts,
  STORAGE_DIR,
} from '@alipay/alex-core';
import {
  SlotRenderer,
  SlotLocation,
  IAppRenderer,
  FILES_DEFAULTS,
  IReporter,
} from '@ali/ide-core-browser';
import { BoxPanel, SplitPanel } from '@ali/ide-core-browser/lib/components';
import { IThemeService } from '@ali/ide-theme/lib/common';
import '@ali/ide-core-browser/lib/style/index.less';
import * as os from 'os';
import { IPluginConfig } from '@alipay/alex-plugin';

import { disposeMode } from '../core/patch';
import { getModules } from '../core/editor/modules';
import { mergeConfig, themeStorage } from '../core/utils';
import { EditorLayoutComponent, getEditorLayoutConfig } from '../core/layout';
import { IConfig, IAppInstance } from './types';
import { logPv } from '../core/tracert';

export { SlotLocation, SlotRenderer, BoxPanel, SplitPanel };

const getDefaultAppConfig = (): IAppOpts => ({
  modules: getModules(),
  useCdnIcon: true,
  noExtHost: true,
  extWorkerHost: __WORKER_HOST__,
  webviewEndpoint: __WEBVIEW_ENDPOINT__,
  defaultPreferences: {
    'general.theme': 'ide-light',
    'application.confirmExit': 'never',
    'editor.autoSave': 'afterDelay',
    'editor.autoSaveDelay': 1000, // one second
    'editor.fixedOverflowWidgets': true, // widget editor 默认改为 fixed
    'files.exclude': {
      ...FILES_DEFAULTS.filesExclude,
      // browserfs OverlayFS 用来记录删除的文件
      '**/.deletedFiles.log': true,
    },
  },
  layoutConfig: getEditorLayoutConfig(),
  layoutComponent: EditorLayoutComponent,
  logDir: `${os.homedir()}/${STORAGE_DIR}/logs/`,
  preferenceDirName: STORAGE_DIR,
  storageDirName: STORAGE_DIR,
  extensionStorageDirName: STORAGE_DIR,
  appName: 'ALEX',
  allowSetDocumentTitleFollowWorkspaceDir: false,
});

export function createEditor({ appConfig, runtimeConfig }: IConfig): IAppInstance {
  const customConfig = typeof appConfig === 'function' ? appConfig() : appConfig;
  const opts = mergeConfig(getDefaultAppConfig(), customConfig);

  if (!opts.workspaceDir) {
    throw new Error(
      '需工作空间目录，最好确保不同项目名称不同，如 group/repository 的形式，工作空间目录会挂载到 /workspace 目录下'
    );
  }
  opts.workspaceDir = makeWorkspaceDir(opts.workspaceDir);

  let themeType = themeStorage.get();
  if (!themeType) {
    const defaultTheme = opts.defaultPreferences?.['general.theme'];
    opts.extensionMetadata?.find((item) => {
      const themeConfig = item.packageJSON.contributes?.themes?.find(
        (item: any) => item.id === defaultTheme
      );
      if (themeConfig) {
        themeType = !themeConfig.uiTheme || themeConfig.uiTheme === 'vs-dark' ? 'dark' : 'light';
        themeStorage.set(themeType);
      }
    });
  }

  const app = new ClientApp(opts) as IAppInstance;

  const _start = app.start;
  app.start = async (container: HTMLElement | IAppRenderer) => {
    await _start.call(app, container);
    // 在 start 不能 injector.get，否则有的 service 立即初始化，此时 file-system 还没有初始化完成
    (app.injector.get(IThemeService) as IThemeService).onThemeChange((e) => {
      themeStorage.set(e.type);
    });
    setTimeout(() => {
      logPv(runtimeConfig.biz || location.hostname);
    });
  };

  /**
   * 目前整个应用有太多的副作用，尤其是注册到 monaco 的事件，如 DocumentSymbolProviderRegistry.onChange
   * 在 monaco 上的事件无法注销，除非重新全局实例化一个 monaco，目前 kaitian 并未暴露，暂时不可行
   * 因此这里的 destroy 仍然可能有不少副作用无法清除，暂时清理已知的，避免报错
   */
  let destroyed = false;
  app.destroy = () => {
    if (destroyed) {
      return;
    }
    destroyed = true;
    disposeMode();
    app.injector.disposeAll();
  };

  // 基于场景的运行时数据
  app.injector.addProviders({
    token: RuntimeConfig,
    useValue: runtimeConfig,
  });

  app.injector.addProviders({
    token: IPluginConfig,
    useValue: customConfig.plugins,
  });

  if (runtimeConfig.reporter) {
    app.injector.addProviders({
      token: IReporter,
      useValue: runtimeConfig.reporter,
      override: true,
    });
  }

  (window as any)[RuntimeConfig] = runtimeConfig;

  return app;
}

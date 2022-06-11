import type * as monaco from '@opensumi/monaco-editor-core/esm/vs/editor/editor.api';
import { MainThreadLanguages } from '@opensumi/ide-extension/lib/browser/vscode/api/main.thread.language';
import { AbstractExtInstanceManagementService } from '@opensumi/ide-extension/lib/browser/types';

import { disposableCollection } from '../patch';

import { ExtensionClientAppContribution } from '@opensumi/ide-extension/lib/browser/extension.contribution';
import { FileServiceClient } from '@opensumi/ide-file-service/lib/browser/file-service-client';

// TODO: PR to kaitian, monaco 内会 dispose，先临时 override
// @ts-ignore
const _createSignatureHelpProvider = MainThreadLanguages.prototype.createSignatureHelpProvider;
// @ts-ignore
MainThreadLanguages.prototype.createSignatureHelpProvider = function (...args: any[]) {
  const provider = _createSignatureHelpProvider.call(this, ...args);
  const _provideSignatureHelp = provider.provideSignatureHelp;
  provider.provideSignatureHelp = function (...args: any[]) {
    return (_provideSignatureHelp.call(this, ...args) as Promise<any>).then((v) => {
      if (v) {
        v.dispose = () => {};
      }
      return v;
    });
  };
  return provider;
};

// TODO: 如果加载 webscm 插件，provideReferences 结果会拿到与当前 file 协议一样的 web_scm 协议的 reference，先过滤掉非 file 协议的文件
// @ts-ignore
const _createReferenceProvider = MainThreadLanguages.prototype.createReferenceProvider;
// @ts-ignore
MainThreadLanguages.prototype.createReferenceProvider = function (...args: any[]) {
  const provider = _createReferenceProvider.call(this, ...args);
  const _provideReferences = provider.provideReferences;
  provider.provideReferences = function (...args: any[]) {
    return (_provideReferences.call(this, ...args) as Promise<monaco.languages.Location[]>).then(
      (references) => references.filter((reference) => reference.uri.scheme === 'file')
    );
  };
  return provider;
};

disposableCollection.push((injector) => {
  (
    injector.get(AbstractExtInstanceManagementService) as AbstractExtInstanceManagementService
  ).dispose();
});

ExtensionClientAppContribution.prototype.onDisposeSideEffects = function () {
  // 临时修复 防止dispose报错
};

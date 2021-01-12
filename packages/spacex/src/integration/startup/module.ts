import { ConstructorOf } from '@ali/ide-core-common';
import { BrowserModule, ClientCommonModule } from '@ali/ide-core-browser';
import { MainLayoutModule } from '@ali/ide-main-layout/lib/browser';
import { LogModule } from '@ali/ide-logs/lib/browser';
import { MonacoModule } from '@ali/ide-monaco/lib/browser';
import { EditorModule } from '@ali/ide-editor/lib/browser';
import { StatusBarModule } from '@ali/ide-status-bar/lib/browser';
import { QuickOpenModule } from '@ali/ide-quick-open/lib/browser';
import { FileTreeNextModule } from '@ali/ide-file-tree-next/lib/browser';
import { FileServiceClientModule } from '@ali/ide-file-service/lib/browser';
import { ThemeModule } from '@ali/ide-theme/lib/browser';
import { WorkspaceModule } from '@ali/ide-workspace/lib/browser';
import { ExtensionStorageModule } from '@ali/ide-extension-storage/lib/browser';
import { StorageModule } from '@ali/ide-storage/lib/browser';
import { OpenedEditorModule } from '@ali/ide-opened-editor/lib/browser';
import { ExplorerModule } from '@ali/ide-explorer/lib/browser';
import { DecorationModule } from '@ali/ide-decoration/lib/browser';
import { PreferencesModule } from '@ali/ide-preferences/lib/browser';
import { MenuBarModule } from '@ali/ide-menu-bar/lib/browser';
import { OverlayModule } from '@ali/ide-overlay/lib/browser';
import { SCMModule } from '@ali/ide-scm/lib/browser';
import { StaticResourceModule } from '@ali/ide-static-resource/lib/browser';
import { WorkspaceEditModule } from '@ali/ide-workspace-edit/lib/browser';
import { KeymapsModule } from '@ali/ide-keymaps/lib/browser';
import { KaitianExtensionModule } from '@ali/ide-kaitian-extension/lib/browser';
import { CommentsModule } from '@ali/ide-comments/lib/browser';
import { WebviewModule } from '@ali/ide-webview/lib/browser';
import { OutputModule } from '@ali/ide-output/lib/browser';
import { FileSchemeModule } from '@ali/ide-file-scheme/lib/browser';
import { MarkersModule } from '@ali/ide-markers/lib/browser';
import { DebugModule } from '@ali/ide-debug/lib/browser';
import { OutlineModule } from '@ali/ide-outline/lib/browser';

import { ClientModule, ServerModuleCollection } from '@alipay/spacex-core';
import { GitFileSchemeModule } from '@alipay/spacex-git';
import { MemFSModule } from '@alipay/spacex-memfs';

import { StartupModule } from './startup.module';

export const Modules: ConstructorOf<BrowserModule>[] = [
  FileServiceClientModule,
  MainLayoutModule,
  OverlayModule,
  LogModule,
  ClientCommonModule,
  StatusBarModule,
  MenuBarModule,
  MonacoModule,
  ExplorerModule,
  EditorModule,
  QuickOpenModule,
  KeymapsModule,
  FileTreeNextModule,
  ThemeModule,
  WorkspaceModule,
  ExtensionStorageModule,
  StorageModule,
  PreferencesModule,
  OpenedEditorModule,
  DecorationModule,
  SCMModule,
  StaticResourceModule,
  WorkspaceEditModule,
  CommentsModule,
  WebviewModule,
  OutputModule,
  FileSchemeModule,
  KaitianExtensionModule,
  MarkersModule,
  DebugModule,
  OutlineModule,

  // Browser Core Module
  ClientModule,

  MemFSModule,

  // GitFileSchemeModule,

  // service module
  ...ServerModuleCollection,

  // local module
  StartupModule,
];

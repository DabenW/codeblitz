import * as React from 'react';
import { ConfigContext, localize } from '@ali/ide-core-browser';
import { RecycleTree, TreeNode, TreeViewActionTypes } from '@ali/ide-core-browser/lib/components';
import { ViewState } from '@ali/ide-core-browser';
import { getIcon } from '@ali/ide-core-browser';
import * as cls from 'classnames';
import { SearchTreeService } from '@ali/ide-search/lib/browser/search-tree.service';
import { ContentSearchClientService } from '@ali/ide-search/lib/browser/search.service';
import * as styles from '@ali/ide-search/lib/browser/search.module.less';
import { ResultTotal } from '@ali/ide-search/lib/common';

export interface ISearchTreeItem extends TreeNode<ISearchTreeItem> {
  children?: ISearchTreeItem[];
  badge?: number;
  [key: string]: any;
}

export interface ISearchLayoutProp {
  width: number;
  height: number;
  [key: string]: any;
}

export interface ISearchTreeProp {
  searchPanelLayout: {
    width: number;
    height: number;
  };
  viewState: ViewState;
}

const itemLineHeight = 22;

function getRenderTree(nodes: ISearchTreeItem[]) {
  return nodes.filter((node) => {
    if (node && node.parent) {
      if (node.parent.expanded === false) {
        return false;
      }
    }
    return true;
  });
}

function getScrollContainerStyle(viewState: ViewState, searchPanelLayout: any): ISearchLayoutProp {
  return {
    width: viewState.width || '100%',
    height: viewState.height - searchPanelLayout.height - 50 || 0,
  } as ISearchLayoutProp;
}

function getResultTotalContent(total: ResultTotal, searchTreeService: SearchTreeService) {
  if (total.resultNum > 0) {
    return (
      <p className={styles.result_describe}>
        {localize('search.files.result.kt', '{0} result in {1} files')
          .replace('{0}', String(total.resultNum))
          .replace('{1}', String(total.fileNum))}
        <span
          title={localize('search.CollapseDeepestExpandedLevelAction.label')}
          onClick={searchTreeService.foldTree}
          className={cls(getIcon('collapse-all'), styles.result_fold, {
            [styles.result_fold_enabled]: total.fileNum > 0,
          })}
        ></span>
      </p>
    );
  }
  return '';
}

export const SearchTree = React.forwardRef(
  ({ searchPanelLayout, viewState }: ISearchTreeProp, ref) => {
    const configContext = React.useContext(ConfigContext);
    const [scrollContainerStyle, setScrollContainerStyle] = React.useState<ISearchLayoutProp>({
      width: 0,
      height: 0,
    });
    const [nodes, setNodes] = React.useState<ISearchTreeItem[]>([]);
    const { injector } = configContext;
    const searchBrowserService: ContentSearchClientService = injector.get(
      ContentSearchClientService
    );
    const searchTreeService: SearchTreeService = injector.get(SearchTreeService);

    const { replaceValue, resultTotal } = searchBrowserService;
    const { onContextMenu, commandActuator, onSelect, updateNodes } = searchTreeService;

    // 请勿在tsx中操作 setNodes，应该使用 searchTreeService.setNodes
    searchTreeService._setNodes = setNodes;
    searchTreeService._nodes = nodes;

    React.useEffect(() => {
      setScrollContainerStyle(getScrollContainerStyle(viewState, searchPanelLayout));
    }, [searchPanelLayout.height, viewState.height, viewState.width, searchPanelLayout.width]);

    React.useEffect(() => {
      updateNodes();
    }, [resultTotal.resultNum]);

    return (
      <div className={styles.tree}>
        {getResultTotalContent(resultTotal, searchTreeService)}
        {nodes && nodes.length > 0 ? (
          <RecycleTree
            onContextMenu={onContextMenu}
            replace={replaceValue || ''}
            onSelect={(files) => {
              onSelect(files);
            }}
            nodes={getRenderTree(nodes)}
            scrollContainerStyle={scrollContainerStyle}
            containerHeight={scrollContainerStyle.height}
            itemLineHeight={itemLineHeight}
            commandActuator={(cmdId, id) => {
              commandActuator(cmdId, id);
              return {};
            }}
            actions={[
              {
                icon: getIcon('eye-close'),
                title: localize('search.result.hide'),
                command: 'closeResult',
                location: TreeViewActionTypes.TreeNode_Right,
                paramsKey: 'id',
              },
              {
                icon: getIcon('eye-close'),
                title: localize('search.result.hide'),
                command: 'closeResults',
                location: TreeViewActionTypes.TreeContainer,
                paramsKey: 'id',
              },
            ]}
          />
        ) : (
          ''
        )}
      </div>
    );
  }
);

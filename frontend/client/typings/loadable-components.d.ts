declare module 'loadable-components/server' {
  import * as React from 'react';

  export function getLoadableState(
    rootElement: React.ReactElement<{}>,
    rootContext?: any,
    fetchRoot?: boolean,
    tree?: any,
  ): Promise<DeferredState>;

  export interface DeferredStateTree {
    id: string;
    children: DeferredStateTree[];
  }

  export interface DeferredState {
    tree: DeferredStateTree;
    getScriptContent(): string;
    getScriptTag(): string;
    getScriptElement(): React.ReactHTMLElement<HTMLScriptElement>;
  }
}

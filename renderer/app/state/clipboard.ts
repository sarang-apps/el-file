import { Action, State, StateContext } from '@ngxs/store';
import { nextTick, pluralize } from 'ellib';

import { StatusMessage } from './status';

/** NOTE: actions must come first because of AST */

export class ClearClipboard {
  static readonly type = '[Clipboard] clear';
  constructor(public readonly payload?: any) { }
}

export class ClipboardUpdated {
  static readonly type = '[Clipboard] updated';
  constructor(public readonly payload: { op: 'clear' | 'copy' | 'cut', paths: string[] }) { }
}

export class CopyToClipboard {
  static readonly type = '[Clipboard] copy';
  constructor(public readonly payload: { paths: string[] }) { }
}

export class CutToClipboard {
  static readonly type = '[Clipboard] cut';
  constructor(public readonly payload: { paths: string[] }) { }
}

export interface ClipboardStateModel {
  op: 'clear' | 'copy' | 'cut';
  paths: string[];
}

@State<ClipboardStateModel>({
  name: 'clipboard',
  defaults: {
    op: 'clear',
    paths: [],
  }
}) export class ClipboardState {

  @Action(ClearClipboard)
  clearClipboard({ dispatch, patchState }: StateContext<ClipboardStateModel>,
                 { payload }: ClearClipboard) {
    patchState({ op: 'clear', paths: [] });
      // sync model
      nextTick(() => dispatch(new ClipboardUpdated({ op: 'clear', paths: [] })));
  }

  @Action(ClipboardUpdated)
  clipboardUpdated({ dispatch }: StateContext<ClipboardStateModel>,
                   { payload }: ClipboardUpdated) {
    const { op, paths } = payload;
    let msgText = '';
    if (paths.length === 1)
      msgText = `${paths[0]} ${op} to clipboard`;
    else if (paths.length > 1) {
      const others = pluralize(paths.length, {
        '=1': 'one other', 'other': '# others'
      });
      msgText = `${paths[0]} and ${others} ${op} to clipboard`;
    }
    dispatch(new StatusMessage({ msgLevel: 'info', msgText }));
  }

  @Action(CopyToClipboard)
  copyToClipboard({ dispatch, patchState }: StateContext<ClipboardStateModel>,
                  { payload }: CopyToClipboard) {
    const { paths } = payload;
    patchState({ op: 'copy', paths });
      // sync model
      nextTick(() => dispatch(new ClipboardUpdated({ op: 'copy', paths })));
  }

  @Action(CutToClipboard)
  cutToClipboard({ dispatch, patchState }: StateContext<ClipboardStateModel>,
                 { payload }: CutToClipboard) {
    const { paths } = payload;
    patchState({ op: 'cut', paths });
      // sync model
      nextTick(() => dispatch(new ClipboardUpdated({ op: 'cut', paths })));
  }

}
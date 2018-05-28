import { AddPathToSelection, ClearSelection, ReplacePathsInSelection, SelectionStateModel, TogglePathInSelection } from '../state/selection';
import { AddPathToTab, RemovePathFromTab, Tab } from '../state/layout';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ClipboardStateModel } from '../state/clipboard';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { Descriptor } from '../state/fs';
import { Dictionary } from '../services/dictionary';
import { FSStateModel } from '../state/fs';
import { PrefsStateModel } from '../state/prefs';
import { Store } from '@ngxs/store';
import { TreeComponent } from './tree';

/**
 * Row component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-row',
  templateUrl: 'row.html',
  styleUrls: ['row.scss']
})

export class RowComponent {

  @Input() clipboard = { } as ClipboardStateModel;
  @Input() contextMenu: ContextMenuComponent;
  @Input() desc: Descriptor;
  @Input() dictionary: Dictionary[] = [];
  @Input() fs = { } as FSStateModel;
  @Input() level = 0;
  @Input() path: string;
  @Input() prefs = { } as PrefsStateModel;
  @Input() selection = { } as SelectionStateModel;
  @Input() tab = { } as Tab;

  /** ctor */
  constructor(public tree: TreeComponent,
              private store: Store) { }

  // event handlers

  onContextMenu(event: MouseEvent,
                desc: Descriptor): void {
    // if the context isn't part of the selection,
    // then it becomes the selection
    if (!this.selection.paths.includes(desc.path)) {
      this.store.dispatch([
        new ClearSelection(),
        new AddPathToSelection({ path: desc.path })
      ]);
    }
  }

  onExpand(event: MouseEvent,
           path: string): void {
    const action = this.tab.paths.includes(path)?
      new RemovePathFromTab({ path, tab: this.tab }) :
      new AddPathToTab({ path, tab: this.tab });
    this.store.dispatch(action);
    event.stopPropagation();
  }

  onSelect(event: MouseEvent,
           path: string): void {
    const actions = [];
    if (event.shiftKey) {
      if (this.selection.paths.length === 0)
        actions.push(new AddPathToSelection({ path }));
      else {
        // get all visible paths, in order
        const paths = Array.from(document.querySelectorAll('elfile-row'))
          .map(row => row.getAttribute('path'))
          .reduce((acc, path) => {
            acc.push(path);
            return acc;
          }, []);
        // find indexes of newly-selected path, and current selection boundaries
        const ix = paths.indexOf(path);
        let lo = Number.MAX_SAFE_INTEGER;
        let hi = Number.MIN_SAFE_INTEGER;
        this.selection.paths.forEach(path => {
          lo = Math.min(lo, paths.indexOf(path));
          hi = Math.max(hi, paths.indexOf(path));
        });
        // extend/contract the selection appropriately
        if (ix < lo)
          lo = ix;
        else if (ix > hi)
          hi = ix;
        else hi = ix;
        actions.push(new ReplacePathsInSelection({ paths: paths.slice(lo, hi + 1) }));
      }
    }
    else if (event.ctrlKey)
      actions.push(new TogglePathInSelection({ path }));
    else {
      actions.push(new ClearSelection());
      actions.push(new AddPathToSelection({ path }));
    }
    if (actions.length > 0)
      this.store.dispatch(actions);
    event.stopPropagation();
  }

}
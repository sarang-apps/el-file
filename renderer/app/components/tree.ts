import { Actions, Store, ofAction } from '@ngxs/store';
import { AutoUnsubscribe, LifecycleComponent } from 'ellib';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Dictionary, DictionaryService } from '../services/dictionary';
import { DirLoaded, FSStateModel } from '../state/fs';
import { NewTab, Tab, TabsUpdated } from '../state/layout';
import { PrefsStateModel, PrefsUpdated } from '../state/prefs';
import { View, ViewUpdated } from '../state/views';
import { debounceTime, filter } from 'rxjs/operators';

import { ContextMenuComponent } from 'ngx-contextmenu';
import { Descriptor } from '../state/fs';
import { FSService } from '../services/fs';
import { RootPageComponent } from '../pages/root/page';
import { Subscription } from 'rxjs';
import { TouchOperation } from '../services/touch';

/**
 * Tree component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-tree',
  templateUrl: 'tree.html',
  styleUrls: ['tree.scss']
})

@AutoUnsubscribe()
export class TreeComponent extends LifecycleComponent
                           implements OnInit {

  @Input() fs = { } as FSStateModel;
  @Input() prefs = { } as PrefsStateModel;
  @Input() splitID: string;
  @Input() tab = { } as Tab;
  @Input() view = { } as View;

  @ViewChild(ContextMenuComponent) contextMenu: ContextMenuComponent;

  descriptors: Descriptor[] = [];
  dictionary: Dictionary[] = [];

  subToActions: Subscription;

  /** ctor */
  constructor(private actions$: Actions,
              private cdf: ChangeDetectorRef,
              private dictSvc: DictionaryService,
              private fsSvc: FSService,
              private root: RootPageComponent,
              private store: Store) {
    super();
  }

  /** Is context menu bound to a directory? */
  isDirectory(desc: Descriptor): boolean {
    return desc.isDirectory;
  }

  /** Is context menu bound to a file? */
  isFile(desc: Descriptor): boolean {
    return desc.isFile;
  }

  /** Is context menu bound to a writable directory? */
  isWritableDirectory(desc: Descriptor): boolean {
    return desc.isDirectory && desc.isWritable;
  }

  /** Is context menu bound to a writable directory? */
  isWritableFile(desc: Descriptor): boolean {
    return desc.isFile && desc.isWritable;
  }

  // lifecycle methods

  ngOnInit() {
    this.subToActions = this.actions$
      .pipe(
        ofAction(DirLoaded, PrefsUpdated, TabsUpdated, ViewUpdated),
        filter(action => {
          switch (action.constructor) {
            case DirLoaded:
              return this.tab.paths.includes((<DirLoaded>action).payload.path);
            case PrefsUpdated:
              return true;
            case TabsUpdated:
              return (<TabsUpdated>action).payload.splitID === this.splitID;
            case ViewUpdated:
              return (<ViewUpdated>action).payload.viewID === this.tab.id;
          }
        }),
        debounceTime(100),
      ).subscribe(() => {
        this.dictionary = this.dictSvc.dictionaryForView(this.view);
        // TODO: temporary
        const path = this.tab.paths[0];
        if (this.fs[path])
          this.descriptors = this.dictSvc.descriptorsForView(path, this.fs, this.dictionary, this.prefs, this.view);
        this.cdf.detectChanges();
      });
  }

  // event handlers

  onContextMenu(event: {event?: MouseEvent,
                        item: Descriptor},
                command: string) {
    const desc = event.item;
    switch (command) {
      case 'open':
        this.store.dispatch(new NewTab({ splitID: this.splitID, path: desc.path }));
        break;
      case 'properties':
        this.root.onEditProps(desc);
        break;
      case 'touch':
        const touchOp = TouchOperation.makeInstance(desc.path, this.fsSvc);
        this.fsSvc.run(touchOp);
        break;
    }
  }

}

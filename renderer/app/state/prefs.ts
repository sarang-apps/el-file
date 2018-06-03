import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class UpdatePrefs {
  static readonly type = '[Prefs] update prefs';
  constructor(public readonly prefs: PrefsStateModel) { }
}

export type DateFmt = 'ago' | 'shortDate' | 'mediumDate' | 'longDate' | 'fullDate';
export type QuantityFmt = 'abbrev' | 'bytes' | 'number';
export type SortOrder = 'alpha' | 'first' | 'last';
export type TimeFmt = 'none' | 'shortTime' | 'mediumTime' | 'longTime' | 'fullTime';

export interface PrefsStateModel {
  dateFormat?: DateFmt;
  quantityFormat?: QuantityFmt;
  showGridLines?: boolean;
  showHiddenFiles?: boolean;
  showOnlyWritableFiles?: boolean;
  sortDirectories?: SortOrder;
  submitted?: boolean;
  timeFormat?: TimeFmt;
}

@State<PrefsStateModel>({
  name: 'prefs',
  defaults: {
    dateFormat: 'mediumDate',
    quantityFormat: 'bytes',
    showGridLines: true,
    showHiddenFiles: false,
    showOnlyWritableFiles: false,
    sortDirectories: 'first',
    timeFormat: 'none'
  }
}) export class PrefsState {

  @Action(UpdatePrefs)
  updatePrefs({ dispatch, patchState }: StateContext<PrefsStateModel>,
              { prefs }: UpdatePrefs) {
    patchState({ ...prefs });
  }

}

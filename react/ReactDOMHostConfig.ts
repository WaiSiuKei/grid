import { DOMContainer } from 'src/react/ReactDOM';

export function prepareForCommit(containerInfo: DOMContainer): void {
  eventsEnabled = ReactBrowserEventEmitterIsEnabled();
  selectionInformation = getSelectionInformation();
  ReactBrowserEventEmitterSetEnabled(false);
}

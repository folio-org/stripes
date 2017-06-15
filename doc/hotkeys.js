// ui-users/index.js

class UsersRouting extends React.Component {
  static actionNames = {
    stripesHome: true,
    stripesAbout: true,
  };

  render() {
    const keyHandlers = {
      stripesHome: () => {
        context.stripes.logger.log('action', 'handler for stripesHome: going to /');
        props.history.push('/');
      },
      stripesAbout: () => {
        context.stripes.logger.log('action', 'handler for stripesAbout: going to /about');
        props.history.push('/about');
      },
    };

    // ...
    return (<HotKeys noWrapper handlers={keyHandlers}>
              <Users .../>
            </HotKeys>);
  }
}



// stripes-core/src/hotkeys.js

import { modules } from 'stripes-loader';
const allActions = {};
for (const key of Object.keys(modules)) {
  const set = modules[key];
  for (const key2 of Object.keys(set)) {
    const module = set[key2];
    const keymap = module.getModule().actionNames;
    if (keymap) {
      for (const key3 of Object.keys(keymap)) {
        // We don't care WHAT the action-names are mapped to
        allActions[key3] = true;
      }
    }
  }
}
stripes.actionNames = Object.keys(allActions);



// stripes-core/src/Root.js or similar
render() {
  const keyMap = getMapFromConfiguration();
  return (</HotKeys keyMap={keyMap}>
            <Provider store={store}>...</Provider>
          </HotKeys>);
}



// ui-organization/settings/HotKeys.js
/*
A simple editor for hotkey configuration
Initially, just blindly handling a blob of JSON like
  {
    stripesHome: 'command+up',
    stripesAbout: 'command+down',
  };
Subsequently, an editor driven from stripes.actionNames
*/

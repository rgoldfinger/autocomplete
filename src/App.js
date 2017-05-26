// @flow
import React from 'react';
import './App.css';
import AutocompleteBlock from './AutocompleteBlock';
import { HashtagEntity, HashtagAutocomplete } from './Decorators';

import {
  Editor,
  EditorState,
  CompositeDecorator,
  AtomicBlockUtils,
} from 'draft-js';

// Terrible hack to get props passed to the decorator
const Store = { renderer: () => {} };

/**
       * Super simple decorators for handles and hashtags, for demonstration
       * purposes only. Don't reuse these regexes.
       */
const HASHTAG_REGEX = /\#[\w\u0590-\u05ff]+/g;

const hashtagEntityStrategy = trigger => (
  contentBlock,
  callback,
  contentState,
) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === trigger
    );
  }, callback);
};

function hashtagStrategy(contentBlock, callback, contentState) {
  findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

const compositeDecorator = new CompositeDecorator([
  {
    strategy: hashtagEntityStrategy('#'),
    component: HashtagEntity,
  },
  {
    strategy: hashtagStrategy,
    component: HashtagAutocomplete,
    props: Store,
  },
]);

type State = {
  editorState: EditorState,
};

class App extends React.Component {
  state: State = {
    editorState: EditorState.createEmpty(compositeDecorator),
  };

  _autocompletes = {};

  constructor(props) {
    super(props);
    Store.renderer = this.autocompleteRenderer;
  }

  focus = () => this.refs.editor.focus();

  autocompleteRenderer = (Component, props: { offsetKey: string }, onEnter) => {
    // When enter is pressed, add the block for the selected Component
    // Enter pressed
    // call 'enterPressed' on the selected autocomplete
    // Figure out which autocomplete was selected, if any
    // - get the current selection block

    return (
      <Component
        ref={ref => (this._autocompletes[props.offsetKey] = ref)}
        {...props}
      />
    );
  };

  onChange = (editorState: *) => {
    // step 1.
    // fill the suggestion box with the content
    //

    // const selection = editorState.getSelection();
    // //If there is no focus, return.
    // if (!selection.getHasFocus()) {
    //   return false;
    // }
    // const contentState = editorState.getCurrentContent();
    // const block = contentState.getBlockForKey(selection.getStartKey());
    // console.log(!!block.getEntityAt(selection.getStartOffset() - 1));
    this.setState({ editorState });
  };

  // insertAutocomplete = (type: string) => {
  //   const { editorState } = this.state;
  //   const contentState = editorState.getCurrentContent();
  //   const contentStateWithEntity = contentState.createEntity(
  //     type,
  //     'IMMUTABLE',
  //     { text: 'data goes here' },
  //   );
  //   const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  //   const newEditorState = EditorState.set(editorState, {
  //     currentContent: contentStateWithEntity,
  //   });
  //   this.setState(
  //     {
  //       editorState: AtomicBlockUtils.insertAtomicBlock(
  //         newEditorState,
  //         entityKey,
  //         ' ',
  //       ),
  //     },
  //     () => {
  //       setTimeout(() => this.refs.editor.focus(), 0);
  //     },
  //   );
  // };

  getOffsetKeyForCurrentSelection = () => {
    const { editorState } = this.state;
    const offsetKeys = Object.keys(this._autocompletes);
    const selectionStartKey = editorState.getSelection().getStartKey();
    return offsetKeys.find(k => k.startsWith(selectionStartKey));
  };

  handleReturn = () => {
    const offsetKey = this.getOffsetKeyForCurrentSelection();
    if (offsetKey) {
      // Perform a request to save your contents, set
      // a new `editorState`, etc.
      this._autocompletes[offsetKey].handleReturn();
      return 'handled';
    }
    return 'not-handled';
  };

  render() {
    return (
      <div style={{ margin: 20, height: 500 }}>
        <Editor
          editorState={this.state.editorState}
          blockRendererFn={blockRenderer}
          handleReturn={this.handleReturn}
          onChange={this.onChange}
          placeholder="Enter some text..."
          ref="editor"
        />
      </div>
    );
  }
}

function blockRenderer(block) {
  if (block.getType() === 'atomic') {
    return {
      component: AutocompleteBlock,
      editable: false,
    };
  }
  return null;
}

export default App;

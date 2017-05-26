// @flow
import React from 'react';
import idx from 'idx';
import './App.css';
// import AutocompleteBlock from './AutocompleteBlock';
import { HashtagEntity, HashtagAutocomplete } from './Decorators';

import { Editor, EditorState, CompositeDecorator, Modifier } from 'draft-js';

// Terrible hack to get props passed to the decorator
// $FlowFixMe
const Store = { renderer: () => {} };
const _autocompletes = {};

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

  constructor(props: *) {
    super(props);
    Store.renderer = this.autocompleteRenderer;
  }

  focus = () => this.refs.editor.focus();

  autocompleteRenderer = (Component: *, props: { offsetKey: string }) => {
    return (
      <Component
        ref={ref => (_autocompletes[props.offsetKey] = ref)}
        {...props}
        editorState={this.state.editorState}
      />
    );
  };

  onChange = (editorState: *) => {
    this.setState({ editorState });
  };

  getOffsetKeyForCurrentSelection = () => {
    const { editorState } = this.state;
    // Is the current selection within any of our blocks?
    // get the current selection.
    // get the selection key + offset
    // is it within the start/end?
    const selection = editorState.getSelection();
    const selectionStartKey = selection.getStartKey();
    const selectionStartOffset = selection.getStartOffset();
    const offsetKeys = Object.keys(_autocompletes).filter(
      a => !!_autocompletes[a],
    );

    return offsetKeys.find(k => {
      const [blockKey, unparsedDecoratorKey, unparsedLeafKey] = k.split('-');
      const decoratorKey = parseInt(unparsedDecoratorKey, 10);
      const leafKey = parseInt(unparsedLeafKey, 10);
      const { start, end } = editorState
        .getBlockTree(blockKey)
        .getIn([decoratorKey, 'leaves', leafKey]);
      return (
        blockKey === selectionStartKey &&
        start < selectionStartOffset &&
        end >= selectionStartOffset
      );
    });
  };

  replaceAutocompleteWithBlock = (
    offsetKey: String,
    entityKey: String,
    decoratedText: String,
  ) => {
    const { editorState } = this.state;
    const [blockKey, unparsedDecoratorKey, unparsedLeafKey] = offsetKey.split(
      '-',
    );
    const decoratorKey = parseInt(unparsedDecoratorKey, 10);
    const leafKey = parseInt(unparsedLeafKey, 10);
    const { start, end } = editorState
      .getBlockTree(blockKey)
      .getIn([decoratorKey, 'leaves', leafKey]);

    const newSelectionState = editorState.getSelection().merge({
      anchorKey: blockKey,
      anchorOffset: start,
      focusKey: blockKey,
      focusOffset: end,
    });

    let replacedContent = Modifier.replaceText(
      editorState.getCurrentContent(),
      newSelectionState,
      decoratedText,
      null,
      entityKey,
    );

    // If the mention is inserted at the end, a space is appended right after for
    // a smooth writing experience.
    const blockSize = editorState
      .getCurrentContent()
      .getBlockForKey(blockKey)
      .getLength();
    if (blockSize === editorState.getSelection().getEndOffset()) {
      replacedContent = Modifier.insertText(
        replacedContent,
        replacedContent.getSelectionAfter(),
        ' ',
      );
    }

    const newEditorState = EditorState.push(editorState, replacedContent);
    this.setState({
      editorState: newEditorState,
    });
  };

  handleReturn = () => {
    const offsetKey = this.getOffsetKeyForCurrentSelection();
    if (offsetKey && idx(_autocompletes, _ => _[offsetKey].handleReturn)) {
      _autocompletes[offsetKey].handleReturn(
        this.state.editorState,
        this.replaceAutocompleteWithBlock.bind(this),
      );
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
      component: HashtagEntity,
      editable: false,
    };
  }
  return null;
}

export default App;

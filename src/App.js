// @flow
import React from 'react';
import idx from 'idx';
import './App.css';
import { createCompositeDecorator } from './utils/decorators';

import { Editor, EditorState, Modifier } from 'draft-js';

// Terrible hack to get props passed to the decorator
// $FlowFixMe
const Store = { renderer: () => {} };

const _autocompletes = {};

type State = {
  editorState: EditorState,
};

class App extends React.Component {
  state: State = {
    editorState: EditorState.createEmpty(createCompositeDecorator(Store)),
  };

  constructor(props: *) {
    super(props);
    Store.renderer = this.autocompleteRenderer;
  }

  focus = () => this.refs.editor.focus();

  autocompleteRenderer = (Component: *, props: { offsetKey: string }) => {
    const selectedOffsetKey = this.getOffsetKeyForCurrentSelection();
    return (
      <Component
        ref={ref => (_autocompletes[props.offsetKey] = ref)}
        {...props}
        isSelected={
          selectedOffsetKey === props.offsetKey ||
            !_autocompletes[props.offsetKey]
        }
        editorState={this.state.editorState}
        replaceTextWithBlock={this.replaceTextWithBlock}
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
      const leaf = editorState
        .getBlockTree(blockKey)
        .getIn([decoratorKey, 'leaves', leafKey]);
      if (leaf) {
        const { start, end } = leaf;
        return (
          blockKey === selectionStartKey &&
          start <= selectionStartOffset &&
          end >= selectionStartOffset
        );
      } else {
        return false;
      }
    });
  };

  replaceTextWithBlock = (
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
      _autocompletes[offsetKey].handleReturn(this.state.editorState);
      return 'handled';
    }
    return 'not-handled';
  };

  handleTab = (e: SyntheticKeyboardEvent) => {
    const offsetKey = this.getOffsetKeyForCurrentSelection();
    if (offsetKey && idx(_autocompletes, _ => _[offsetKey].handleTab)) {
      _autocompletes[offsetKey].handleTab(this.state.editorState);
      e.stopPropagation();
      e.preventDefault();
      return 'handled';
    }
    return 'not-handled';
  };

  render() {
    return (
      <div style={{ margin: 20, height: 500 }}>
        <Editor
          editorState={this.state.editorState}
          handleReturn={this.handleReturn}
          onTab={this.handleTab}
          onChange={this.onChange}
          placeholder="Enter some text..."
          ref="editor"
        />
      </div>
    );
  }
}

export default App;

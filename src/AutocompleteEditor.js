// @flow
import React from 'react';
import idx from 'idx';
import { createCompositeDecorator } from './utils/decorators';

import { Editor, EditorState, Modifier, getDefaultKeyBinding } from 'draft-js';

type Props = {
  focus: boolean,
};
type State = {
  editorState: EditorState,
};

class AutocompleteEditor extends React.Component {
  props: Props;
  state: State;

  constructor(props: *) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(
        createCompositeDecorator({
          autocompleteRenderer: this.autocompleteRenderer,
        }),
      ),
    };
  }

  componentDidMount() {
    if (this.props.focus) {
      this.focus();
    }
  }

  focus = () => this.refs.editor.focus();

  _autocompletes = {};

  autocompleteRenderer = (Component: *, props: { offsetKey: string }) => {
    const selectedOffsetKey = this.getOffsetKeyForCurrentSelection();
    return (
      <Component
        ref={ref => (this._autocompletes[props.offsetKey] = ref)}
        {...props}
        isSelected={
          selectedOffsetKey === props.offsetKey ||
            !this._autocompletes[props.offsetKey]
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
    // Is the current selection within any of our blocks?
    const { editorState } = this.state;
    const selection = editorState.getSelection();
    const selectionStartKey = selection.getStartKey();
    const selectionStartOffset = selection.getStartOffset();
    const offsetKeys = Object.keys(this._autocompletes).filter(
      a => !!this._autocompletes[a],
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
    offsetKey: string,
    entityKey: string,
    decoratedText: string,
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
    if (offsetKey && idx(this._autocompletes, _ => _[offsetKey].handleReturn)) {
      this._autocompletes[offsetKey].handleReturn();
      return 'handled';
    }
    return 'not-handled';
  };

  handleTab = (e: SyntheticKeyboardEvent) => {
    const offsetKey = this.getOffsetKeyForCurrentSelection();
    if (offsetKey && idx(this._autocompletes, _ => _[offsetKey].handleTab)) {
      this._autocompletes[offsetKey].handleTab();
      e.stopPropagation();
      e.preventDefault();
      return 'handled';
    }
    return 'not-handled';
  };

  handleUpArrow = (e: SyntheticKeyboardEvent) => {
    const offsetKey = this.getOffsetKeyForCurrentSelection();
    if (
      offsetKey &&
      idx(this._autocompletes, _ => _[offsetKey].handleUpArrow)
    ) {
      this._autocompletes[offsetKey].handleUpArrow();
      e.stopPropagation();
      e.preventDefault();
      return 'handled';
    }
    return 'not-handled';
  };

  handleDownArrow = (e: SyntheticKeyboardEvent) => {
    const offsetKey = this.getOffsetKeyForCurrentSelection();
    if (
      offsetKey &&
      idx(this._autocompletes, _ => _[offsetKey].handleDownArrow)
    ) {
      this._autocompletes[offsetKey].handleDownArrow();
      e.stopPropagation();
      e.preventDefault();
      return 'handled';
    }
    return 'not-handled';
  };

  handleSpace = (e: SyntheticKeyboardEvent) => {
    const offsetKey = this.getOffsetKeyForCurrentSelection();
    if (offsetKey && idx(this._autocompletes, _ => _[offsetKey].handleSpace)) {
      this._autocompletes[offsetKey].handleSpace();
      e.stopPropagation();
      e.preventDefault();
      return 'handled';
    }
    return 'not-handled';
  };

  handleKeyPress = (e: SyntheticKeyboardEvent) => {
    if (e.keyCode === 32 && this.handleSpace(e) === 'handled') {
      return 'space-commit';
    }
    return getDefaultKeyBinding(e);
  };

  render() {
    return (
      <div
        style={{
          margin: 20,
          height: 500,
          border: '1px solid #AAA',
          borderRadius: 2,
          padding: 12,
          color: '#393939',
          fontSize: 18,
          fontWeight: 300,
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        <Editor
          editorState={this.state.editorState}
          handleReturn={this.handleReturn}
          onUpArrow={this.handleUpArrow}
          onDownArrow={this.handleDownArrow}
          keyBindingFn={this.handleKeyPress}
          onTab={this.handleTab}
          onChange={this.onChange}
          ref="editor"
        />
      </div>
    );
  }
}

export default AutocompleteEditor;

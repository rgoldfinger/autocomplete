// @flow
import React from 'react';
import { EditorState } from 'draft-js';

export type AutocompleteComponentProps = {
  children: *,
  offsetKey: *,
  decoratedText: String,
  editorState: EditorState,
  isSelected: boolean,
  replaceAutocompleteWithBlock: (
    offsetKey: String,
    entityKey: String,
    decoratedText: String,
  ) => void,
};

class Autocomplete extends React.Component {
  props: {
    search: string,
    children: *,
    offsetKey: string,
  };
  componentDidMount() {
    this.forceUpdate(); // ugh, but there's no dom element at first render time so ??
  }

  // https://github.com/facebook/draft-js/issues/45#issuecomment-189800287
  getSelectedBlockElement = () => {
    var selection = window.getSelection();
    if (selection.rangeCount === 0) {
      return null;
    }
    var node = selection.getRangeAt(0).startContainer;
    do {
      if (
        node.getAttribute &&
        node.getAttribute('data-offset-key') === this.props.offsetKey
      )
        return node;
      node = node.parentNode;
    } while (node != null);
    return null;
  };

  render() {
    const { search, children } = this.props;
    const el = this.getSelectedBlockElement();
    let positionStyles = {};
    if (el) {
      const rect = el.getBoundingClientRect();
      positionStyles = { top: rect.top + 20, left: rect.left };
    }

    return (
      <div style={{ display: 'inline' }}>
        {children}
        <div
          style={{
            minWidth: 50,
            position: 'absolute',
            background: '#EEE',
            ...positionStyles,
          }}
        >
          {search}
        </div>
      </div>
    );
  }
}

export default Autocomplete;

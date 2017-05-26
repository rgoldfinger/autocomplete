// @flow
import React from 'react';
import { EditorState, getVisibleSelectionRect } from 'draft-js';

const styles = {
  handle: {
    color: 'rgba(98, 177, 254, 1.0)',
    direction: 'ltr',
    unicodeBidi: 'bidi-override',
  },
  hashtag: {
    color: 'rgba(95, 184, 138, 1.0)',
  },
};

type AutocompleteComponentProps = {
  children: *,
  offsetKey: *,
  decoratedText: String,
  editorState: EditorState,
};

export const HashtagEntity = (props: AutocompleteComponentProps) => {
  console.log('render entity');
  return (
    <span style={styles.hashtag} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

class HashtagAutocompleteComponent extends React.Component {
  props: AutocompleteComponentProps;
  handleReturn(
    editorState,
    replaceAutocompleteWithBlock: (
      offsetKey: String,
      entityKey: String,
      decoratedText: String,
    ) => void,
  ) {
    const { decoratedText, offsetKey } = this.props;

    const contentStateWithEntity = editorState
      .getCurrentContent()
      .createEntity('#', 'IMMUTABLE', {
        text: decoratedText,
      });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    replaceAutocompleteWithBlock(offsetKey, entityKey, decoratedText);
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
    const { decoratedText, offsetKey, children } = this.props;
    const el = this.getSelectedBlockElement();
    let positionStyles = {};
    if (el) {
      const rect = el.getBoundingClientRect();
      positionStyles = { top: rect.top + 20, left: rect.left };
    }
    // const rect = getVisibleSelectionRect(window) || {};
    const trimmedText = decoratedText.slice(1, decoratedText.length);
    return (
      <div style={{ display: 'inline' }}>
        <span style={styles.hashtag} data-offset-key={offsetKey}>
          {children}
        </span>
        <div
          style={{
            width: 50,
            position: 'absolute',
            background: '#EEE',
            ...positionStyles,
          }}
        >
          {trimmedText}
        </div>
      </div>
    );
  }
}

export class HashtagAutocomplete extends React.Component {
  props: {
    renderer: Function,
    editorState: EditorState,
  };
  render() {
    // When this is selected &&
    // When enter is pressed
    // save the entity
    const onEnter = () => {
      // insert the block
    };
    return this.props.renderer(
      HashtagAutocompleteComponent,
      this.props,
      onEnter,
    );
  }
}
//
// export class HashtagEntity extends React.Component {
//   state = {
//     value: '',
//   };
//
//   handleInputChange = (e: *) => {
//     e.stopPropagation();
//     this.setState({ value: e.target.value });
//   };
//
//   render() {
//     const { offsetKey, children } = this.props;
//     return (
//       <div style={{ display: 'inline' }}>
//         <span style={styles.hashtag} data-offset-key={offsetKey}>
//           {children}
//         </span>
//         <input
//           type="text"
//           onChange={this.handleInputChange}
//           value={this.state.value}
//         />
//         <div style={{ width: 50, position: 'absolute' }}>hi</div>
//       </div>
//     );
//   }
// }

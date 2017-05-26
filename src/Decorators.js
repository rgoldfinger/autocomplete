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

  render() {
    const { decoratedText, offsetKey, children, editorState } = this.props;
    const selection = editorState.getSelection();
    const rect = getVisibleSelectionRect(window);
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
            top: rect.top + 20,
            left: rect.left,
            background: '#EEE',
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

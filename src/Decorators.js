// @flow
import React from 'react';
import { EditorState } from 'draft-js';

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
};

export const HashtagEntity = (props: AutocompleteComponentProps) => {
  return (
    <span style={styles.hashtag} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

class HashtagAutocompleteComponent extends React.Component {
  props: AutocompleteComponentProps;
  handleReturn() {
    console.log('yo');
  }
  render() {
    const { decoratedText, offsetKey, children } = this.props;
    const trimmedText = decoratedText.slice(1, decoratedText.length);
    return (
      <div style={{ display: 'inline' }}>
        <span style={styles.hashtag} data-offset-key={offsetKey}>
          {children}
        </span>
        <div style={{ width: 50, position: 'absolute' }}>{trimmedText}</div>
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

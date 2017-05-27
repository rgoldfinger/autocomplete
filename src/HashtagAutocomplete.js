// @flow
import React from 'react';
import { EditorState } from 'draft-js';
import Autocomplete from './Autocomplete';
import type { AutocompleteComponentProps } from './Autocomplete';

const styles = {
  hashtag: {
    color: 'rgba(95, 184, 138, 1.0)',
  },
};

export const HashtagEntity = (props: AutocompleteComponentProps) => {
  return (
    <span style={styles.hashtag}>
      {props.children}
    </span>
  );
};

class HashtagAutocompleteComponent extends React.Component {
  props: AutocompleteComponentProps;
  handleReturn(editorState) {
    const {
      decoratedText,
      offsetKey,
      replaceAutocompleteWithBlock,
    } = this.props;

    const contentStateWithEntity = editorState
      .getCurrentContent()
      .createEntity('@', 'IMMUTABLE', {
        text: decoratedText,
      });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    replaceAutocompleteWithBlock(offsetKey, entityKey, decoratedText);
  }

  render() {
    const { decoratedText, offsetKey, children, isSelected } = this.props;
    if (!isSelected) {
      return (
        <span>
          {children}
        </span>
      );
    }

    const trimmedText = decoratedText.slice(1, decoratedText.length);
    return (
      <Autocomplete search={trimmedText} offsetKey={offsetKey}>
        <span style={styles.hashtag} data-offset-key={offsetKey}>
          {children}
        </span>
      </Autocomplete>
    );
  }
}

export class HashtagAutocomplete extends React.Component {
  props: {
    renderer: Function,
    editorState: EditorState,
  };
  render() {
    return this.props.renderer(HashtagAutocompleteComponent, this.props);
  }
}

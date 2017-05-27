// @flow
import React from 'react';
import { EditorState } from 'draft-js';
import Autocomplete from './Autocomplete';
import type { AutocompleteComponentProps } from './Autocomplete';

const styles = {
  person: {
    color: 'rgba(184, 184, 138, 1.0)',
  },
};

export const PersonEntity = (props: AutocompleteComponentProps) => {
  return (
    <span style={styles.person}>
      {props.children}
    </span>
  );
};

class PersonAutocompleteComponent extends React.Component {
  props: AutocompleteComponentProps;
  commit = editorState => {
    const { decoratedText, offsetKey, replaceTextWithBlock } = this.props;

    const contentStateWithEntity = editorState
      .getCurrentContent()
      .createEntity('@', 'IMMUTABLE', {
        text: decoratedText,
      });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    replaceTextWithBlock(offsetKey, entityKey, decoratedText);
  };

  handleReturn = editorState => {
    this.commit(editorState);
  };

  handleTab(editorState) {
    this.commit(editorState);
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
        <span style={styles.person} data-offset-key={offsetKey}>
          {children}
        </span>
      </Autocomplete>
    );
  }
}

export class PersonAutocomplete extends React.Component {
  props: {
    renderer: Function,
    editorState: EditorState,
  };
  render() {
    return this.props.renderer(PersonAutocompleteComponent, this.props);
  }
}

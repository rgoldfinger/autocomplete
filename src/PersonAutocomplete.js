// @flow
import React from 'react';
import { EditorState } from 'draft-js';
import Autocomplete from './Autocomplete';
import type { AutocompleteComponentProps } from './Autocomplete';

import data from './data/peopleData.json';

const styles = {
  person: {
    color: 'rgba(38, 138, 171, 1.0)',
  },
};

export const PersonEntity = (props: AutocompleteComponentProps) => {
  return (
    <span style={styles.person}>
      {props.children}
    </span>
  );
};

function PersonAutocompleteRow({ id, name }: { id: number, name: string }) {
  return <div>{name}</div>;
}

class PersonAutocompleteComponent extends React.Component {
  props: AutocompleteComponentProps;

  autocomplete: *;

  commit = () => {
    const {
      decoratedText,
      offsetKey,
      replaceTextWithBlock,
      editorState,
    } = this.props;
    const person = this.autocomplete.getSelectedDatum();

    const text = (person && `@${person.name}`) || decoratedText;

    const contentStateWithEntity = editorState
      .getCurrentContent()
      .createEntity('@', 'IMMUTABLE', { text });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    replaceTextWithBlock(offsetKey, entityKey, text);
  };

  handleReturn = () => {
    this.commit();
  };

  handleTab = () => {
    this.commit();
  };

  handleUpArrow = () => {
    this.autocomplete.handleUpArrow();
  };

  handleDownArrow = () => {
    this.autocomplete.handleDownArrow();
  };

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
      <Autocomplete
        ref={r => (this.autocomplete = r)}
        RowComponent={PersonAutocompleteRow}
        search={trimmedText}
        offsetKey={offsetKey}
        data={data
          .filter(d => {
            return trimmedText
              ? d.name.toLowerCase().startsWith(trimmedText.toLowerCase())
              : true;
          })
          .slice(0, 10)}
      >
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

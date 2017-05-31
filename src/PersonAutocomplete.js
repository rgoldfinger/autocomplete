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

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
function hashCode(str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function getImageUrl(name) {
  const code = Math.abs(hashCode(name));
  const gender = code % 2 >= 1 ? 'women' : 'men';
  const num = parseInt(code % 90, 10);

  return `https://randomuser.me/api/portraits/thumb/${gender}/${num}.jpg`;
}

export const PersonEntity = (props: AutocompleteComponentProps) => {
  return (
    <span style={styles.person}>
      {props.children}
    </span>
  );
};

function PersonAutocompleteRow({ id, name }: { id: number, name: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img
        alt={name}
        height={36}
        width={36}
        style={{ marginRight: 12, borderRadius: 36 }}
        src={getImageUrl(name)}
      />
      {name}
    </div>
  );
}

class PersonAutocompleteComponent extends React.Component {
  props: AutocompleteComponentProps;

  autocomplete: *;

  commit = (
    selectedItem?: {
      id: number,
      name: string,
    } = this.autocomplete.getSelectedDatum(),
  ) => {
    const {
      decoratedText,
      offsetKey,
      replaceTextWithBlock,
      editorState,
    } = this.props;

    const text = (selectedItem && `@${selectedItem.name}`) || decoratedText;

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
        onSelect={this.commit}
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
    autocompleteRenderer: Function,
    editorState: EditorState,
  };
  render() {
    return this.props.autocompleteRenderer(
      PersonAutocompleteComponent,
      this.props,
    );
  }
}

// @flow
import React from 'react';
import { EditorState } from 'draft-js';
import Autocomplete from './Autocomplete';
import type { AutocompleteComponentProps } from './Autocomplete';
import data from './data/hashtagData.json';

const styles = {
  hashtag: {
    color: 'rgba(95, 184, 138, 1.0)',
  },
  selected: {
    color: 'blue',
  },
};

export const HashtagEntity = (props: AutocompleteComponentProps) => {
  return (
    <span style={styles.hashtag}>
      {props.children}
    </span>
  );
};

function HashtagAutocompleteRow({
  id,
  tag,
  selected,
}: {
  id: number,
  tag: string,
  selected: boolean,
}) {
  return <div style={selected ? styles.selected : {}}>#{tag}</div>;
}

class HashtagAutocompleteComponent extends React.Component {
  props: AutocompleteComponentProps;
  autocomplete: *;

  commit = () => {
    const {
      decoratedText,
      offsetKey,
      replaceTextWithBlock,
      editorState,
    } = this.props;
    const hashtag = this.autocomplete.getSelectedDatum();

    const text = (hashtag && `#${hashtag.tag}`) || decoratedText;

    const contentStateWithEntity = editorState
      .getCurrentContent()
      .createEntity('#', 'IMMUTABLE', { text });
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
        <span style={styles.hashtag}>
          {children}
        </span>
      );
    }

    const trimmedText = decoratedText.slice(1, decoratedText.length);
    return (
      <Autocomplete
        RowComponent={HashtagAutocompleteRow}
        ref={r => (this.autocomplete = r)}
        search={trimmedText}
        offsetKey={offsetKey}
        data={data
          .filter(d => {
            return trimmedText
              ? d.tag.toLowerCase().startsWith(trimmedText.toLowerCase())
              : true;
          })
          .slice(0, 10)}
      >
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

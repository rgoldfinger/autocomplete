// @flow
import React from 'react';
import { EditorState } from 'draft-js';
import Autocomplete from './Autocomplete';
import type { AutocompleteComponentProps } from './Autocomplete';
import { uniqBy } from 'lodash';
import rawData from './data/hashtagData.json';
const data = uniqBy(rawData, d => d.tag);

const styles = {
  hashtag: {
    color: 'rgba(38, 138, 171, 1.0)',
  },
};

export const HashtagEntity = (props: AutocompleteComponentProps) => {
  return (
    <span style={styles.hashtag}>
      {props.children}
    </span>
  );
};

function HashtagAutocompleteRow({ id, tag }: { id: number, tag: string }) {
  return <div>#{tag}</div>;
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
    autocompleteRenderer: Function,
    editorState: EditorState,
  };
  render() {
    return this.props.autocompleteRenderer(HashtagAutocompleteComponent, this.props);
  }
}

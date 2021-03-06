// @flow
import React from 'react';
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
  return <div style={{ padding: '4px 0' }}>#{tag}</div>;
}

class HashtagAutocompleteComponent extends React.Component {
  props: AutocompleteComponentProps;
  autocomplete: *;

  commit = (
    selectedItem?: {
      id: number,
      tag: string,
    } = this.autocomplete.getSelectedDatum(),
  ) => {
    const { decoratedText, offsetKey, replaceTextWithBlock } = this.props;
    const text = (selectedItem && `#${selectedItem.tag}`) || decoratedText;
    replaceTextWithBlock(offsetKey, '#', text);
  };

  handleReturn = () => {
    this.commit();
  };

  handleTab = () => {
    this.commit();
  };

  handleSpace = () => {
    this.commit();
  };

  handleUpArrow = () => {
    this.autocomplete.handleUpArrow();
  };

  handleDownArrow = () => {
    this.autocomplete.handleDownArrow();
  };

  render() {
    const { decoratedText, offsetKey, children } = this.props;

    const trimmedText = decoratedText.slice(1, decoratedText.length);
    return (
      <Autocomplete
        RowComponent={HashtagAutocompleteRow}
        ref={r => (this.autocomplete = r)}
        onSelect={this.commit}
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
  };
  render() {
    return this.props.autocompleteRenderer(
      HashtagAutocompleteComponent,
      this.props,
    );
  }
}

// @flow
import React from 'react';
import { EditorState } from 'draft-js';
import Autocomplete from './Autocomplete';
import type { AutocompleteComponentProps } from './Autocomplete';
import data from './data/relationData.json';

const styles = {
  relation: {
    color: 'rgba(38, 138, 171, 1.0)',
  },
};

export const RelationEntity = (props: AutocompleteComponentProps) => {
  return (
    <span style={styles.relation}>
      {props.children}
    </span>
  );
};

function RelationAutocompleteRow({
  id,
  description,
}: {
  id: number,
  description: string,
}) {
  return <div>{description}</div>;
}

class RelationAutocompleteComponent extends React.Component {
  props: AutocompleteComponentProps;

  autocomplete: *;

  commit = () => {
    const {
      decoratedText,
      offsetKey,
      replaceTextWithBlock,
      editorState,
    } = this.props;
    const relation = this.autocomplete.getSelectedDatum();

    const text = (relation && `<>${relation.description}`) || decoratedText;

    const contentStateWithEntity = editorState
      .getCurrentContent()
      .createEntity('<>', 'IMMUTABLE', { text });
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

    const trimmedText = decoratedText.slice(2, decoratedText.length);
    return (
      <Autocomplete
        ref={r => (this.autocomplete = r)}
        RowComponent={RelationAutocompleteRow}
        search={trimmedText}
        offsetKey={offsetKey}
        data={data
          .filter(d => {
            return trimmedText
              ? d.description
                  .toLowerCase()
                  .startsWith(trimmedText.toLowerCase())
              : true;
          })
          .slice(0, 10)}
      >
        <span style={styles.relation} data-offset-key={offsetKey}>
          {children}
        </span>
      </Autocomplete>
    );
  }
}

export class RelationAutocomplete extends React.Component {
  props: {
    renderer: Function,
    editorState: EditorState,
  };
  render() {
    return this.props.renderer(RelationAutocompleteComponent, this.props);
  }
}

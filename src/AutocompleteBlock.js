// @flow
import React from 'react';
import { EditorState } from 'draft-js';

const Hashtag = (props: { text: string }) => {
  return (
    <div>
      {props.text}
    </div>
  );
};

const AutocompleteBlock = (props: { contentState: EditorState, block: * }) => {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0));
  const { text } = entity.getData();
  const type = entity.getType();
  let media;
  if (type === 'hashtag') {
    media = <Hashtag text={text} />;
  }
  return media;
};

export default AutocompleteBlock;

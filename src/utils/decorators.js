// @flow
import { RelationAutocomplete, RelationEntity } from '../RelationAutocomplete';
import { PersonAutocomplete, PersonEntity } from '../PersonAutocomplete';
import { HashtagEntity, HashtagAutocomplete } from '../HashtagAutocomplete';

import { CompositeDecorator } from 'draft-js';

const PERSON_REGEX = /@.*?(?=(?:[@#<])|$)/g;
const HASHTAG_REGEX = /#.*?(?=(?:[ ])|$)/g;
const RELATION_REGEX = /<>.*?(?=(?:[@#<])|$)/g;

const entityStrategy = trigger => (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === trigger
    );
  }, callback);
};

function hashtagStrategy(contentBlock, callback, contentState) {
  findWithRegex(HASHTAG_REGEX, contentBlock, contentState, callback);
}
function personStrategy(contentBlock, callback, contentState) {
  findWithRegex(PERSON_REGEX, contentBlock, contentState, callback);
}
function relationStrategy(contentBlock, callback, contentState) {
  findWithRegex(RELATION_REGEX, contentBlock, contentState, callback);
}

function findWithRegex(regex, contentBlock, contentState, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  const cursorPosition = contentState.getSelectionAfter().get('anchorOffset');
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    if (cursorPosition > start + matchArr[0].length) {
      callback(start, start + matchArr[0].length);
    } else {
      callback(start, cursorPosition + 1);
    }
  }
}

export const createCompositeDecorator = (Store: Object) =>
  new CompositeDecorator([
    {
      strategy: entityStrategy('@'),
      component: PersonEntity,
    },
    {
      strategy: personStrategy,
      component: PersonAutocomplete,
      props: Store,
    },
    {
      strategy: entityStrategy('#'),
      component: HashtagEntity,
    },
    {
      strategy: hashtagStrategy,
      component: HashtagAutocomplete,
      props: Store,
    },
    {
      strategy: entityStrategy('<>'),
      component: RelationEntity,
    },
    {
      strategy: relationStrategy,
      component: RelationAutocomplete,
      props: Store,
    },
  ]);

// @flow
import { RelationAutocomplete, RelationEntity } from '../RelationAutocomplete';
import { PersonAutocomplete, PersonEntity } from '../PersonAutocomplete';
import { HashtagEntity, HashtagAutocomplete } from '../HashtagAutocomplete';

import { CompositeDecorator } from 'draft-js';

const PERSON_REGEX = /@.*?(?=(?:[@#<])|$)/g;
const HASHTAG_REGEX = /#[\w\u0590-\u05ff]+/g;
const RELATION_REGEX = /<>.*?(?=(?:[@#<])|$)/g;
// const PERSON_REGEX = /@.*/g;
// const HASHTAG_REGEX = /#[\w\u0590-\u05ff]+/g;
// const RELATION_REGEX = /<>.*/g;

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
  findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}
function personStrategy(contentBlock, callback, contentState) {
  findWithRegex(PERSON_REGEX, contentBlock, callback);
}
function relationStrategy(contentBlock, callback, contentState) {
  findWithRegex(RELATION_REGEX, contentBlock, callback);
}

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
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

const triggers = {};

function getAutocompleteState(invalidate = true) {
  if (!invalidate) {
    return this.autocompleteState;
  }
  var type = null;
  var trigger = null;
  //Get range for latest hash tag trigger symbol.
  const tagRange = this.getAutocompleteRange(triggers.TAG_TRIGGER);
  //Get range for latest mention tag trigger symbol.
  const personRange = this.getAutocompleteRange(triggers.PERSON_TRIGGER);
  //Find what trigger is latest.
  if (!tagRange && !personRange) {
    this.autocompleteState = null;
    return null;
  }
  var range = null;
  if (!tagRange) {
    range = personRange;
    type = triggers.PERSON;
    trigger = triggers.PERSON_TRIGGER;
  }
  if (!personRange) {
    range = tagRange;
    type = triggers.TAG;
    trigger = triggers.TAG_TRIGGER;
  }
  if (!range) {
    range = tagRange.start > personRange.start ? tagRange : personRange;
    type = tagRange.start > personRange.start ? triggers.TAG : triggers.PERSON;
    trigger = tagRange.start > personRange.start
      ? triggers.TAG_TRIGGER
      : triggers.PERSON_TRIGGER;
  }
  //Get left and top coordinates of range.
  //This point will be used to draw suggestion list.
  const tempRange = window.getSelection().getRangeAt(0).cloneRange();
  tempRange.setStart(tempRange.startContainer, range.start);
  const rangeRect = tempRange.getBoundingClientRect();
  let [left, top] = [rangeRect.left, rangeRect.bottom];
  //Create autocompleteState.
  this.autocompleteState = {
    trigger, //Trigger symbol. “@” or “#”
    type, //Type of trigger. Can be TAG or PERSON.
    left, //The left point of range.
    top, //The top point of range.
    text: range.text, //Current text in selected range.
    selectedIndex: 0, //Selected index in list. 0 for new list.
  };
  return this.autocompleteState;
}

// Get range of possible mention or hashtag.
function getAutocompleteRange(trigger) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    return null;
  }
  if (this.hasEntityAtSelection()) {
    return null;
  }
  const range = selection.getRangeAt(0);
  let text = range.startContainer.textContent;
  text = text.substring(0, range.startOffset);
  const index = text.lastIndexOf(trigger);
  if (index === -1) {
    return null;
  }
  text = text.substring(index);
  return {
    text,
    start: index,
    end: range.startOffset,
  };
}

function hasEntityAtSelection() {
  const { editorState } = this.props;
  const selection = editorState.getSelection();
  //If there is no focus, return.
  if (!selection.getHasFocus()) {
    return false;
  }
  const contentState = editorState.getCurrentContent();
  const block = contentState.getBlockForKey(selection.getStartKey());
  return !!block.getEntityAt(selection.getStartOffset() - 1);
}

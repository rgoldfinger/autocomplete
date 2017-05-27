// @flow
import React from 'react';
import { EditorState } from 'draft-js';

export type AutocompleteComponentProps = {
  children: *,
  offsetKey: *,
  decoratedText: String,
  editorState: EditorState,
  isSelected: boolean,
  replaceTextWithBlock: (
    offsetKey: String,
    entityKey: String,
    decoratedText: String,
  ) => void,
};

type Props = {
  search: string,
  children: *,
  offsetKey: string,
  data: Object[],
  filterFn: (datum: Object, search: string) => boolean,
  RowComponent: *,
};

type State = {
  selectedIndex: number,
};

class Autocomplete extends React.Component {
  props: Props;

  state: State = {
    selectedIndex: 0,
  };

  componentDidMount() {
    // Not pretty, but there's no dom element at first render so we need this to position the element correctly
    this.forceUpdate();
  }

  componentWillReceiveProps(nextProps: Props) {
    // if (this.state.selectedIndex)
  }

  getSelectedDatum = () => {
    return this.props.data[this.state.selectedIndex];
  };

  handleUpArrow = () => {
    let newIndex = this.state.selectedIndex - 1;
    if (newIndex < 0) {
      newIndex = 0;
    }
    this.setState({ selectedIndex: newIndex });
  };

  handleDownArrow = () => {
    let newIndex = this.state.selectedIndex + 1;
    if (newIndex > this.props.data.length - 1) {
      newIndex = this.props.data.length;
    }
    this.setState({ selectedIndex: newIndex });
  };

  // https://github.com/facebook/draft-js/issues/45#issuecomment-189800287
  getSelectedBlockElement = () => {
    var selection = window.getSelection();
    if (selection.rangeCount === 0) {
      return null;
    }
    var node = selection.getRangeAt(0).startContainer;
    do {
      if (
        node.getAttribute &&
        node.getAttribute('data-offset-key') === this.props.offsetKey
      )
        return node;
      node = node.parentNode;
    } while (node != null);
    return null;
  };

  render() {
    const { data, search, children, RowComponent } = this.props;
    const { selectedIndex } = this.state;
    const el = this.getSelectedBlockElement();
    let positionStyles = {};
    if (el) {
      const rect = el.getBoundingClientRect();
      positionStyles = { top: rect.top + 20, left: rect.left };
    }

    return (
      <div style={{ display: 'inline' }}>
        {children}
        <div
          style={{
            minWidth: 50,
            position: 'absolute',
            background: '#EEE',
            ...positionStyles,
          }}
        >
          {data.map((d, i) => (
            <div
              key={d.id}
              style={{
                padding: 2,
                backgroundColor: selectedIndex === i
                  ? 'rgba(74, 144, 226, 1.0)'
                  : 'inherit',
              }}
            >
              <RowComponent {...d} search={search} />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Autocomplete;

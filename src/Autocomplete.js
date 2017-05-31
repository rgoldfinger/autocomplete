// @flow
import React from 'react';
import { EditorState } from 'draft-js';

export type AutocompleteComponentProps = {
  children: *,
  offsetKey: *,
  decoratedText: string,
  editorState: EditorState,
  isSelected: boolean,
  replaceTextWithBlock: (
    offsetKey: string,
    entityKey: string,
    decoratedText: string,
  ) => void,
};

type Props = {
  search: string,
  children: *,
  offsetKey: string,
  data: Object[],
  RowComponent: *,
  onSelect: (datum: *) => void,
};

type State = {
  selectedIndex: number,
};

class Autocomplete extends React.Component {
  props: Props;

  state: State = {
    selectedIndex: 0,
  };
  ref: *;

  componentDidMount() {
    // Not pretty, but there's no dom element at first render so we need this to position the element correctly
    this.forceUpdate();
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
    if (newIndex >= this.props.data.length - 1) {
      newIndex = this.props.data.length - 1;
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

  handleRowClick = (row: number) => {
    this.props.onSelect(this.props.data[row]);
  };

  highlightRow = (row: number) => {
    this.setState({ selectedIndex: row });
  };

  render() {
    const { data, search, children, RowComponent } = this.props;
    const { selectedIndex } = this.state;
    const el = this.getSelectedBlockElement();
    let positionStyles = {};
    if (el) {
      const rect = el.getBoundingClientRect();
      positionStyles = { top: rect.bottom + 4, left: rect.left };
    }

    return (
      <div style={{ display: 'inline' }}>
        {children}
        {data.length !== 0 &&
          <div
            style={{
              minWidth: 50,
              position: 'absolute',
              border: '0',
              boxShadow: '#555 0px 1px 3px 0px',
              borderRadius: 3,
              background: '#FFF',
              fontSize: 14,
              animation: 'pop-downwards .2s forwards linear',
              ...positionStyles,
            }}
          >
            {data.map((d, i) => (
              <div
                key={d.id}
                onClick={() => this.props.onSelect(d)}
                onMouseEnter={() => this.highlightRow(i)}
                style={{
                  padding: '2px 18px',
                  cursor: 'pointer',
                  color: selectedIndex === i ? '#EEE' : 'inherit',
                  border: '0',
                  borderTopRightRadius: i === 0 ? 3 : 0,
                  borderTopLeftRadius: i === 0 ? 3 : 0,
                  borderBottomRightRadius: i === data.length - 1 ? 3 : 0,
                  borderBottomLeftRadius: i === data.length - 1 ? 3 : 0,
                  backgroundColor: selectedIndex === i
                    ? 'rgba(38, 138, 171, 1.0)'
                    : '',
                }}
              >
                <RowComponent {...d} search={search} />
              </div>
            ))}
          </div>}
      </div>
    );
  }
}

export default Autocomplete;

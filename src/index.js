import React from 'react';
import ReactDOM from 'react-dom';
import AutocompleteEditor from './AutocompleteEditor';
import registerServiceWorker from './registerServiceWorker';

function App() {
  return (
    <div>
      <AutocompleteEditor />
      <AutocompleteEditor focus />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
